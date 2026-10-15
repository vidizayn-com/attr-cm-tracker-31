import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, User, Loader2, ClipboardList, Search, ChevronLeft, ChevronRight, ChevronDown, LogOut, RefreshCw, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { STRAPI_URL } from '@/lib/strapiClient';

// Activity log: who did what in the system and what the system itself ran.
//
// Deliberately NOT part of the Control Panel: separate URL, no link from any
// admin screen, and it does not accept the Control Panel (admin_token) login.
// It has its own credential pair that the backend reads from its environment
// (ADMIN_LOGS_USER / ADMIN_LOGS_PASS); nothing secret lives in this repo (it is
// public). The resulting Authorization header is cached per tab in
// sessionStorage, not localStorage, so it does not outlive the browser tab.
const SITE_GUARD_STORAGE_KEY = 'admin_logs_site_guard';
const PAGE_SIZE = 50;

// Basic credentials may contain non-Latin1 characters (e.g. Turkish letters),
// which btoa() alone rejects; the backend decodes the pair as UTF-8.
const toBasicHeader = (user: string, pass: string) =>
  `Basic ${btoa(unescape(encodeURIComponent(`${user}:${pass}`)))}`;

type LogRow = {
  id: number;
  event_type: string;
  actor_email: string;
  actor_type: string | null;
  actor_id: string | null;
  description: string;
  category: string | null;
  severity: string | null;
  patient_id: number | null;
  patient_document_id: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  duration_ms: number | null;
  ip: string | null;
  details: string | null;
  created_at: string;
};

type LogsResponse = {
  rows: LogRow[];
  total: number;
  counts: Record<string, number>;
};

const TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'user', label: 'Kullanıcı işlemleri' },
  { key: 'auth', label: 'Giriş & güvenlik' },
  { key: 'view', label: 'Hasta görüntüleme' },
  { key: 'system', label: 'Sistem & işler' },
  { key: 'email', label: 'E-postalar' },
  { key: 'error', label: 'Hatalar & uyarılar' },
];

