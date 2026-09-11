import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Layout from '@/components/Layout';
import { Search, Filter, Calendar, User, FileText, Clock, Loader2, AlertTriangle, CheckCircle, Plus, Activity, LayoutGrid, List as ListIcon, ArrowUp, ArrowDown, ArrowUpDown, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { strapiGet } from '@/lib/strapiClient';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createPatient } from '@/lib/patientApi';
import { useUser } from '@/contexts/UserContext';
import DateInputDdMmYyyy, { isoToDdMmYyyy } from '@/components/DateInputDdMmYyyy';
import { addMonths } from 'date-fns';

import PatientForm, { DoctorOption } from '@/components/PatientForm';
import { getDefaultPatientFormData, validatePatientFormData, PatientFormData, calculateReportPriority, PATIENT_TYPE_OPTIONS } from '@/lib/patientSchema';
import { REPORT_RENEWAL_PERIOD_MONTHS, getTreatmentFollowUpInfo, formatMilestoneDateIso, TAFAMIDIS_CONTINUATION_REVIEW_MONTH, TAFAMIDIS_CONTINUATION_WARNING } from '@/lib/treatmentSchedule';
import { generateExcelTableFile } from '@/utils/excelExport';

type PatientData = {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  statu: string;
  lastReportDate: string | null;
  reportDeadline: string | null;
  createdAt?: string | null;
  primary_cardiologist: { fullName: string } | null;
  patientType: string | null;
  treatmentStartDate: string | null;
};

// Placeholder shown for any List View / Excel export column whose underlying
// value is missing — reuses this file's own existing empty-state convention
// (already used for a missing report deadline below) instead of introducing a
// second one.
const NOT_SET = 'Not Set';

const PATIENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PATIENT_TYPE_OPTIONS.map((opt) => [opt.value, opt.label])
);

// View-mode is remembered for the current browser session only (same pattern
// already used by Layout.tsx's sessionStorage-based reminder flag) — not a new
// persisted user setting.
const VIEW_MODE_SESSION_KEY = 'reportTrackerViewMode';

type SortKey =
  | 'patient'
  | 'patientType'
  | 'treatmentStartDate'
  | 'currentTreatmentMonth'
  | 'nextTreatmentReminder'
  | 'treatmentStatus'
  | 'lastReportDate'
  | 'nextReportRenewal'
  | 'reportStatus';

const TREATMENT_STATUS_RANK: Record<string, number> = { Overdue: 0, Due: 1, Upcoming: 2 };
const REPORT_STATUS_RANK: Record<string, number> = { Overdue: 0, Pending: 1, 'In Progress': 1, Completed: 2 };

