import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileSpreadsheet, Loader2, Users, UserCheck, ArrowLeftRight, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import { exportPatientsToExcel } from "@/utils/excelExport";
import { strapiGet, strapiPost } from "@/lib/strapiClient";
import { toast } from "sonner";

type StrapiPatient = {
  id: number;
  documentId?: string | null;

  firstName?: string | null;
  lastName?: string | null;

  gender?: string | null;
  dateOfBirth?: string | null;

  clinicalStatus?: string | null;

  kvkkConsentStatus?: string | null;
  kvkkConsentAt?: string | null;

  email?: string | null;

  // Strapi'de alan adı statu
  statu?: string | null;

  contactNumber?: string | null;

  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;

  lastVisit?: string | null;
  nextAppointment?: string | null;
  reportDeadline?: string | null;

  primary_cardiologist?: {
    id: number;
    documentId: string;
    fullName: string;
    specialty: string;
  } | null;

  assigned_specialists?: Array<{
    id: number;
    documentId: string;
    fullName: string;
    specialty: string;
  }> | null;
  assignmentStatus?: string | null;
  assignmentId?: number | null;
};

interface MyPatientsResponse {
  primaryPatients: StrapiPatient[];
  consultingPatients: StrapiPatient[];
}

const PatientList = () => {
  const { currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Sort by: A-Z");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const [primaryPatients, setPrimaryPatients] = useState<StrapiPatient[]>([]);
  const [consultingPatients, setConsultingPatients] = useState<StrapiPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returningPatient, setReturningPatient] = useState<string | null>(null);

  const isCardiologist = currentUser?.role === "Cardiology";
  const isSpecialist = !isCardiologist; // NuclearMedicine, Hematology, Genetics

  const safeText = (v?: string | null) => (v ?? "").toString().trim();

  const patientFullName = (p: StrapiPatient) => {
    const name = `${safeText(p.firstName)} ${safeText(p.lastName)}`.trim();
    return name || `Patient #${p.id}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "New": "bg-green-500 text-white",
      "Diagnostic Process": "bg-orange-500 text-white",
      "Follow Up": "bg-blue-500 text-white",
      "Amyloidosis was ruled out": "bg-red-500 text-white",
    };
    return styles[status] || "bg-gray-500 text-white";
  };

  const calculateAge = (dateOfBirth?: string | null) => {
    if (!dateOfBirth) return "-";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    if (Number.isNaN(birthDate.getTime())) return "-";

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return String(age);
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await strapiGet<MyPatientsResponse>("/api/auth/doctor/my-patients");
      setPrimaryPatients(data.primaryPatients || []);
      setConsultingPatients(data.consultingPatients || []);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleReturnToCardiologist = async (patient: StrapiPatient) => {
    if (!patient.documentId) return;
    const confirmReturn = window.confirm(
      `Are you sure you want to return "${patientFullName(patient)}" to the primary cardiologist?\n\nThis means your review is complete.`
    );
    if (!confirmReturn) return;

    setReturningPatient(patient.documentId);
    try {
      await strapiPost("/api/auth/doctor/return-to-cardiologist", {
        patientDocumentId: patient.documentId,
      });
      toast.success(`"${patientFullName(patient)}" returned to cardiologist`);
      loadPatients();
    } catch (e: any) {
      toast.error(e?.message || "Failed to return patient");
    } finally {
      setReturningPatient(null);
    }
  };

  const handleApprovePatientDirect = async (patient: StrapiPatient) => {
    if (!patient.assignmentId) {
      toast.error("Assignment ID not found for this patient");
      return;
    }
    try {
      await strapiPost("/api/auth/doctor/assignments/approve", {
        assignmentId: patient.assignmentId,
      });
      toast.success(`"${patientFullName(patient)}" approved successfully`);
      loadPatients();
    } catch (e: any) {
      toast.error(e?.message || "Failed to approve patient");
    }
  };

  const handleRejectPatientDirect = async (patient: StrapiPatient) => {
    if (!patient.assignmentId) {
      toast.error("Assignment ID not found for this patient");
      return;
    }
    const confirmReject = window.confirm(
      `Are you sure you want to reject "${patientFullName(patient)}"?\n\nThis will reassign them back to their primary cardiologist.`
    );
    if (!confirmReject) return;

    try {
      await strapiPost("/api/auth/doctor/assignments/reject", {
        assignmentId: patient.assignmentId,
      });
      toast.success(`"${patientFullName(patient)}" rejected successfully`);
      loadPatients();
    } catch (e: any) {
      toast.error(e?.message || "Failed to reject patient");
    }
  };

  const filterAndSort = (list: StrapiPatient[]) => {
    const term = searchTerm.trim().toLowerCase();
    let filtered = [...list];

    // Status filter
    if (statusFilter !== "All Statuses") {
      filtered = filtered.filter((p) => safeText(p.statu) === statusFilter);
    }

    // Search filter
    if (term) {
      filtered = filtered.filter((p) => {
        const name = patientFullName(p).toLowerCase();
        const phone = safeText(p.contactNumber).toLowerCase();
        const email = safeText(p.email).toLowerCase();
        const idStr = String(p.id);
        const docIdStr = safeText(p.documentId);

        return (
          name.includes(term) ||
          phone.includes(term) ||
          email.includes(term) ||
          idStr.includes(term) ||
          docIdStr.includes(term)
        );
      });
    }

    // Sort
    if (sortBy === "Sort by: A-Z") {
      filtered.sort((a, b) => patientFullName(a).localeCompare(patientFullName(b)));
    } else if (sortBy === "Sort by: Z-A") {
      filtered.sort((a, b) => patientFullName(b).localeCompare(patientFullName(a)));
    } else {
      filtered.sort((a, b) => {
        const ad = new Date(a.createdAt ?? 0).getTime();
        const bd = new Date(b.createdAt ?? 0).getTime();
        return bd - ad;
      });
    }

    return filtered;
  };

  const filteredPrimary = useMemo(
    () => filterAndSort(primaryPatients),
    [primaryPatients, searchTerm, sortBy, statusFilter]
  );

  const filteredConsulting = useMemo(
    () => filterAndSort(consultingPatients),
    [consultingPatients, searchTerm, sortBy, statusFilter]
  );

  const totalCount = isCardiologist
    ? filteredPrimary.length + filteredConsulting.length
    : filteredConsulting.length;

  const handleExcelExport = () => {
    const allPatients = isCardiologist
      ? [...filteredPrimary, ...filteredConsulting]
      : filteredConsulting;
    exportPatientsToExcel(allPatients as any);
  };

  const renderPatientCard = (patient: StrapiPatient, sectionType: 'primary' | 'consulting') => {
    const status = safeText(patient.statu) || "New";

    let assignedDisplay = "Atanmamış (HATA)";
    if (patient.primary_cardiologist) {
      assignedDisplay = patient.primary_cardiologist.fullName;
    }

    const detailParam = safeText(patient.documentId) || String(patient.id);
    const isReturning = returningPatient === patient.documentId;

    return (
      <Card
        key={`${sectionType}-${patient.documentId || patient.id}`}
        className="glass-card border-none hover:shadow-2xl transition-shadow duration-300"
      >
        <CardContent className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2 border-b border-gray-100/50 pb-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {patientFullName(patient)}
            </h3>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(status)} whitespace-nowrap`}
            >
              {status}
            </span>
          </div>

          {/* Report deadline warning - only for Follow Up patients */}
          {(() => {
            if (status !== 'Follow Up' || !patient.reportDeadline) return null;
            const deadline = new Date(patient.reportDeadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffMs = deadline.getTime() - today.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays > 20) return null;
            const isOverdue = diffDays < 0;
            const bgColor = isOverdue ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';
            const textColor = isOverdue ? 'text-red-700' : 'text-amber-700';
            const iconColor = isOverdue ? 'text-red-500' : 'text-amber-500';
            return (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${bgColor} mb-3`}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
                <span className={`text-xs font-medium ${textColor}`}>
                  {isOverdue
                    ? `Report overdue by ${Math.abs(diffDays)} day(s)!`
                    : `Report deadline in ${diffDays} day(s) (${deadline.toLocaleDateString('tr-TR')})`}
                </span>
              </div>
            );
          })()}

          <div className="space-y-2 text-sm sm:text-base text-gray-700 mb-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 text-slate-600">
              <span className="font-medium text-slate-500">ID / YSN:</span> 
              <span>{patient.id} / <span className="font-mono text-xs">{calculateAge(patient.dateOfBirth)}</span></span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 text-slate-600">
              <span className="font-medium text-slate-500">Last Visit:</span>{' '}
              <span>{patient.lastVisit
                ? new Date(patient.lastVisit).toLocaleDateString('tr-TR')
                : <span className="text-gray-400">-</span>}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 text-slate-600">
              <span className="font-medium text-slate-500">Next Appt:</span>{' '}
              <span>{patient.nextAppointment
                ? new Date(patient.nextAppointment).toLocaleDateString('tr-TR')
                : <span className="text-gray-400">-</span>}</span>
            </div>
            <div className="flex justify-between items-center pb-2 text-slate-600">
              <span className="font-medium text-slate-500">Primary Cardio:</span>{' '}
              <span className={patient.primary_cardiologist ? "text-cyan-700 font-semibold" : "text-red-500 font-bold"}>{assignedDisplay}</span>
            </div>
            {patient.assigned_specialists && patient.assigned_specialists.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                + {patient.assigned_specialists.length} Specialist(s)
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Link to={`/patients/${detailParam}`} className="w-full">
              <Button
                variant="outline"
                className="w-full bg-white/50 hover:bg-white text-slate-700 hover:text-cyan-600 border border-gray-200 rounded-xl transition-colors shadow-sm"
              >
                View Full Profile →
              </Button>
            </Link>

            {/* Action buttons for consulting section */}
            {sectionType === 'consulting' && (
              patient.assignmentStatus === 'Pending' ? (
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => handleApprovePatientDirect(patient)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRejectPatientDirect(patient)}
                    variant="destructive"
                    className="flex-1 rounded-xl"
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleReturnToCardiologist(patient)}
                  disabled={isReturning}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl"
                >
                  {isReturning ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                  )}
                  Return to Cardiologist
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6" style={{zIndex:10, position:'relative'}}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="page-title">
             <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#056a75' }}>
               Patient List
             </h1>
          </div>
        </div>

        {/* Role info banner for specialists */}
        {isSpecialist && !loading && !error && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-purple-900">
                {currentUser?.role === 'NuclearMedicine' ? 'Nuclear Medicine' : currentUser?.role} Specialist View
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Below are patients referred to you for specialist review. After entering your findings, use "Return to Cardiologist" to send the patient back to the primary cardiologist.
              </p>
            </div>
          </div>
        )}

        {/* Loading / Error */}
        {loading && (
          <div className="bg-white/70 rounded-2xl p-8 text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            Loading your patients...
          </div>
        )}
        {!loading && error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-red-900 mb-4">
            {error}
          </div>
        )}

        {/* Controls */}
        {!loading && !error && (
          <div className="glass-card mb-6 p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="relative w-full lg:w-80">
                <Input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 rounded-xl bg-white/50 border-gray-200 focus:bg-white transition-colors"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/50 border border-gray-200 focus:bg-white transition-colors w-full sm:w-auto outline-none"
                >
                  <option>Sort by: A-Z</option>
                  <option>Sort by: Z-A</option>
                  <option>Sort by: Date</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/50 border border-gray-200 focus:bg-white transition-colors w-full sm:w-auto outline-none"
                >
                  <option>All Statuses</option>
                  <option>New</option>
                  <option>Diagnostic Process</option>
                  <option>Follow Up</option>
                  <option>Amyloidosis was ruled out</option>
                </select>

              <Button
                onClick={handleExcelExport}
                className="h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 w-full sm:w-auto"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel Export
              </Button>

              {/* Add Patient - only for Cardiologists */}
              {isCardiologist && (
                <Link to="/patients/register" className="w-full sm:w-auto">
                  <Button className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 w-full sm:w-auto">
                    <span className="mr-2">⊕</span> Add Patient
                  </Button>
                </Link>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Patient Sections */}
        {!loading && !error && (
          <>
            {/* My Patients Section - only for Cardiologists */}
            {isCardiologist && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 shadow-sm">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      My Patients
                    </h2>
                    <p className="text-sm text-gray-500">
                      Patients I follow as primary cardiologist ({filteredPrimary.length})
                    </p>
                  </div>
                </div>

                {filteredPrimary.length === 0 ? (
                  <div className="bg-white/70 rounded-2xl p-6 text-gray-500 text-center">
                    No patients found in this section.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredPrimary.map((patient) => renderPatientCard(patient, 'primary'))}
                  </div>
                )}
              </div>
            )}

            {/* Divider - only for Cardiologists who have both sections */}
            {isCardiologist && (
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 px-4 text-sm text-gray-500 font-medium">
                    ● ● ●
                  </span>
                </div>
              </div>
            )}

            {/* Assigned to Me Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${isSpecialist ? 'bg-purple-100' : 'bg-orange-100'}`}>
                  <UserCheck className={`w-5 h-5 ${isSpecialist ? 'text-purple-600' : 'text-orange-600'}`} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {isSpecialist ? 'Patients Referred to Me' : 'Assigned to Me'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isSpecialist
                      ? `Patients awaiting my ${currentUser?.role === 'NuclearMedicine' ? 'Nuclear Medicine' : currentUser?.role} review (${filteredConsulting.length})`
                      : `Patients assigned to me as specialist (${filteredConsulting.length})`
                    }
                  </p>
                </div>
              </div>

              {filteredConsulting.length === 0 ? (
                <div className="bg-white/70 rounded-2xl p-6 text-gray-500 text-center">
                  {isSpecialist
                    ? "No patients currently referred to you."
                    : "No assigned patients found."
                  }
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Pending Approval Section */}
                  <div>
                    <h3 className="text-md font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Pending Approval ({filteredConsulting.filter(p => p.assignmentStatus === 'Pending').length})
                    </h3>
                    {filteredConsulting.filter(p => p.assignmentStatus === 'Pending').length === 0 ? (
                      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-slate-400 text-sm text-center">
                        No pending patient approvals.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {filteredConsulting
                          .filter(p => p.assignmentStatus === 'Pending')
                          .map((patient) => renderPatientCard(patient, 'consulting'))}
                      </div>
                    )}
                  </div>

                  {/* Approved Patients Section */}
                  <div>
                    <h3 className="text-md font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Approved Patients ({filteredConsulting.filter(p => p.assignmentStatus === 'Approved').length})
                    </h3>
                    {filteredConsulting.filter(p => p.assignmentStatus === 'Approved').length === 0 ? (
                      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-slate-400 text-sm text-center">
                        No approved patients in your list.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {filteredConsulting
                          .filter(p => p.assignmentStatus === 'Approved')
                          .map((patient) => renderPatientCard(patient, 'consulting'))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
              <span className="text-gray-600 text-sm sm:text-base">
                {isCardiologist
                  ? `Showing ${totalCount} patient${totalCount !== 1 ? 's' : ''} total (${filteredPrimary.length} primary, ${filteredConsulting.length} assigned)`
                  : `Showing ${totalCount} referred patient${totalCount !== 1 ? 's' : ''}`
                }
              </span>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default PatientList;