const CATEGORY: Record<string, { label: string; color: string }> = {
  auth: { label: 'Giriş', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  security: { label: 'Güvenlik', color: 'bg-red-100 text-red-700 border-red-200' },
  patient: { label: 'Hasta', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  assignment: { label: 'Atama', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  clinical: { label: 'Klinik veri', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  invitation: { label: 'Davet', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  profile: { label: 'Profil', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  admin: { label: 'Yönetici', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  export: { label: 'Dışa aktarma', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  view: { label: 'Görüntüleme', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  email: { label: 'E-posta', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  job: { label: 'Sistem işi', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  system: { label: 'Sistem', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  marker: { label: 'İşaretçi', color: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
  other: { label: 'Diğer', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const ACTOR: Record<string, { label: string; color: string }> = {
  doctor: { label: 'Hekim', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  admin: { label: 'Yönetici', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  system: { label: 'Sistem', color: 'bg-zinc-50 text-zinc-600 border-zinc-200' },
  anonymous: { label: 'Anonim', color: 'bg-red-50 text-red-600 border-red-200' },
  monitor: { label: 'İzleyici', color: 'bg-sky-50 text-sky-700 border-sky-200' },
};

const LIVE_OPTIONS = [
  { value: '5', label: '5 sn' },
  { value: '15', label: '15 sn' },
  { value: '30', label: '30 sn' },
  { value: '60', label: '60 sn' },
];

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function statusChip(row: LogRow) {
  if (row.status_code != null) {
    const c = row.status_code;
    const color = c >= 500 ? 'bg-red-100 text-red-700' : c >= 400 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
    return <Badge className={`${color} text-xs font-mono`}>{c}</Badge>;
  }
  if (row.severity === 'error') return <Badge className="bg-red-100 text-red-700 text-xs">hata</Badge>;
  if (row.severity === 'warn') return <Badge className="bg-amber-100 text-amber-700 text-xs">uyarı</Badge>;
  return <span className="text-slate-300">—</span>;
}

function parseDetails(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

type Filters = { actor: string; patient: string; q: string; status: string; from: string; to: string };
const EMPTY_FILTERS: Filters = { actor: '', patient: '', q: '', status: 'all', from: '', to: '' };

const AdminLogs = () => {
  const [authHeader, setAuthHeader] = useState<string | null>(() => sessionStorage.getItem(SITE_GUARD_STORAGE_KEY));
  const [guardUser, setGuardUser] = useState('');
  const [guardPass, setGuardPass] = useState('');
  const [guardError, setGuardError] = useState('');
  const [checkingGuard, setCheckingGuard] = useState(false);

  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [group, setGroup] = useState('all');
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState('15');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const lock = useCallback((message = '') => {
    sessionStorage.removeItem(SITE_GUARD_STORAGE_KEY);
    setAuthHeader(null);
    setRows([]);
    setLive(false);
    setGuardError(message);
    setCheckingGuard(false);
  }, []);

  const fetchLogs = useCallback(async (header: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), group });
      if (applied.actor.trim()) params.set('actorEmail', applied.actor.trim());
      if (applied.patient.trim()) params.set('patientId', applied.patient.trim());
      if (applied.q.trim()) params.set('q', applied.q.trim());
      if (applied.status !== 'all') params.set('status', applied.status);
      if (applied.from) params.set('dateFrom', new Date(`${applied.from}T00:00:00`).toISOString());
      if (applied.to) params.set('dateTo', new Date(`${applied.to}T23:59:59.999`).toISOString());

      const res = await fetch(`${STRAPI_URL}/api/auth/panel/logs?${params.toString()}`, { headers: { Authorization: header } });

      if (res.status === 401) return lock('Kullanıcı adı veya şifre hatalı.');
      if (res.status === 429) return lock('Çok fazla hatalı deneme. Bir süre sonra tekrar deneyin.');
      if (res.status === 503) return lock('Log izleme bu sunucuda kapalı: ADMIN_LOGS_USER / ADMIN_LOGS_PASS tanımlı değil.');
      if (!res.ok) throw new Error('Kayıtlar yüklenemedi.');

      const data: LogsResponse = await res.json();
      setRows(data.rows || []);
      setTotal(data.total || 0);
      setCounts(data.counts || {});
      setUpdatedAt(new Date());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kayıtlar yüklenemedi.');
    } finally {
      setLoading(false);
      setCheckingGuard(false);
    }
  }, [page, group, applied, lock]);

  useEffect(() => {
    if (authHeader) fetchLogs(authHeader);
  }, [authHeader, fetchLogs]);

  // Live monitoring: re-fetch the current view on a timer, without the spinner.
  const latest = useRef({ authHeader, fetchLogs });
  latest.current = { authHeader, fetchLogs };
  useEffect(() => {
    if (!live || !authHeader) return;
    const id = window.setInterval(() => {
      const { authHeader: h, fetchLogs: f } = latest.current;
      if (h) f(h, true);
    }, Number(liveSeconds) * 1000);
    return () => window.clearInterval(id);
  }, [live, liveSeconds, authHeader]);

  const handleUnlock = () => {
    if (!guardUser || !guardPass) {
      setGuardError('Kullanıcı adı ve şifre gerekli.');
      return;
    }
    setGuardError('');
    setCheckingGuard(true);
    const header = toBasicHeader(guardUser, guardPass);
    sessionStorage.setItem(SITE_GUARD_STORAGE_KEY, header);
    setAuthHeader(header);
  };

  const handleSearch = () => {
    setPage(1);
    setApplied(draft);
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  };

  const pickGroup = (key: string) => {
    setGroup(key);
    setPage(1);
    setExpanded(null);
  };

  if (!authHeader) {
    return (
      <div className="min-h-screen bg-[#f4f9f9] relative overflow-hidden font-sans flex items-center justify-center p-4">
        <div className="ambient-shape shape-1" style={{ top: '-10%', right: '-5%', background: '#089bab', width: '600px', height: '600px' }}></div>
        <div className="ambient-shape shape-2" style={{ bottom: '-10%', left: '-5%', background: '#6366f1', opacity: 0.15 }}></div>

        <div className="glass-card w-full max-w-md relative z-10 !p-8 shadow-2xl border-white/40 border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-[#089bab] to-teal-600 text-white shadow-md mx-auto">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h1 className="text-[1.6rem] font-bold text-slate-800 mb-2 leading-tight">Activity Monitor</h1>
            <p className="text-slate-500 text-sm">Bu sayfaya erişmek için izleme kimlik bilgilerinizi girin.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-slate-600 font-medium mb-2 text-sm">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={guardUser}
                  onChange={(e) => setGuardUser(e.target.value)}
                  className="pl-10 h-12 bg-white/70 border-slate-200/60 text-slate-800 placeholder:text-slate-400 rounded-xl focus:border-[#089bab] focus:ring-[#089bab]/20 transition-all font-medium"
                  placeholder="Username"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  value={guardPass}
                  onChange={(e) => setGuardPass(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  className="pl-10 h-12 bg-white/70 border-slate-200/60 text-slate-800 placeholder:text-slate-400 rounded-xl focus:border-[#089bab] focus:ring-[#089bab]/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            {guardError && <p className="text-red-600 text-sm">{guardError}</p>}
            <Button
              onClick={handleUnlock}
              disabled={checkingGuard}
              className="w-full h-12 bg-gradient-to-r from-[#089bab] to-teal-500 hover:from-teal-600 hover:to-teal-600 text-white text-lg font-semibold rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              {checkingGuard ? 'Checking...' : 'Unlock'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f9f9] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#089bab] to-teal-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Activity Monitor</h1>
              <p className="text-slate-500 text-xs">Kim ne yaptı, sistem ne çalıştırdı — zaman damgalı kayıt</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <Radio className={`w-4 h-4 ${live ? 'text-emerald-500' : 'text-slate-400'}`} />
              Canlı izle
              <Switch checked={live} onCheckedChange={setLive} />
            </label>
            {live && (
              <Select value={liveSeconds} onValueChange={setLiveSeconds}>
                <SelectTrigger className="h-9 w-24 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  {LIVE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={() => fetchLogs(authHeader)} className="rounded-xl">
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Yenile
            </Button>
            <Button variant="outline" size="sm" onClick={() => lock()} className="rounded-xl">
              <LogOut className="w-4 h-4 mr-1.5" /> Kilitle
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((t) => {
            const active = group === t.key;
            return (
              <Button
                key={t.key}
                size="sm"
                variant={active ? 'default' : 'outline'}
                onClick={() => pickGroup(t.key)}
                className={`rounded-xl ${active ? 'bg-[#089bab] hover:bg-[#089bab] text-white' : ''}`}
              >
                {t.label}
                <span className={`ml-2 text-xs rounded-full px-1.5 py-0.5 ${active ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>{counts[t.key] ?? 0}</span>
              </Button>
            );
          })}
        </div>

        <Card className="mb-4 rounded-2xl border-none shadow-md">
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[170px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">Kullanıcı (e-posta)</label>
              <Input value={draft.actor} onChange={(e) => setDraft({ ...draft, actor: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="h-10 rounded-xl" placeholder="doctor@hospital.com" />
            </div>
            <div className="w-28">
              <label className="block text-xs font-medium text-slate-500 mb-1">Hasta ID</label>
              <Input value={draft.patient} onChange={(e) => setDraft({ ...draft, patient: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="h-10 rounded-xl" placeholder="78" />
            </div>
            <div className="flex-1 min-w-[170px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">Metin ara</label>
              <Input value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="h-10 rounded-xl" placeholder="açıklama, yol veya kullanıcı" />
            </div>
            <div className="w-36">
              <label className="block text-xs font-medium text-slate-500 mb-1">Başlangıç</label>
              <Input type="date" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} className="h-10 rounded-xl" />
            </div>
            <div className="w-36">
              <label className="block text-xs font-medium text-slate-500 mb-1">Bitiş</label>
              <Input type="date" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className="h-10 rounded-xl" />
            </div>
            <div className="w-36">
              <label className="block text-xs font-medium text-slate-500 mb-1">Sonuç</label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="ok">Başarılı</SelectItem>
                  <SelectItem value="error">Başarısız</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} variant="outline" className="h-10 rounded-xl">
              <Search className="w-4 h-4 mr-1.5" /> Ara
            </Button>
            <Button onClick={handleReset} variant="ghost" className="h-10 rounded-xl text-slate-500">Sıfırla</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md overflow-hidden">
          <CardContent className="p-0">
            {loading && rows.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yükleniyor...
              </div>
            ) : rows.length === 0 ? (
              <div className="py-16 text-center text-slate-400">Kayıt bulunamadı.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="whitespace-nowrap">Zaman</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Hasta</TableHead>
                      <TableHead>Olay</TableHead>
                      <TableHead className="text-center">Sonuç</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const cat = CATEGORY[row.category || 'other'] || CATEGORY.other;
                      const actor = ACTOR[row.actor_type || ''];
                      const open = expanded === row.id;
                      const details = parseDetails(row.details);
                      return (
                        <React.Fragment key={row.id}>
                          <TableRow className="cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(open ? null : row.id)}>
                            <TableCell className="text-slate-400"><ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} /></TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-slate-500">{formatTimestamp(row.created_at)}</TableCell>
                            <TableCell><Badge className={`${cat.color} text-xs`}>{cat.label}</Badge></TableCell>
                            <TableCell className="text-sm text-slate-700 whitespace-nowrap">
                              {actor && <Badge className={`${actor.color} text-[10px] mr-1.5`}>{actor.label}</Badge>}
                              {row.actor_type === 'system' ? '' : (row.actor_type === 'anonymous' && row.actor_email === 'anonim' ? (row.ip || '') : row.actor_email)}
                            </TableCell>
                            <TableCell className="text-sm text-slate-700 whitespace-nowrap">{row.patient_id ? `#${row.patient_id}` : '-'}</TableCell>
                            <TableCell className="text-sm text-slate-600 min-w-[300px]">{row.description}</TableCell>
                            <TableCell className="text-center">{statusChip(row)}</TableCell>
                          </TableRow>
                          {open && (
                            <TableRow className="bg-slate-50/70">
                              <TableCell></TableCell>
                              <TableCell colSpan={6} className="py-3">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
                                  {([
                                    ['Olay kodu', row.event_type],
                                    ['İstek', row.method && row.path ? `${row.method} ${row.path}` : null],
                                    ['HTTP durumu', row.status_code],
                                    ['Süre', row.duration_ms != null ? `${row.duration_ms} ms` : null],
                                    ['IP', row.ip],
                                    ['Kullanıcı kimliği', row.actor_id],
                                    ['Hasta (belge kimliği)', row.patient_document_id],
                                    ['Önem', row.severity],
                                    ['Kayıt no', row.id],
                                  ] as [string, string | number | null][]).filter(([, v]) => v !== null && v !== '').map(([k, v]) => (
                                    <div key={k} className="flex gap-2"><dt className="text-slate-400 w-36 shrink-0">{k}</dt><dd className="text-slate-700 font-mono break-all">{String(v)}</dd></div>
                                  ))}
                                </dl>
                                {details && (
                                  <pre className="mt-3 p-3 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 overflow-x-auto">{JSON.stringify(details, null, 2)}</pre>
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-sm text-slate-500">
          <span>
            {total} kayıt{updatedAt ? ` · son güncelleme ${updatedAt.toLocaleTimeString('tr-TR')}` : ''}{live ? ` · her ${liveSeconds} sn yenileniyor` : ''}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span>{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