const ReportTracker = () => {
  const { currentUser, isLoading: userLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const navigate = useNavigate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [cardiologists, setCardiologists] = useState<DoctorOption[]>([]);
  const [form, setForm] = useState<PatientFormData>(getDefaultPatientFormData({ statu: "Follow Up" }));

  useEffect(() => {
    (async () => {
      try {
        const docs = await strapiGet<any[]>("/api/auth/doctor/all-doctors?specialty=Cardiology");
        setCardiologists(Array.isArray(docs) ? docs : []);
      } catch (e) {
        console.warn("Failed to load cardiologists", e);
      }
    })();
  }, []);

  const handleLastReportDateChange = (val: string) => {
    setForm(prev => {
      const updated = { ...prev, lastReportDate: val };
      if (val) {
        const d = addMonths(new Date(val), REPORT_RENEWAL_PERIOD_MONTHS);
        updated.reportDeadline = d.toISOString().split('T')[0];
      }
      return updated;
    });
  };

  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation using shared patient schema
    const validation = validatePatientFormData(form, { isReportTracker: true });
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }

    try {
      setSubmittingAdd(true);

      await createPatient({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        gender: form.gender
          ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1)
          : undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        contactNumber: form.contactNumber.trim(),
        phone: form.contactNumber.trim(),
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
        clinicalStatus: form.clinicalStatus?.trim() || undefined,
        kvkkConsentStatus: form.kvkkConsentStatus || undefined,
        kvkkConsentAt: form.kvkkConsentAt || undefined,
        allowCaregiver: form.allowCaregiver,
        statu: "Follow Up",

        lastReportDate: form.lastReportDate || null,
        reportDeadline: form.reportDeadline || null,
        lastVisit: form.lastReportDate || new Date().toISOString().split('T')[0],
        nextAppointment: form.reportDeadline || null,

        patientType: form.patientType || null,
        treatmentStartDate: form.treatmentStartDate || null,
        treatmentDetails: form.treatmentDetails?.trim() || null,

        clinicalFindings: form.clinicalFindings,
        redFlagSymptoms: form.redFlagSymptoms,

        assignedCardiologistDocId: form.primaryCardiologistDocId || undefined,

        caregiver: form.allowCaregiver ? {
          fullName: form.caregiverName?.trim() || undefined,
          phone: form.caregiverPhone.trim(),
          email: form.caregiverEmail?.trim() || undefined,
          relationToPatient: "Caregiver",
        } : undefined,
      });

      toast.success("Hasta rapor takibi için başarıyla eklendi!");
      setIsAddModalOpen(false);
      setForm(getDefaultPatientFormData({ statu: "Follow Up" }));

      // Reload patient list
      setLoading(true);
      const res = await strapiGet<any>('/api/auth/doctor/my-patients');
      const primary = res.primaryPatients || [];
      const consulting = res.consultingPatients || [];
      const map = new Map<number, PatientData>();
      [...primary, ...consulting].forEach((p: any) => {
        if (p.statu === 'Follow Up') {
          map.set(p.id, p);
        }
      });
      setPatients(Array.from(map.values()));
    } catch (err: any) {
      console.error(err);
      let errorMsg = err?.message || "";
      if (!errorMsg || errorMsg.includes("Failed to fetch") || errorMsg.includes("TypeError")) {
        errorMsg = "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.";
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setSubmittingAdd(false);
    }
  };

  useEffect(() => {
    if (!userLoading && currentUser && currentUser.role !== 'Cardiology') {
      toast.error("Only cardiologists can access the report tracker.");
      navigate('/patients');
    }
  }, [currentUser, userLoading, navigate]);

  useEffect(() => {
    if (currentUser?.role !== 'Cardiology') return;
    (async () => {
      try {
        setLoading(true);
        const res = await strapiGet<any>('/api/auth/doctor/my-patients');
        const primary = res.primaryPatients || [];
        const consulting = res.consultingPatients || [];
        
        // Remove duplicates and combine
        const map = new Map<number, PatientData>();
        [...primary, ...consulting].forEach((p: any) => {
          if (p.statu === 'Follow Up') {
            map.set(p.id, p);
          }
        });

        setPatients(Array.from(map.values()));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch patients.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const reports = useMemo(() => {
    return patients.map(p => {
      const { priority, diffDays } = calculateReportPriority(p.reportDeadline);

      let status = "Completed";
      if (!p.reportDeadline || !p.lastReportDate) {
        status = "Pending";
      } else if (diffDays < 0) {
        status = "Overdue";
      } else if (diffDays <= 20) {
        status = "Pending";
      }

      // Treatment follow-up is a separate concept from the report renewal status
      // above — a patient can be "High Priority" on their report while their
      // treatment schedule is comfortably "Upcoming", or vice versa.
      const treatmentInfo = getTreatmentFollowUpInfo(p.treatmentStartDate, p.patientType, p.lastReportDate);

      return {
        id: p.documentId,
        patientName: `${p.firstName} ${p.lastName}`,
        reportType: 'Diagnosis Report',
        status,
        assignedTo: p.primary_cardiologist?.fullName || 'Atanmamış (HATA)',
        dueDate: p.reportDeadline ? isoToDdMmYyyy(p.reportDeadline) : 'Not Set',
        createdDate: p.lastReportDate ? isoToDdMmYyyy(p.lastReportDate) : (p.createdAt ? isoToDdMmYyyy(p.createdAt.split('T')[0]) : 'None'),
        priority,
        diffDays,
        currentTreatmentMonth: treatmentInfo?.currentTreatmentMonth ?? null,
        nextTreatmentReminderDate: treatmentInfo ? isoToDdMmYyyy(formatMilestoneDateIso(treatmentInfo.nextTreatmentReminderDate)) : null,
        // Overdue refers to this PAST milestone, never to nextTreatmentReminderDate
        // above — only used when treatmentReminderStatus === 'Overdue', so the card
        // can show which date is actually overdue instead of just a bare badge next
        // to a future date.
        previousTreatmentReminderDate: treatmentInfo?.previousTreatmentReminderDate
          ? isoToDdMmYyyy(formatMilestoneDateIso(treatmentInfo.previousTreatmentReminderDate))
          : null,
        treatmentReminderStatus: treatmentInfo?.treatmentReminderStatus ?? null,
        // Raw values below are only for List View / Excel export (Patient Type,
        // Treatment Start Date columns, and chronological/numeric sorting) — the
        // Card View above never reads them, so its output is unchanged.
        patientType: p.patientType,
        treatmentStartDateRaw: p.treatmentStartDate,
        nextTreatmentReminderRaw: treatmentInfo?.nextTreatmentReminderDate ?? null,
        reportDeadlineRaw: p.reportDeadline,
        lastReportDateRaw: p.lastReportDate || p.createdAt || null,
      };
    });
  }, [patients]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (statusFilter !== 'All Statuses') {
        if (statusFilter === 'High Priority (≤ 20 Days)') {
          if (r.priority !== 'High') return false;
        } else if (statusFilter === 'Mid Priority (21-30 Days)') {
          if (r.priority !== 'Mid') return false;
        } else if (statusFilter === 'Low Priority (> 30 Days)') {
          if (r.priority !== 'Low') return false;
        } else if (statusFilter === 'Renewal Impending (≤ 20 Days)') {
          if (r.diffDays > 20 || r.diffDays < 0) return false;
        } else if (r.status !== statusFilter) {
          return false;
        }
      }
      if (searchTerm && !r.patientName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [reports, searchTerm, statusFilter]);

  // Display-ready column values shared by the List View table and the Excel
  // export, so the two can never show different text for the same patient.
  const formatReportRow = (r: (typeof filteredReports)[number]) => ({
    id: r.id,
    patient: r.patientName,
    patientType: r.patientType ? (PATIENT_TYPE_LABELS[r.patientType] || NOT_SET) : NOT_SET,
    treatmentStartDate: r.treatmentStartDateRaw ? isoToDdMmYyyy(r.treatmentStartDateRaw) : NOT_SET,
    currentTreatmentMonth: r.currentTreatmentMonth !== null ? `Month ${r.currentTreatmentMonth}` : NOT_SET,
    nextTreatmentReminder: r.nextTreatmentReminderDate || NOT_SET,
    treatmentStatus: r.treatmentReminderStatus || NOT_SET,
    lastReportDate: r.createdDate,
    nextReportRenewal: r.dueDate,
    reportStatus: r.status,
  });

  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    if (typeof window === 'undefined') return 'card';
    return sessionStorage.getItem(VIEW_MODE_SESSION_KEY) === 'list' ? 'list' : 'card';
  });

  const handleViewModeChange = (value: string) => {
    if (value !== 'card' && value !== 'list') return;
    setViewMode(value);
    try {
      sessionStorage.setItem(VIEW_MODE_SESSION_KEY, value);
    } catch {
      // sessionStorage can be unavailable (e.g. private browsing); the view
      // switch itself still works, it just won't be remembered.
    }
  };

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedReports = useMemo(() => {
    if (!sortKey) return filteredReports;

    const compare = (a: (typeof filteredReports)[number], b: (typeof filteredReports)[number]): number => {
      switch (sortKey) {
        case 'patient':
          return a.patientName.localeCompare(b.patientName);
        case 'patientType': {
          const la = a.patientType ? (PATIENT_TYPE_LABELS[a.patientType] || '') : '';
          const lb = b.patientType ? (PATIENT_TYPE_LABELS[b.patientType] || '') : '';
          return la.localeCompare(lb);
        }
        case 'treatmentStartDate':
          return (a.treatmentStartDateRaw || '').localeCompare(b.treatmentStartDateRaw || '');
        case 'currentTreatmentMonth':
          return (a.currentTreatmentMonth ?? -1) - (b.currentTreatmentMonth ?? -1);
        case 'nextTreatmentReminder': {
          const ta = a.nextTreatmentReminderRaw ? a.nextTreatmentReminderRaw.getTime() : -Infinity;
          const tb = b.nextTreatmentReminderRaw ? b.nextTreatmentReminderRaw.getTime() : -Infinity;
          return ta - tb;
        }
        case 'treatmentStatus': {
          const ra = a.treatmentReminderStatus ? (TREATMENT_STATUS_RANK[a.treatmentReminderStatus] ?? 99) : 99;
          const rb = b.treatmentReminderStatus ? (TREATMENT_STATUS_RANK[b.treatmentReminderStatus] ?? 99) : 99;
          return ra - rb;
        }
        case 'lastReportDate':
          return (a.lastReportDateRaw || '').localeCompare(b.lastReportDateRaw || '');
        case 'nextReportRenewal':
          return (a.reportDeadlineRaw || '').localeCompare(b.reportDeadlineRaw || '');
        case 'reportStatus':
          return (REPORT_STATUS_RANK[a.status] ?? 99) - (REPORT_STATUS_RANK[b.status] ?? 99);
        default:
          return 0;
      }
    };

    const sorted = [...filteredReports].sort(compare);
    return sortDir === 'asc' ? sorted : sorted.reverse();
  }, [filteredReports, sortKey, sortDir]);

  const [exporting, setExporting] = useState(false);

  const handleExportToExcel = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      if (!filteredReports.length) {
        toast.error('No patients to export for the current filters.');
        return;
      }
      const exportRows = filteredReports.map(r => {
        const row = formatReportRow(r);
        return {
          'Patient': row.patient,
          'Patient Type': row.patientType,
          'Treatment Start Date': row.treatmentStartDate,
          'Current Treatment Month': row.currentTreatmentMonth,
          'Next Treatment Reminder': row.nextTreatmentReminder,
          'Treatment Status': row.treatmentStatus,
          'Last Report Date': row.lastReportDate,
          'Next Report Renewal': row.nextReportRenewal,
          'Report Status': row.reportStatus,
        };
      });
      await generateExcelTableFile(exportRows, 'ATTR_Navigator_Report_Tracker');
      toast.success(`Exported ${exportRows.length} patient record(s).`);
    } catch (e: any) {
      console.error('Report Tracker export error', e);
      toast.error(e?.message || 'Failed to generate Excel export');
    } finally {
      setExporting(false);
    }
  };

  const SortableHead = ({ sortKeyName, children, className }: { sortKeyName: SortKey; children: React.ReactNode; className?: string }) => (
    <TableHead
      className={`cursor-pointer select-none whitespace-nowrap hover:text-slate-900 ${className || ''}`}
      onClick={() => handleSort(sortKeyName)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortKey === sortKeyName ? (
          sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />
        )}
      </span>
    </TableHead>
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Completed': 'bg-emerald-100 text-emerald-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-amber-100 text-amber-800',
      'Overdue': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      'High': 'bg-red-100 text-red-800 border-red-200',
      'Mid': 'bg-amber-100 text-amber-800 border-amber-200',
      'Low': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return styles[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const stats = useMemo(() => ({
    total: reports.length,
    high: reports.filter(r => r.priority === 'High').length,
    mid: reports.filter(r => r.priority === 'Mid').length,
    low: reports.filter(r => r.priority === 'Low').length,
    completed: reports.filter(r => r.status === 'Completed').length,
    pending: reports.filter(r => r.status === 'Pending').length,
    overdue: reports.filter(r => r.status === 'Overdue').length,
  }), [reports]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#089bab]" />
      </div>
    );
  }

  if (currentUser && currentUser.role !== 'Cardiology') {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6" style={{zIndex:10, position:'relative'}}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="page-title">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#056a75' }}>Report Tracker</h1>
            <p className="text-slate-500 mt-1">Track upcoming and overdue patient diagnosis reports.</p>
          </div>
          <Button 
            style={{ backgroundColor: '#29a8b6' }} 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto rounded-xl text-white font-semibold flex items-center gap-2 shadow-md hover:opacity-90"
          >
            <Plus className="w-5 h-5" /> Add Patient for Report Tracking
          </Button>
        </div>

        {/* Summary Cards */}
        <section className="dashboard-grid mb-8">
            <div className="kpi-row">
                <div className="glass-card kpi-card">
                    <div className="kpi-icon blue">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div className="kpi-info">
                        <h4>Total Follow Up</h4>
                        <div className="value">{stats.total}</div>
                    </div>
                </div>

                <div className="glass-card kpi-card">
                    <div className="kpi-icon teal">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="kpi-info">
                        <h4>Up to Date</h4>
                        <div className="value">{stats.completed}</div>
                    </div>
                </div>

                <div className="glass-card kpi-card">
                    <div className="kpi-icon amber">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="kpi-info">
                        <h4>Renewal Soon</h4>
                        <div className="value">{stats.pending}</div>
                    </div>
                </div>

                <div className="glass-card kpi-card">
                    <div className="kpi-icon rose">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="kpi-info">
                        <h4>Overdue</h4>
                        <div className="value" style={{color: 'var(--danger)'}}>{stats.overdue}</div>
                    </div>
                </div>
            </div>
        </section>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="relative w-full lg:w-96">
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 rounded-xl bg-white/50 border-gray-200 focus:bg-white transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/50 border border-gray-200 focus:bg-white transition-colors w-full sm:w-auto outline-none"
            >
              <option value="All Statuses">All Statuses & Priorities</option>
              <option value="High Priority (≤ 20 Days)">High Priority (≤ 20 Days)</option>
              <option value="Mid Priority (21-30 Days)">Mid Priority (21-30 Days)</option>
              <option value="Low Priority (> 30 Days)">Low Priority (&gt; 30 Days)</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* View switch + Excel export */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={handleViewModeChange}
            className="bg-white/50 border border-gray-200 rounded-xl p-1"
          >
            <ToggleGroupItem value="card" aria-label="Card View" className="rounded-lg px-3 py-1.5 gap-2 data-[state=on]:bg-[#089bab] data-[state=on]:text-white">
              <LayoutGrid className="w-4 h-4" /> Card View
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List View" className="rounded-lg px-3 py-1.5 gap-2 data-[state=on]:bg-[#089bab] data-[state=on]:text-white">
              <ListIcon className="w-4 h-4" /> List View
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            onClick={handleExportToExcel}
            disabled={exporting || loading}
            variant="outline"
            className="rounded-xl border-gray-200 flex items-center gap-2"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export to Excel
          </Button>
        </div>

        {/* Reports */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
            <p className="text-gray-500">No follow up patients match your criteria.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="glass-card rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead sortKeyName="patient">Patient</SortableHead>
                  <SortableHead sortKeyName="patientType">Patient Type</SortableHead>
                  <SortableHead sortKeyName="treatmentStartDate">Treatment Start Date</SortableHead>
                  <SortableHead sortKeyName="currentTreatmentMonth">Current Treatment Month</SortableHead>
                  <SortableHead sortKeyName="nextTreatmentReminder">Next Treatment Reminder</SortableHead>
                  <SortableHead sortKeyName="treatmentStatus">Treatment Status</SortableHead>
                  <SortableHead sortKeyName="lastReportDate">Last Report Date</SortableHead>
                  <SortableHead sortKeyName="nextReportRenewal">Next Report Renewal</SortableHead>
                  <SortableHead sortKeyName="reportStatus">Report Status</SortableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReports.map((report) => {
                  const row = formatReportRow(report);
                  return (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-cyan-50/50"
                      onClick={() => navigate(`/patients/${row.id}`)}
                    >
                      <TableCell className="font-medium text-slate-800 whitespace-nowrap">{row.patient}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.patientType}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.treatmentStartDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.currentTreatmentMonth}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.nextTreatmentReminder}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.treatmentStatus === NOT_SET ? (
                          <span className="text-slate-400">{NOT_SET}</span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            row.treatmentStatus === 'Overdue' ? 'bg-red-100 text-red-700' :
                            row.treatmentStatus === 'Due' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {row.treatmentStatus}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{row.lastReportDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.nextReportRenewal}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(row.reportStatus)}`}>
                          {row.reportStatus}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {filteredReports.map((report) => (
              <Card 
                key={report.id} 
                className={`glass-card cursor-pointer border-y-0 border-r-0 border-l-4 transition-all duration-300 ${
                  report.priority === 'High' 
                    ? "border-l-red-500 bg-red-50/20 hover:bg-red-50/30 shadow-red-50/40 shadow-sm" 
                    : report.priority === 'Mid' 
                      ? "border-l-amber-500 bg-amber-50/20 hover:bg-amber-50/30 shadow-amber-50/40 shadow-sm" 
                      : "border-l-emerald-500 bg-emerald-50/10 hover:bg-white/80"
                }`}
                onClick={() => navigate(`/patients/${report.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-cyan-600" />
                      {report.patientName}
                    </CardTitle>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${getPriorityBadge(report.priority)}`}>
                        {report.priority} Priority
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <h3 className="text-sm font-semibold text-slate-700">{report.reportType}</h3>
                    {report.diffDays <= 20 && report.diffDays >= 0 && (
                      <span className="flex items-center text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Due in {report.diffDays} Days
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                    <div className="flex items-center text-slate-500">
                        <User className="w-4 h-4 mr-2" />
                        <span>Assigned to</span>
                    </div>
                    <span className="font-medium text-slate-800">{report.assignedTo}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                    <div className="flex items-center text-slate-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Last Report</span>
                    </div>
                    <span className="font-medium text-slate-800">{report.createdDate}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-700 border-b border-gray-100 pb-2">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium min-w-[100px]">Next Due:</span>
                    <span className={report.diffDays < 0 ? "text-red-600 font-semibold" : ""}>{report.dueDate}</span>
                  </div>

                  {/* Treatment follow-up — a separate concept from the report renewal
                      status above; only shown once Treatment Start Date is set. */}
                  {report.currentTreatmentMonth !== null && (
                    <>
                      <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                        <div className="flex items-center text-slate-500">
                          <Activity className="w-4 h-4 mr-2" />
                          <span>Current Treatment Month</span>
                        </div>
                        <span className="font-medium text-slate-800 flex items-center gap-2">
                          Month {report.currentTreatmentMonth}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            report.treatmentReminderStatus === 'Overdue' ? 'bg-red-100 text-red-700' :
                            report.treatmentReminderStatus === 'Due' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {report.treatmentReminderStatus}
                          </span>
                        </span>
                      </div>

                      {/* Overdue refers to this PAST milestone, never to
                          nextTreatmentReminderDate below — shown explicitly so
                          the Overdue badge above isn't read as applying to the
                          future date in the row underneath. */}
                      {report.treatmentReminderStatus === 'Overdue' && report.previousTreatmentReminderDate && (
                        <div className="flex items-center text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                          <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-500" />
                          <span>Overdue since <span className="font-semibold">{report.previousTreatmentReminderDate}</span></span>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium min-w-[160px]">
                          {report.treatmentReminderStatus === 'Overdue' ? 'Next Reminder (once addressed):' : 'Next Treatment Reminder:'}
                        </span>
                        <span>{report.nextTreatmentReminderDate}</span>
                      </div>

                      {/* Compact flag for the Month 15 Tafamidis continuation
                          warning; full criteria text lives on Patient Details to
                          avoid repeating a medical text block on every card. */}
                      {report.currentTreatmentMonth === TAFAMIDIS_CONTINUATION_REVIEW_MONTH && (
                        <div className="flex items-center text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-red-500" />
                          <span>{TAFAMIDIS_CONTINUATION_WARNING.title} — review required</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-3">
                    <Button 
                      onClick={() => navigate(`/patients/${report.id}`)}
                      variant="outline"
                      className="w-full bg-white hover:bg-cyan-50 text-gray-700 hover:text-cyan-700 border border-gray-200 rounded-xl"
                    >
                      Update Report in Patient Details →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Add Patient for Report Tracking Dialog */}
        <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && setIsAddModalOpen(false)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold" style={{ color: '#056a75' }}>
                Add Patient for Report Tracking
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddPatientSubmit} className="space-y-6">
              <PatientForm
                formData={form}
                setFormData={setForm}
                cardiologists={cardiologists}
                showReportDates={true}
                onLastReportDateChange={handleLastReportDateChange}
                disabled={submittingAdd}
              />

              {/* Form Actions */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingAdd}
                  style={{ backgroundColor: '#29a8b6' }}
                  className="rounded-xl text-white font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  {submittingAdd && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Patient
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ReportTracker;
