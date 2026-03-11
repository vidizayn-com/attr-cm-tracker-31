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
      New: "bg-green-500 text-white",
      Diagnosis: "bg-orange-500 text-white",
      Specialist_Review: "bg-purple-500 text-white",
      "Follow-up": "bg-blue-500 text-white",
      Cancelled: "bg-red-500 text-white",
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

    let assignedDisplay = "Patient Pool";
    if (patient.primary_cardiologist) {
      assignedDisplay = patient.primary_cardiologist.fullName;
    } else if (status === 'Pending_Cardiologist_Assignment') {
      assignedDisplay = "Pending Assignment";
    }

    const detailParam = safeText(patient.documentId) || String(patient.id);
    const isReturning = returningPatient === patient.documentId;

    return (
      <Card
        key={`${sectionType}-${patient.documentId || patient.id}`}
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-none hover:shadow-2xl transition-shadow duration-300"
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {patientFullName(patient)}
            </h3>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(status)} whitespace-nowrap`}
            >
              {status}
            </span>
          </div>

          {/* Report deadline warning - only for Follow-up patients */}
          {(() => {
            if (status !== 'Follow-up' || !patient.reportDeadline) return null;
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
            <p>
              <span className="font-semibold">ID:</span> {patient.id}
            </p>
            <p>
              <span className="font-semibold">Age:</span> {calculateAge(patient.dateOfBirth)}
            </p>
            <p>
              <span className="font-semibold">Last Visit:</span>{' '}
              {patient.lastVisit
                ? new Date(patient.lastVisit).toLocaleDateString('tr-TR')
                : <span className="text-gray-400">-</span>}
            </p>
            <p>
              <span className="font-semibold">Next Appointment:</span>{' '}
              {patient.nextAppointment
                ? new Date(patient.nextAppointment).toLocaleDateString('tr-TR')
                : <span className="text-gray-400">-</span>}
            </p>
            <p>
              <span className="font-semibold">Primary Cardiologist:</span>{' '}
              <span className="text-blue-600 font-medium">{assignedDisplay}</span>
            </p>
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
                className="w-full bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-600 border border-gray-200 rounded-xl"
              >
                View Full Profile →
              </Button>
            </Link>

            {/* Return to Cardiologist button - for consulting section */}
            {sectionType === 'consulting' && (
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
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="p-2 sm:p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: "#29a8b6" }}>
            Patient List
          </h1>
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div className="relative w-full lg:w-80">
              <Input
                type="text"
                placeholder="Search patients"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-10 bg-white/90 border-none rounded-xl"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-500">🔍</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 px-4 bg-white/90 border-none rounded-xl w-full sm:w-auto"
              >
                <option>Sort by: A-Z</option>
                <option>Sort by: Z-A</option>
                <option>Sort by: Date</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 px-4 bg-white/90 border-none rounded-xl w-full sm:w-auto"
              >
                <option>All Statuses</option>
                <option>New</option>
                <option>Diagnosis</option>
                <option>Specialist_Review</option>
                <option>Follow-up</option>
                <option>Cancelled</option>
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
        )}

        {/* Patient Sections */}
        {!loading && !error && (
          <>
            {/* My Patients Section - only for Cardiologists */}
            {isCardiologist && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100">
                    <Users className="w-5 h-5 text-blue-600" />
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
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredConsulting.map((patient) => renderPatientCard(patient, 'consulting'))}
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
