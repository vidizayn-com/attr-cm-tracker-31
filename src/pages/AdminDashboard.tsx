import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
    Building2, Users, Stethoscope, Activity, LogOut, Plus,
    Loader2, Search, RefreshCw, Microscope, Atom, Dna, Shield,
    TrendingUp, UserCheck, ClipboardList, Pencil, Save, FileBarChart,
    ChevronDown, ChevronUp, ShieldCheck, UserPlus, Menu, X
} from 'lucide-react';

import { STRAPI_URL } from '@/lib/strapiClient';

type Hospital = {
    id: number; documentId: string; name: string; address: string | null; email: string | null;
    doctorCount: number; doctorsBySpecialty: Record<string, number>;
    patientCount: number; patientsByStatus: Record<string, number>;
    poolPatientCount: number;
};

type Doctor = {
    id: number; documentId: string; fullName: string; specialty: string;
    phone: string | null; email: string | null; canInvite: boolean;
    institution: { id: number; name: string } | null;
};

type DashboardData = {
    summary: { totalInstitutions: number; totalDoctors: number; totalPatients: number; specialtyCounts: Record<string, number> };
    hospitals: Hospital[];
    doctors: Doctor[];
};

const specialtyColors: Record<string, string> = {
    Cardiology: 'bg-red-100 text-red-700 border-red-200',
    NuclearMedicine: 'bg-amber-100 text-amber-700 border-amber-200',
    Hematology: 'bg-purple-100 text-purple-700 border-purple-200',
    Genetics: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const specialtyIcons: Record<string, React.ReactNode> = {
    Cardiology: <Stethoscope className="w-3 h-3" />,
    NuclearMedicine: <Atom className="w-3 h-3" />,
    Hematology: <Microscope className="w-3 h-3" />,
    Genetics: <Dna className="w-3 h-3" />,
};

// ── Consent Report Tab Component ──
const ConsentReportTab = () => {
    const [reportData, setReportData] = useState<any>(null);
    const [reportLoading, setReportLoading] = useState(true);
    const [expandedDoctor, setExpandedDoctor] = useState<number | null>(null);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        setReportLoading(true);
        try {
            const adminToken = localStorage.getItem('admin_token');
            const res = await fetch(`${STRAPI_URL}/api/auth/panel/consent-report`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const data = await res.json();
            setReportData(data);
        } catch (e) {
            console.error('Failed to load consent report:', e);
            toast.error('Failed to load consent report');
        } finally {
            setReportLoading(false);
        }
    };

    if (reportLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[hsl(184,58%,44%)]" />
            </div>
        );
    }

    if (!reportData) return null;

    const consentingCount = reportData.doctors?.length || 0;
    const totalDoctorsVal = reportData.totalDoctors || 0;
    const nonConsentingCount = reportData.nonConsentingCount || 0;

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card !border-0 bg-white/70 hover:-translate-y-1 transition-transform">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Consenting</h4>
                            <p className="text-2xl font-bold text-emerald-600 leading-none">{consentingCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card !border-0 bg-white/70 hover:-translate-y-1 transition-transform">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Non-Consenting</h4>
                            <p className="text-2xl font-bold text-rose-600 leading-none">{nonConsentingCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card !border-0 bg-white/70 hover:-translate-y-1 transition-transform">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Doctors</h4>
                            <p className="text-2xl font-bold text-violet-600 leading-none">{totalDoctorsVal}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card !border-0 bg-white/70 hover:-translate-y-1 transition-transform">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Patients</h4>
                            <p className="text-2xl font-bold text-blue-600 leading-none">{reportData.totalPatients}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Doctor-Patient Cards list / Empty state */}
            {consentingCount === 0 ? (
                <Card className="rounded-2xl border-slate-200 bg-white/40 border">
                    <CardContent className="p-8 text-center">
                        <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-1">No Consenting Doctors</h3>
                        <p className="text-slate-400 text-sm">
                            No doctors have granted data sharing consent yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reportData.doctors.map((doctor: any) => (
                <Card key={doctor.id} className="glass-card !border-0 bg-white/50 mb-4 transition-all">
                    <CardHeader
                        className="cursor-pointer hover:bg-white/70 transition-colors rounded-t-2xl px-5 py-4"
                        onClick={() => setExpandedDoctor(expandedDoctor === doctor.id ? null : doctor.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    {doctor.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800">{doctor.fullName}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Badge variant="outline" className={`text-xs ${specialtyColors[doctor.specialty] || ''}`}>
                                            {doctor.specialty}
                                        </Badge>
                                        <span>{doctor.phone}</span>
                                        {doctor.email && <span>• {doctor.email}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                    {doctor.patientCount} patients
                                </Badge>
                                {expandedDoctor === doctor.id
                                    ? <ChevronUp className="w-5 h-5 text-gray-400" />
                                    : <ChevronDown className="w-5 h-5 text-gray-400" />
                                }
                            </div>
                        </div>
                    </CardHeader>
                    {expandedDoctor === doctor.id && (
                        <CardContent className="pt-0">
                            {doctor.patients.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-6 bg-slate-50/50 rounded-xl my-2 border border-slate-100">No patient records yet</p>
                            ) : (
                                <div className="rounded-[12px] overflow-hidden border border-slate-200/60 bg-white">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50 border-b border-slate-200/60 hover:bg-transparent">
                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase">Patient Name</TableHead>
                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase">Gender</TableHead>
                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase">Birth Date</TableHead>
                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase">Status</TableHead>
                                                <TableHead className="text-xs font-semibold text-slate-500 uppercase">Registered</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {doctor.patients.map((p: any) => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="font-medium text-sm">{p.firstName} {p.lastName}</TableCell>
                                                    <TableCell className="text-sm">{p.gender || '-'}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('tr-TR') : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            {p.statu || p.clinicalStatus || '-'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-500">
                                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('tr-TR') : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>
            ))}
                </div>
            )}
        </div>
    );
};

const InvitationsTab = () => {
    const [invitations, setInvitations] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>({
        totalSent: 0, pending: 0, accepted: 0, declined: 0, expired: 0, completed: 0, completionRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [filterInvStatus, setFilterInvStatus] = useState('All');
    const [filterRegStatus, setFilterRegStatus] = useState('All');
    const [sortField, setSortField] = useState('invitationDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        loadInvitations();
    }, [searchName, searchEmail, filterInvStatus, filterRegStatus]);

    const loadInvitations = async () => {
        setLoading(true);
        try {
            const adminToken = localStorage.getItem('admin_token');
            const params = new URLSearchParams();
            if (searchName) params.append('search', searchName);
            if (searchEmail) params.append('email', searchEmail);
            if (filterInvStatus && filterInvStatus !== 'All') params.append('invitationStatus', filterInvStatus);
            if (filterRegStatus && filterRegStatus !== 'All') params.append('registrationStatus', filterRegStatus);

            const res = await fetch(`${STRAPI_URL}/api/auth/doctor/admin/invitations?${params.toString()}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            const data = await res.json();
            setInvitations(data.invitations || []);
            setMetrics(data.metrics || {
                totalSent: 0, pending: 0, accepted: 0, declined: 0, expired: 0, completed: 0, completionRate: 0
            });
        } catch (e) {
            console.error('Failed to load invitations:', e);
            toast.error('Failed to load invitations');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedInvitations = useMemo(() => {
        const sorted = [...invitations];
        sorted.sort((a, b) => {
            let valA = a[sortField] || '';
            let valB = b[sortField] || '';

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [invitations, sortField, sortDirection]);

    const getInvitationStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Accepted': return 'bg-green-100 text-green-800 border-green-200';
            case 'Declined': return 'bg-red-100 text-red-800 border-red-200';
            case 'Expired': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getRegistrationStatusBadge = (status: string) => {
        switch (status) {
            case 'Not Started': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="glass-card !border-0 bg-white/70">
                    <CardContent className="p-4 text-center">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Sent</h4>
                        <p className="text-xl font-bold text-slate-800 leading-none">{metrics.totalSent}</p>
                    </CardContent>
                </Card>
                <Card className="glass-card !border-0 bg-white/70">
                    <CardContent className="p-4 text-center">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pending</h4>
                        <p className="text-xl font-bold text-yellow-600 leading-none">{metrics.pending}</p>
                    </CardContent>
                </Card>
                <Card className="glass-card !border-0 bg-white/70">
                    <CardContent className="p-4 text-center">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Accepted</h4>
                        <p className="text-xl font-bold text-green-600 leading-none">{metrics.accepted}</p>
                    </CardContent>
                </Card>
                <Card className="glass-card !border-0 bg-white/70">
                    <CardContent className="p-4 text-center">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Declined</h4>
                        <p className="text-xl font-bold text-red-600 leading-none">{metrics.declined}</p>
                    </CardContent>
                </Card>
                <Card className="glass-card !border-0 bg-white/70">
                    <CardContent className="p-4 text-center">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Completed</h4>
                        <p className="text-xl font-bold text-emerald-600 leading-none">{metrics.completed}</p>
                    </CardContent>
                </Card>
                <Card className="glass-card !border-0 bg-white/70">
                    <CardContent className="p-4 text-center">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rate</h4>
                        <p className="text-xl font-bold text-indigo-600 leading-none">{metrics.completionRate}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="glass-card flex flex-col md:flex-row gap-4 p-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by physician name..."
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
                        className="pl-9 bg-white/60 border-slate-200/60 rounded-xl focus:bg-white"
                    />
                </div>
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by email..."
                        value={searchEmail}
                        onChange={e => setSearchEmail(e.target.value)}
                        className="pl-9 bg-white/60 border-slate-200/60 rounded-xl focus:bg-white"
                    />
                </div>
                <div className="w-full md:w-44">
                    <Select value={filterInvStatus} onValueChange={setFilterInvStatus}>
                        <SelectTrigger className="bg-white/60 border-slate-200/60 rounded-xl"><SelectValue placeholder="Invitation Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Invitation Status</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                            <SelectItem value="Declined">Declined</SelectItem>
                            <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full md:w-44">
                    <Select value={filterRegStatus} onValueChange={setFilterRegStatus}>
                        <SelectTrigger className="bg-white/60 border-slate-200/60 rounded-xl"><SelectValue placeholder="Registration Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Reg Status</SelectItem>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button 
                    variant="outline"
                    onClick={() => {
                        setSearchName('');
                        setSearchEmail('');
                        setFilterInvStatus('All');
                        setFilterRegStatus('All');
                    }}
                    className="rounded-xl border-slate-200 w-full md:w-auto"
                >
                    Reset
                </Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[hsl(184,58%,44%)]" />
                </div>
            ) : (
                <div className="rounded-[12px] overflow-hidden border border-slate-200/60 bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-b border-slate-200/60 hover:bg-transparent">
                                <TableHead className="cursor-pointer select-none text-xs font-semibold text-slate-500 uppercase py-3" onClick={() => handleSort('invitingPhysician')}>
                                    Inviting Physician {sortField === 'invitingPhysician' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-xs font-semibold text-slate-500 uppercase py-3" onClick={() => handleSort('invitedPhysician')}>
                                    Invited Physician {sortField === 'invitedPhysician' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-xs font-semibold text-slate-500 uppercase py-3" onClick={() => handleSort('emailAddress')}>
                                    Email Address {sortField === 'emailAddress' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-xs font-semibold text-slate-500 uppercase py-3" onClick={() => handleSort('invitationDate')}>
                                    Invitation Date {sortField === 'invitationDate' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-xs font-semibold text-slate-500 uppercase py-3" onClick={() => handleSort('invitationStatus')}>
                                    Invitation Status {sortField === 'invitationStatus' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-xs font-semibold text-slate-500 uppercase py-3" onClick={() => handleSort('registrationStatus')}>
                                    Registration Status {sortField === 'registrationStatus' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-xs font-semibold text-slate-500 uppercase py-3" onClick={() => handleSort('registrationCompletedAt')}>
                                    Registration Completed At {sortField === 'registrationCompletedAt' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                                </TableHead>
                                <TableHead className="cursor-pointer select-none text-xs font-semibold text-slate-500 uppercase py-3" onClick={() => handleSort('lastActivity')}>
                                    Last Activity {sortField === 'lastActivity' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedInvitations.map((inv: any) => (
                                <TableRow key={inv.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-sm text-slate-800">{inv.invitingPhysician}</TableCell>
                                    <TableCell className="text-sm text-slate-800">{inv.invitedPhysician}</TableCell>
                                    <TableCell className="text-sm text-slate-600 font-mono">{inv.emailAddress}</TableCell>
                                    <TableCell className="text-sm text-slate-500">{formatDateTime(inv.invitationDate)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-full ${getInvitationStatusBadge(inv.invitationStatus)}`}>
                                            {inv.invitationStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-full ${getRegistrationStatusBadge(inv.registrationStatus)}`}>
                                            {inv.registrationStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">{formatDateTime(inv.registrationCompletedAt)}</TableCell>
                                    <TableCell className="text-sm text-slate-500">{formatDateTime(inv.lastActivity)}</TableCell>
                                </TableRow>
                            ))}
                            {sortedInvitations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                                        No invitations found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'reports', label: 'Consent Report', icon: FileBarChart },
    { id: 'invitations', label: 'Invitations', icon: UserPlus },
] as const;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'hospitals' | 'reports' | 'invitations'>('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Doctor form
    const [showDoctorForm, setShowDoctorForm] = useState(false);
    const [docName, setDocName] = useState('');
    const [docSpecialty, setDocSpecialty] = useState('Cardiology');
    const [docPhone, setDocPhone] = useState('');
    const [docEmail, setDocEmail] = useState('');
    const [docInstId, setDocInstId] = useState('');
    const [docCanInvite, setDocCanInvite] = useState(false);
    const [savingDoctor, setSavingDoctor] = useState(false);

    // Edit doctor
    const [showEditForm, setShowEditForm] = useState(false);
    const [editDoctorId, setEditDoctorId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editSpecialty, setEditSpecialty] = useState('Cardiology');
    const [editPhone, setEditPhone] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editInstId, setEditInstId] = useState('');
    const [editCanInvite, setEditCanInvite] = useState(false);
    const [savingEdit, setSavingEdit] = useState(false);

    // Hospital form
    const [showHospitalForm, setShowHospitalForm] = useState(false);
    const [hospName, setHospName] = useState('');
    const [hospAddress, setHospAddress] = useState('');
    const [hospEmail, setHospEmail] = useState('');
    const [savingHospital, setSavingHospital] = useState(false);

    // Edit hospital
    const [showEditHospital, setShowEditHospital] = useState(false);
    const [editHospId, setEditHospId] = useState<number | null>(null);
    const [editHospName, setEditHospName] = useState('');
    const [editHospAddress, setEditHospAddress] = useState('');
    const [editHospEmail, setEditHospEmail] = useState('');
    const [savingEditHosp, setSavingEditHosp] = useState(false);

    const adminToken = localStorage.getItem('admin_token');

    useEffect(() => {
        if (!adminToken) {
            navigate('/admin', { replace: true });
            return;
        }
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${STRAPI_URL}/api/auth/panel/dashboard`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('admin_token');
                    navigate('/admin', { replace: true });
                    return;
                }
                throw new Error('Failed to load');
            }
            const json = await res.json();
            setData(json);
        } catch (e: any) {
            toast.error(e?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        navigate('/admin', { replace: true });
    };

    const handleCreateDoctor = async () => {
        if (!docName || !docPhone || !docEmail) {
            toast.error('Name, phone and email are required');
            return;
        }
        setSavingDoctor(true);
        try {
            const res = await fetch(`${STRAPI_URL}/api/auth/panel/doctors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
                body: JSON.stringify({
                    fullName: docName,
                    specialty: docSpecialty,
                    phone: docPhone,
                    email: docEmail,
                    institutionId: docInstId ? Number(docInstId) : undefined,
                    canInvite: docCanInvite,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                const rawErr = json?.error?.message || json?.error || json?.message || 'Failed to create doctor';
                const cleanMsg = typeof rawErr === 'string' && (rawErr.includes('already exists') || rawErr.includes('already has this email'))
                    ? 'Bu e-posta adresine sahip bir hekim zaten sistemde kayıtlı.'
                    : String(rawErr);
                toast.error(cleanMsg);
                return;
            }
            toast.success(`Doctor "${json.doctor.fullName}" created!`);
            setShowDoctorForm(false);
            resetDoctorForm();
            loadDashboard();
        } catch (e: any) {
            toast.error(e?.message || 'Error');
        } finally {
            setSavingDoctor(false);
        }
    };

    const handleCreateHospital = async () => {
        if (!hospName) {
            toast.error('Hospital name is required');
            return;
        }
        setSavingHospital(true);
        try {
            const res = await fetch(`${STRAPI_URL}/api/auth/panel/institutions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
                body: JSON.stringify({ name: hospName, address: hospAddress, email: hospEmail }),
            });
            const json = await res.json();
            if (!res.ok) {
                toast.error(json?.error?.message || 'Failed to create hospital');
                return;
            }
            toast.success(`Hospital "${json.institution.name}" created!`);
            setShowHospitalForm(false);
            setHospName(''); setHospAddress(''); setHospEmail('');
            loadDashboard();
        } catch (e: any) {
            toast.error(e?.message || 'Error');
        } finally {
            setSavingHospital(false);
        }
    };

    const resetDoctorForm = () => {
        setDocName(''); setDocPhone(''); setDocEmail('');
        setDocSpecialty('Cardiology'); setDocInstId(''); setDocCanInvite(false);
    };

    const openEditHospital = (h: Hospital) => {
        setEditHospId(h.id);
        setEditHospName(h.name);
        setEditHospAddress(h.address || '');
        setEditHospEmail(h.email || '');
        setShowEditHospital(true);
    };

    const handleUpdateHospital = async () => {
        if (!editHospId || !editHospName) {
            toast.error('Hospital name is required');
            return;
        }
        setSavingEditHosp(true);
        try {
            const res = await fetch(`${STRAPI_URL}/api/auth/panel/institutions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
                body: JSON.stringify({
                    institutionId: editHospId,
                    name: editHospName,
                    address: editHospAddress,
                    email: editHospEmail,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                toast.error(json?.error?.message || 'Failed to update hospital');
                return;
            }
            toast.success(`Hospital "${json.institution.name}" updated!`);
            setShowEditHospital(false);
            loadDashboard();
        } catch (e: any) {
            toast.error(e?.message || 'Error');
        } finally {
            setSavingEditHosp(false);
        }
    };

    const openEditDoctor = (d: Doctor) => {
        setEditDoctorId(d.id);
        setEditName(d.fullName || '');
        setEditSpecialty(d.specialty || 'Cardiology');
        setEditPhone(d.phone ? String(d.phone).replace('+90', '') : '');
        setEditEmail(d.email || '');
        setEditInstId(d.institution ? String(d.institution.id) : '');
        setEditCanInvite(!!d.canInvite);
        setShowEditForm(true);
    };

    const handleUpdateDoctor = async () => {
        if (!editDoctorId || !editName || !editEmail) {
            toast.error('Name and email are required');
            return;
        }
        setSavingEdit(true);
        try {
            const res = await fetch(`${STRAPI_URL}/api/auth/panel/doctors`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
                body: JSON.stringify({
                    doctorId: editDoctorId,
                    fullName: editName,
                    specialty: editSpecialty,
                    phone: editPhone || undefined,
                    email: editEmail,
                    institutionId: editInstId ? Number(editInstId) : null,
                    canInvite: editCanInvite,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                const rawErr = json?.error?.message || json?.error || json?.message || 'Failed to update doctor';
                const cleanMsg = typeof rawErr === 'string' && (rawErr.includes('already exists') || rawErr.includes('already has this email'))
                    ? 'Bu e-posta adresine sahip bir hekim zaten sistemde kayıtlı.'
                    : String(rawErr);
                toast.error(cleanMsg);
                return;
            }
            toast.success(`Doctor "${json.doctor.fullName}" updated!`);
            setShowEditForm(false);
            loadDashboard();
        } catch (e: any) {
            toast.error(e?.message || 'Error');
        } finally {
            setSavingEdit(false);
        }
    };

    const filteredDoctors = useMemo(() => {
        if (!data) return [];
        if (!searchTerm) return data.doctors;
        const term = searchTerm.toLowerCase();
        return data.doctors.filter(d =>
            (d.fullName || '').toLowerCase().includes(term) ||
            (d.specialty || '').toLowerCase().includes(term) ||
            (d.phone ? String(d.phone).includes(term) : false) ||
            (d.institution?.name || '').toLowerCase().includes(term)
        );
    }, [data, searchTerm]);

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[hsl(184,58%,44%)]" />
            </div>
        );
    }

    const { summary, hospitals } = data;

    return (
        <div className="min-h-screen bg-[#f4f9f9] flex relative overflow-hidden font-sans w-full">
            {/* Ambient background */}
            <div className="ambient-shape shape-1" style={{ top: '-10%', right: '-5%', background: '#089bab', width: '600px', height: '600px' }}></div>
            <div className="ambient-shape shape-2" style={{ bottom: '-10%', left: '-5%', background: '#6366f1', opacity: 0.15 }}></div>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/60 p-6 z-20 shrink-0 h-screen sticky top-0 justify-between">
                <div className="flex flex-col gap-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#089bab] to-teal-600 flex items-center justify-center text-white shadow-md">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-md font-bold text-slate-800 leading-tight">Control Panel</h1>
                            <p className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">ATTR Navigator</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        {menuItems.map(item => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-[#089bab] to-teal-500 text-white shadow-md' 
                                            : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout Footer */}
                <Button 
                    variant="outline" 
                    onClick={handleLogout} 
                    className="w-full justify-start rounded-xl border-red-100 text-red-600 hover:!bg-red-600 hover:!text-white hover:!border-red-600 transition-all shadow-sm"
                >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
            </aside>

            {/* Mobile Sidebar (Slide-out drawer) */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200 lg:hidden">
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#089bab] to-teal-600 flex items-center justify-center text-white shadow-sm">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-slate-800">Control Panel</span>
                                </div>
                                <button 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-1.5">
                                {menuItems.map(item => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveTab(item.id);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
                                                isActive 
                                                    ? 'bg-gradient-to-r from-[#089bab] to-teal-500 text-white shadow-md' 
                                                    : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-800'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        <Button 
                            variant="outline" 
                            onClick={handleLogout} 
                            className="w-full justify-start rounded-xl border-red-100 text-red-600 hover:!bg-red-600 hover:!text-white hover:!border-red-600 transition-all shadow-sm"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </Button>
                    </aside>
                </>
            )}

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 overflow-y-auto z-10 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full">
                {/* Header / Top Bar */}
                <header className="glass-card flex items-center justify-between p-4 sm:p-5">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 bg-white/50 hover:bg-white lg:hidden shadow-sm transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div>
                            <h1 className="text-xl font-bold text-slate-800 capitalize leading-tight">
                                {menuItems.find(item => item.id === activeTab)?.label || activeTab}
                            </h1>
                            <p className="text-slate-500 text-xs hidden sm:block">Control Panel Management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={loadDashboard} className="rounded-xl border-slate-200 text-slate-600 hover:text-[#089bab] hover:bg-slate-50 transition-all shadow-sm h-10 px-4">
                            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                    </div>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card flex items-center gap-4 !p-5 hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Hospitals</h4>
                            <p className="text-2xl font-bold text-slate-800 leading-none">{summary.totalInstitutions}</p>
                        </div>
                    </div>
                    <div className="glass-card flex items-center gap-4 !p-5 hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Doctors</h4>
                            <p className="text-2xl font-bold text-slate-800 leading-none">{summary.totalDoctors}</p>
                        </div>
                    </div>
                    <div className="glass-card flex items-center gap-4 !p-5 hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Patients</h4>
                            <p className="text-2xl font-bold text-slate-800 leading-none">{summary.totalPatients}</p>
                        </div>
                    </div>
                    <div className="glass-card flex items-center gap-4 !p-5 hover:-translate-y-1 transition-transform">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Specialties</h4>
                            <p className="text-2xl font-bold text-slate-800 leading-none">{Object.keys(summary.specialtyCounts).length}</p>
                        </div>
                    </div>
                </div>


                {/* ── Overview Tab ── */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hospitals.map(h => (
                            <Card key={h.id} className="glass-card !border-0 hover:-translate-y-1 transition-transform">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                                            <Building2 className="w-5 h-5 text-[#089bab]" />
                                            {h.name}
                                        </CardTitle>
                                    </div>
                                    {h.address && <p className="text-xs text-slate-500 bg-slate-100/50 p-2 rounded-lg mt-2 inline-block border border-slate-200/50">{h.address}</p>}
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-3 mb-4 mt-2">
                                        <div className="bg-white/50 border border-slate-200/50 rounded-xl p-3 text-center shadow-sm">
                                            <p className="text-2xl font-bold text-[#089bab]">{h.doctorCount}</p>
                                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Doctors</p>
                                        </div>
                                        <div className="bg-white/50 border border-slate-200/50 rounded-xl p-3 text-center shadow-sm">
                                            <p className="text-2xl font-bold text-emerald-600">{h.patientCount}</p>
                                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Patients</p>
                                        </div>
                                        <div className="bg-white/50 border border-slate-200/50 rounded-xl p-3 text-center shadow-sm">
                                            <p className="text-2xl font-bold text-amber-500">{h.poolPatientCount}</p>
                                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Pool</p>
                                        </div>
                                    </div>
                                    {/* Specialty breakdown */}
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(h.doctorsBySpecialty).map(([sp, cnt]) => (
                                            <Badge key={sp} variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full bg-white/50 ${specialtyColors[sp] || 'border-slate-200 text-slate-600'}`}>
                                                {specialtyIcons[sp]} <span className="ml-1">{sp}: {cnt}</span>
                                            </Badge>
                                        ))}
                                    </div>
                                    {/* Patient status breakdown */}
                                    {Object.keys(h.patientsByStatus).length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1 opacity-80">
                                            {Object.entries(h.patientsByStatus).map(([st, cnt]) => (
                                                <span key={st} className="text-[10px] bg-white border border-slate-200 text-slate-600 rounded-full px-2 py-0.5 shadow-sm">
                                                    {st}: {cnt}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── Hospitals Tab ── */}
                {activeTab === 'hospitals' && (
                    <Card className="glass-card !border-0 flex-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="flex items-center gap-3 text-slate-800">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex justify-center items-center">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                Hospital Management
                            </CardTitle>
                            <Dialog open={showHospitalForm} onOpenChange={setShowHospitalForm}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-gradient-to-r from-[#089bab] to-teal-500 hover:from-teal-600 hover:to-teal-600 text-white rounded-xl shadow-md">
                                        <Plus className="w-4 h-4 mr-1" /> Add Hospital
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Add New Hospital</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3 mt-2">
                                        <Input placeholder="Hospital Name *" value={hospName} onChange={e => setHospName(e.target.value)} />
                                        <Textarea placeholder="Address" value={hospAddress} onChange={e => setHospAddress(e.target.value)} />
                                        <Input placeholder="Email" type="email" value={hospEmail} onChange={e => setHospEmail(e.target.value)} />
                                        <Button onClick={handleCreateHospital} disabled={savingHospital} className="w-full bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white rounded-xl">
                                            {savingHospital ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-1" />}
                                            Create Hospital
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead className="text-center">Doctors</TableHead>
                                        <TableHead className="text-center">Patients</TableHead>
                                        <TableHead className="text-center">Pool</TableHead>
                                        <TableHead className="text-center w-16">Edit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hospitals.map(h => (
                                        <TableRow key={h.id}>
                                            <TableCell className="font-medium">{h.name}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{h.address || '-'}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{h.doctorCount}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-green-100 text-green-700">{h.patientCount}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-amber-100 text-amber-700">{h.poolPatientCount}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="sm" onClick={() => openEditHospital(h)} className="h-8 w-8 p-0 hover:bg-teal-50">
                                                    <Pencil className="w-3.5 h-3.5 text-[hsl(184,58%,44%)]" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Edit Hospital Modal */}
                            <Dialog open={showEditHospital} onOpenChange={setShowEditHospital}>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Edit Hospital</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3 mt-2">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Hospital Name</label>
                                            <Input value={editHospName} onChange={e => setEditHospName(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Address</label>
                                            <Textarea value={editHospAddress} onChange={e => setEditHospAddress(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Email</label>
                                            <Input type="email" value={editHospEmail} onChange={e => setEditHospEmail(e.target.value)} />
                                        </div>
                                        <Button onClick={handleUpdateHospital} disabled={savingEditHosp} className="w-full bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white rounded-xl">
                                            {savingEditHosp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-1" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}

                {/* ── Doctors Tab ── */}
                {activeTab === 'doctors' && (
                    <Card className="glass-card !border-0 flex-1">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
                            <CardTitle className="flex items-center gap-3 text-slate-800">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex justify-center items-center">
                                    <Stethoscope className="w-5 h-5" />
                                </div>
                                Doctor Management
                                <Badge className="bg-white/60 text-slate-600 ml-2 shadow-sm border-slate-200">{filteredDoctors.length}</Badge>
                            </CardTitle>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Search doctors..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9 h-10 w-full sm:w-64 rounded-xl bg-white/50 border-slate-200/60 focus:bg-white transition-colors"
                                    />
                                </div>
                                <Dialog open={showDoctorForm} onOpenChange={setShowDoctorForm}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="h-10 bg-gradient-to-r from-[#089bab] to-teal-500 hover:from-teal-600 hover:to-teal-600 text-white rounded-xl shadow-md whitespace-nowrap">
                                            <Plus className="w-4 h-4 mr-1" /> Add Doctor
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Add New Doctor</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-3 mt-2">
                                            <Input placeholder="Full Name *" value={docName} onChange={e => setDocName(e.target.value)} />
                                            <Select value={docSpecialty} onValueChange={setDocSpecialty}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                                                    <SelectItem value="NuclearMedicine">Nuclear Medicine</SelectItem>
                                                    <SelectItem value="Hematology">Hematology</SelectItem>
                                                    <SelectItem value="Genetics">Genetics</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input placeholder="Phone (e.g. 5551234567) *" value={docPhone} onChange={e => setDocPhone(e.target.value)} />
                                            <Input placeholder="Email *" type="email" value={docEmail} onChange={e => setDocEmail(e.target.value)} />
                                            <Select value={docInstId} onValueChange={setDocInstId}>
                                                <SelectTrigger><SelectValue placeholder="Select Hospital" /></SelectTrigger>
                                                <SelectContent>
                                                    {hospitals.map(h => (
                                                        <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700">Invite Permission</label>
                                                    <p className="text-xs text-slate-400">Allow this doctor to invite new members</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setDocCanInvite(!docCanInvite)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${docCanInvite ? 'bg-[hsl(184,58%,44%)]' : 'bg-slate-300'
                                                        }`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${docCanInvite ? 'translate-x-6' : 'translate-x-1'
                                                        }`} />
                                                </button>
                                            </div>
                                            <Button onClick={handleCreateDoctor} disabled={savingDoctor} className="w-full bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white rounded-xl">
                                                {savingDoctor ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-1" />}
                                                Create Doctor
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Specialty</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Hospital</TableHead>
                                            <TableHead className="text-center w-20">Invite</TableHead>
                                            <TableHead className="text-center w-16">Edit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDoctors.map(d => (
                                            <TableRow key={d.id}>
                                                <TableCell className="font-medium">{d.fullName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`text-xs ${specialtyColors[d.specialty] || ''}`}>
                                                        {specialtyIcons[d.specialty]} {d.specialty}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm font-mono text-slate-600">{d.phone}</TableCell>
                                                <TableCell className="text-sm text-slate-500">{d.email || '-'}</TableCell>
                                                <TableCell>
                                                    {d.institution ? (
                                                        <Badge variant="secondary" className="text-xs">
                                                            <Building2 className="w-3 h-3 mr-1" /> {d.institution.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {d.canInvite ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                                                            <UserPlus className="w-3 h-3 mr-0.5" /> Yes
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="ghost" size="sm" onClick={() => openEditDoctor(d)} className="h-8 w-8 p-0 hover:bg-teal-50">
                                                        <Pencil className="w-3.5 h-3.5 text-[hsl(184,58%,44%)]" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredDoctors.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                                                    No doctors found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Edit Doctor Modal */}
                            <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Edit Doctor</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3 mt-2">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Full Name</label>
                                            <Input value={editName} onChange={e => setEditName(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Specialty</label>
                                            <Select value={editSpecialty} onValueChange={setEditSpecialty}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                                                    <SelectItem value="NuclearMedicine">Nuclear Medicine</SelectItem>
                                                    <SelectItem value="Hematology">Hematology</SelectItem>
                                                    <SelectItem value="Genetics">Genetics</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Phone *</label>
                                            <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Email *</label>
                                            <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Hospital</label>
                                            <Select value={editInstId} onValueChange={setEditInstId}>
                                                <SelectTrigger><SelectValue placeholder="Select Hospital" /></SelectTrigger>
                                                <SelectContent>
                                                    {hospitals.map(h => (
                                                        <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <div>
                                                <label className="text-sm font-medium text-slate-700">Invite Permission</label>
                                                <p className="text-xs text-slate-400">Allow this doctor to invite new members</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEditCanInvite(!editCanInvite)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editCanInvite ? 'bg-[hsl(184,58%,44%)]' : 'bg-slate-300'
                                                    }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editCanInvite ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </div>
                                        <Button onClick={handleUpdateDoctor} disabled={savingEdit} className="w-full bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white rounded-xl">
                                            {savingEdit ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-1" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}

                {/* ── Reports Tab ── */}
                {activeTab === 'reports' && (
                    <Card className="glass-card !border-0 flex-1">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-slate-800">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex justify-center items-center">
                                    <FileBarChart className="w-5 h-5" />
                                </div>
                                Consent & Analytics Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ConsentReportTab />
                        </CardContent>
                    </Card>
                )}

                {/* ── Invitations Tab ── */}
                {activeTab === 'invitations' && (
                    <Card className="glass-card !border-0 flex-1">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-slate-800">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex justify-center items-center">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                Physician Invitation Tracking
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InvitationsTab />
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
