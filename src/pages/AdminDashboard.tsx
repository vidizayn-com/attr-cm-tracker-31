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
    ChevronDown, ChevronUp, ShieldCheck, UserPlus
} from 'lucide-react';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

type Hospital = {
    id: number; documentId: string; name: string; address: string | null; email: string | null;
    doctorCount: number; doctorsBySpecialty: Record<string, number>;
    patientCount: number; patientsByStatus: Record<string, number>;
    poolPatientCount: number;
};

type Doctor = {
    id: number; documentId: string; fullName: string; specialty: string;
    phone: string; email: string | null; canInvite: boolean;
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

    if (!reportData || reportData.doctors?.length === 0) {
        return (
            <Card className="rounded-2xl border-0 shadow-md">
                <CardContent className="p-8 text-center">
                    <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">No Consent Data</h3>
                    <p className="text-gray-400 text-sm">
                        No doctors have granted data sharing consent yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="rounded-2xl border-0 shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 opacity-80" />
                            <div>
                                <div className="text-2xl font-bold">{reportData.doctors.length}</div>
                                <div className="text-emerald-100 text-sm">Consenting Doctors</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 opacity-80" />
                            <div>
                                <div className="text-2xl font-bold">{reportData.totalPatients}</div>
                                <div className="text-blue-100 text-sm">Total Patients</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Doctor-Patient Cards */}
            {reportData.doctors.map((doctor: any) => (
                <Card key={doctor.id} className="rounded-2xl border-0 shadow-md">
                    <CardHeader
                        className="cursor-pointer hover:bg-gray-50 transition-colors rounded-t-2xl"
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
                                <p className="text-gray-400 text-sm text-center py-4">No patient records yet</p>
                            ) : (
                                <div className="rounded-xl overflow-hidden border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="text-xs">Patient Name</TableHead>
                                                <TableHead className="text-xs">Gender</TableHead>
                                                <TableHead className="text-xs">Birth Date</TableHead>
                                                <TableHead className="text-xs">Status</TableHead>
                                                <TableHead className="text-xs">Registered</TableHead>
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
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'hospitals' | 'reports'>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    // Doctor form
    const [showDoctorForm, setShowDoctorForm] = useState(false);
    const [docName, setDocName] = useState('');
    const [docSpecialty, setDocSpecialty] = useState('Cardiology');
    const [docPhone, setDocPhone] = useState('');
    const [docEmail, setDocEmail] = useState('');
    const [docPassword, setDocPassword] = useState('Test123!');
    const [docInstId, setDocInstId] = useState('');
    const [savingDoctor, setSavingDoctor] = useState(false);

    // Edit doctor
    const [showEditForm, setShowEditForm] = useState(false);
    const [editDoctorId, setEditDoctorId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editSpecialty, setEditSpecialty] = useState('Cardiology');
    const [editPhone, setEditPhone] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
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
        if (!docName || !docPhone || !docPassword) {
            toast.error('Name, phone and password are required');
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
                    email: docEmail || undefined,
                    password: docPassword,
                    institutionId: docInstId ? Number(docInstId) : undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                toast.error(json?.error?.message || 'Failed to create doctor');
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
        setDocSpecialty('Cardiology'); setDocPassword('Test123!'); setDocInstId('');
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
        setEditName(d.fullName);
        setEditSpecialty(d.specialty);
        setEditPhone(d.phone.replace('+90', ''));
        setEditEmail(d.email || '');
        setEditPassword('');
        setEditInstId(d.institution ? String(d.institution.id) : '');
        setEditCanInvite(!!d.canInvite);
        setShowEditForm(true);
    };

    const handleUpdateDoctor = async () => {
        if (!editDoctorId || !editName) {
            toast.error('Name is required');
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
                    password: editPassword || undefined,
                    institutionId: editInstId ? Number(editInstId) : null,
                    canInvite: editCanInvite,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                toast.error(json?.error?.message || 'Failed to update doctor');
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
            d.fullName.toLowerCase().includes(term) ||
            d.specialty.toLowerCase().includes(term) ||
            d.phone.includes(term) ||
            d.institution?.name.toLowerCase().includes(term)
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30">
            {/* Top Bar */}
            <header className="bg-gradient-to-r from-[hsl(184,91%,17%)] via-[hsl(184,58%,28%)] to-[hsl(184,58%,35%)] text-white shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/15 backdrop-blur-sm rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Admin Dashboard</h1>
                            <p className="text-teal-100/60 text-xs">ATTR-CM Tracker Administration</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={loadDashboard} className="text-teal-100 hover:text-white hover:bg-white/10">
                            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-300 hover:text-red-200 hover:bg-red-500/10">
                            <LogOut className="w-4 h-4 mr-1" /> Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-[hsl(184,58%,44%)] to-[hsl(184,91%,17%)] text-white border-0 shadow-lg shadow-teal-500/20 rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-teal-100 text-sm">Total Hospitals</p>
                                    <p className="text-3xl font-bold">{summary.totalInstitutions}</p>
                                </div>
                                <Building2 className="w-10 h-10 text-white/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-[hsl(184,58%,52%)] to-[hsl(184,58%,38%)] text-white border-0 shadow-lg shadow-teal-500/15 rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-teal-50 text-sm">Total Doctors</p>
                                    <p className="text-3xl font-bold">{summary.totalDoctors}</p>
                                </div>
                                <Stethoscope className="w-10 h-10 text-white/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/15 rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm">Total Patients</p>
                                    <p className="text-3xl font-bold">{summary.totalPatients}</p>
                                </div>
                                <Users className="w-10 h-10 text-white/30" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-cyan-500 to-[hsl(184,58%,44%)] text-white border-0 shadow-lg shadow-cyan-500/15 rounded-2xl">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-100 text-sm">Specialties</p>
                                    <p className="text-3xl font-bold">{Object.keys(summary.specialtyCounts).length}</p>
                                </div>
                                <Activity className="w-10 h-10 text-white/30" />
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {Object.entries(summary.specialtyCounts).map(([sp, count]) => (
                                    <span key={sp} className="text-[10px] bg-white/20 rounded-full px-2 py-0.5">
                                        {sp}: {count}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-4">
                    {(['overview', 'hospitals', 'doctors', 'reports'] as const).map(tab => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'default' : 'outline'}
                            size="sm"
                            className={`rounded-xl capitalize ${activeTab === tab ? 'bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'overview' && <TrendingUp className="w-4 h-4 mr-1" />}
                            {tab === 'hospitals' && <Building2 className="w-4 h-4 mr-1" />}
                            {tab === 'doctors' && <Stethoscope className="w-4 h-4 mr-1" />}
                            {tab === 'reports' && <FileBarChart className="w-4 h-4 mr-1" />}
                            {tab}
                        </Button>
                    ))}
                </div>

                {/* ── Overview Tab ── */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hospitals.map(h => (
                            <Card key={h.id} className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Building2 className="w-5 h-5 text-[hsl(184,58%,44%)]" />
                                            {h.name}
                                        </CardTitle>
                                    </div>
                                    {h.address && <p className="text-xs text-slate-400">{h.address}</p>}
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div className="bg-teal-50 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-bold text-teal-700">{h.doctorCount}</p>
                                            <p className="text-[10px] text-teal-500 font-medium">Doctors</p>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-bold text-green-700">{h.patientCount}</p>
                                            <p className="text-[10px] text-green-500 font-medium">Patients</p>
                                        </div>
                                        <div className="bg-amber-50 rounded-xl p-3 text-center">
                                            <p className="text-2xl font-bold text-amber-700">{h.poolPatientCount}</p>
                                            <p className="text-[10px] text-amber-500 font-medium">Pool</p>
                                        </div>
                                    </div>
                                    {/* Specialty breakdown */}
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(h.doctorsBySpecialty).map(([sp, cnt]) => (
                                            <Badge key={sp} variant="outline" className={`text-[10px] ${specialtyColors[sp] || ''}`}>
                                                {specialtyIcons[sp]} {sp}: {cnt}
                                            </Badge>
                                        ))}
                                    </div>
                                    {/* Patient status breakdown */}
                                    {Object.keys(h.patientsByStatus).length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {Object.entries(h.patientsByStatus).map(([st, cnt]) => (
                                                <span key={st} className="text-[10px] bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
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
                    <Card className="rounded-2xl border-0 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[hsl(184,58%,44%)]" />
                                Hospital Management
                            </CardTitle>
                            <Dialog open={showHospitalForm} onOpenChange={setShowHospitalForm}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white rounded-xl">
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
                    <Card className="rounded-2xl border-0 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-[hsl(184,58%,44%)]" />
                                Doctor Management
                                <Badge variant="secondary">{filteredDoctors.length}</Badge>
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-8 h-9 w-48 rounded-xl text-sm"
                                    />
                                </div>
                                <Dialog open={showDoctorForm} onOpenChange={setShowDoctorForm}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white rounded-xl">
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
                                            <Input placeholder="Email" type="email" value={docEmail} onChange={e => setDocEmail(e.target.value)} />
                                            <Input placeholder="Password *" type="password" value={docPassword} onChange={e => setDocPassword(e.target.value)} />
                                            <Select value={docInstId} onValueChange={setDocInstId}>
                                                <SelectTrigger><SelectValue placeholder="Select Hospital" /></SelectTrigger>
                                                <SelectContent>
                                                    {hospitals.map(h => (
                                                        <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                            <label className="text-xs text-slate-500 mb-1 block">Phone</label>
                                            <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Email</label>
                                            <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">New Password (leave empty to keep current)</label>
                                            <Input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="••••••••" />
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
                {activeTab === 'reports' && <ConsentReportTab />}
            </div>
        </div>
    );
};

export default AdminDashboard;
