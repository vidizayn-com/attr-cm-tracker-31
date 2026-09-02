import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { Search, Filter, Calendar, User, FileText, Clock, Loader2, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { strapiGet } from '@/lib/strapiClient';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createPatient } from '@/lib/patientApi';
import { useUser } from '@/contexts/UserContext';
import DateInputDdMmYyyy, { isoToDdMmYyyy } from '@/components/DateInputDdMmYyyy';

import PatientForm, { DoctorOption } from '@/components/PatientForm';
import { getDefaultPatientFormData, validatePatientFormData, PatientFormData, calculateReportPriority } from '@/lib/patientSchema';

type PatientData = {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  statu: string;
  lastReportDate: string | null;
  reportDeadline: string | null;
  primary_cardiologist: { fullName: string } | null;
};

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
        const d = new Date(val);
        d.setMonth(d.getMonth() + 6);
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
        allowCaregiver: form.allowCaregiver,
        statu: "Follow Up",

        lastReportDate: form.lastReportDate || null,
        reportDeadline: form.reportDeadline || null,
        lastVisit: form.lastReportDate || new Date().toISOString().split('T')[0],
        nextAppointment: form.reportDeadline || null,

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

      return {
        id: p.documentId,
        patientName: `${p.firstName} ${p.lastName}`,
        reportType: 'Diagnosis Report',
        status,
        assignedTo: p.primary_cardiologist?.fullName || 'Atanmamış (HATA)',
        dueDate: p.reportDeadline ? isoToDdMmYyyy(p.reportDeadline) : 'Not Set',
        createdDate: p.lastReportDate ? isoToDdMmYyyy(p.lastReportDate) : (p.createdAt ? isoToDdMmYyyy(p.createdAt.split('T')[0]) : 'None'),
        priority,
        diffDays
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

        {/* Reports Grid */}
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
                  
                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium min-w-[100px]">Next Due:</span>
                    <span className={report.diffDays < 0 ? "text-red-600 font-semibold" : ""}>{report.dueDate}</span>
                  </div>
                  
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
