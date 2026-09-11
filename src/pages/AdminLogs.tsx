import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, User, Loader2, ClipboardList, Search, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { STRAPI_URL } from '@/lib/strapiClient';

// This page is deliberately NOT linked from the Control Panel nav and is
// gated by its own simple credential pair (not the admin_token JWT used
// elsewhere in /admin) — reachable only by direct URL, per how it was
// requested. Credentials are cached per-tab in sessionStorage, not
// localStorage, so they don't silently persist across browser sessions.
const SITE_GUARD_STORAGE_KEY = 'admin_logs_site_guard';

type LogRow = {
  id: number;
  event_type: string;
  actor_email: string;
  description: string;
  patient_id: number | null;
  created_at: string;
};

// event_type -> category label/color. Purely a display concern — the
// backend keeps event_type as the one freeform field it's always been in
// audit_logs, same as every other consumer of that table in this codebase.
const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  PATIENT_REGISTERED: { label: 'Hasta Kaydı', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  PATIENT_ASSIGNED_TO_SELF: { label: 'Hasta Atama', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  PATIENT_ASSIGNED: { label: 'Hasta Atama', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ASSIGNMENT_RETURNED: { label: 'Hasta Atama', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ASSIGNMENT_REJECTED: { label: 'Atama Reddi', color: 'bg-red-100 text-red-700 border-red-200' },
  PRIMARY_CARDIOLOGIST_UPDATED: { label: 'Kardiyolog Değişikliği', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  INVITATION_SENT: { label: 'Hekim Daveti', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  RE_INVITATION_SENT: { label: 'Hekim Daveti', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  REGISTRATION_STARTED: { label: 'Hekim Daveti', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  REGISTRATION_COMPLETED: { label: 'Hekim Daveti', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  INVITATION_DECLINED: { label: 'Hekim Daveti', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

function categoryFor(eventType: string) {
  return CATEGORY_MAP[eventType] || { label: eventType, color: 'bg-slate-100 text-slate-600 border-slate-200' };
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PAGE_SIZE = 50;

const AdminLogs = () => {
  const [authHeader, setAuthHeader] = useState<string | null>(() => sessionStorage.getItem(SITE_GUARD_STORAGE_KEY));
  const [guardUser, setGuardUser] = useState('');
  const [guardPass, setGuardPass] = useState('');
  const [guardError, setGuardError] = useState('');
  const [checkingGuard, setCheckingGuard] = useState(false);

  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [actorFilter, setActorFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchLogs = async (header: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (categoryFilter !== 'all') params.set('eventType', categoryFilter);
      if (actorFilter.trim()) params.set('actorEmail', actorFilter.trim());
      if (patientFilter.trim()) params.set('patientId', patientFilter.trim());

      const res = await fetch(`${STRAPI_URL}/api/auth/panel/logs?${params.toString()}`, {
        headers: { Authorization: header },
      });

      if (res.status === 401) {
        sessionStorage.removeItem(SITE_GUARD_STORAGE_KEY);
        setAuthHeader(null);
        setGuardError('Kullanıcı adı veya şifre hatalı.');
        return;
      }
      if (!res.ok) throw new Error('Kayıtlar yüklenemedi.');
      const data = await res.json();
      setRows(data.rows || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      toast.error(e?.message || 'Kayıtlar yüklenemedi.');
    } finally {
      setLoading(false);
      setCheckingGuard(false);
    }
  };

  useEffect(() => {
    if (authHeader) fetchLogs(authHeader);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader, page, categoryFilter]);

  const handleUnlock = () => {
    if (!guardUser || !guardPass) {
      setGuardError('Kullanıcı adı ve şifre gerekli.');
      return;
    }
    setGuardError('');
    setCheckingGuard(true);
    const header = `Basic ${btoa(`${guardUser}:${guardPass}`)}`;
    sessionStorage.setItem(SITE_GUARD_STORAGE_KEY, header);
    setAuthHeader(header);
  };

  const handleSearch = () => {
    setPage(1);
    if (authHeader) fetchLogs(authHeader);
  };

  const handleLock = () => {
    sessionStorage.removeItem(SITE_GUARD_STORAGE_KEY);
    setAuthHeader(null);
    setGuardUser('');
    setGuardPass('');
    setRows([]);
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
            <h1 className="text-[1.6rem] font-bold text-slate-800 mb-2 leading-tight">Restricted Access</h1>
            <p className="text-slate-500 text-sm">Bu sayfaya erişmek için kimlik bilgilerinizi girin.</p>
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#089bab] to-teal-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Activity Logs</h1>
              <p className="text-slate-500 text-xs">Hekimlerin hasta işlemlerinin zaman damgalı kaydı</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLock} className="rounded-xl">
            <LogOut className="w-4 h-4 mr-1.5" /> Kilitle
          </Button>
        </div>

        <Card className="mb-4 rounded-2xl border-none shadow-md">
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">Kategori</label>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="PATIENT_REGISTERED">Hasta Kaydı</SelectItem>
                  <SelectItem value="PATIENT_ASSIGNED_TO_SELF">Hasta Atama (Kendine)</SelectItem>
                  <SelectItem value="PATIENT_ASSIGNED">Hasta Atama</SelectItem>
                  <SelectItem value="ASSIGNMENT_RETURNED">Atama İadesi</SelectItem>
                  <SelectItem value="ASSIGNMENT_REJECTED">Atama Reddi</SelectItem>
                  <SelectItem value="PRIMARY_CARDIOLOGIST_UPDATED">Kardiyolog Değişikliği</SelectItem>
                  <SelectItem value="INVITATION_SENT">Hekim Daveti</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">Hekim (email)</label>
              <Input
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-10 rounded-xl"
                placeholder="doctor@hospital.com"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-slate-500 mb-1">Hasta ID</label>
              <Input
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-10 rounded-xl"
                placeholder="78"
              />
            </div>
            <Button onClick={handleSearch} variant="outline" className="h-10 rounded-xl">
              <Search className="w-4 h-4 mr-1.5" /> Ara
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-md overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
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
                      <TableHead className="whitespace-nowrap">Zaman</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Hekim</TableHead>
                      <TableHead>Hasta</TableHead>
                      <TableHead>Açıklama</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const cat = categoryFor(row.event_type);
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="whitespace-nowrap text-xs text-slate-500">{formatTimestamp(row.created_at)}</TableCell>
                          <TableCell><Badge className={`${cat.color} text-xs`}>{cat.label}</Badge></TableCell>
                          <TableCell className="text-sm text-slate-700 whitespace-nowrap">{row.actor_email}</TableCell>
                          <TableCell className="text-sm text-slate-700 whitespace-nowrap">{row.patient_id ? `#${row.patient_id}` : '-'}</TableCell>
                          <TableCell className="text-sm text-slate-600 min-w-[280px]">{row.description}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-500">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
