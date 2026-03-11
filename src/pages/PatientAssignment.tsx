
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { strapiGet, strapiPost } from '@/lib/strapiClient';
import {
  Loader2,
  Building2,
  Users,
  UserCheck,
  Stethoscope,
  Activity,
  CheckCircle2,
  HeartPulse,
  Microscope,
  Atom,
  Dna,
  Search,
  ArrowLeft,
} from 'lucide-react';

// ── Types ──
interface Institution {
  id: number;
  documentId: string;
  name: string;
  address?: string;
  poolPatientCount: number;
}

interface DoctorWorkload {
  id: number;
  documentId: string;
  fullName: string;
  specialty: string;
  email?: string;
  primaryPatientCount: number;
  consultingPatientCount: number;
  totalPatientCount: number;
}

interface SpecialistType {
  id: string;
  strapiValue: string; // Strapi 'specialty' enum value
  name: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  description: string;
}

const specialistTypes: SpecialistType[] = [
  {
    id: 'cardiology',
    strapiValue: 'Cardiology',
    name: 'Cardiology',
    icon: <HeartPulse className="w-5 h-5" />,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    description: 'Primary Owner',
  },
  {
    id: 'hematology',
    strapiValue: 'Hematology',
    name: 'Hematology',
    icon: <Microscope className="w-5 h-5" />,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    description: 'AL Discrimination',
  },
  {
    id: 'nuclear',
    strapiValue: 'NuclearMedicine',
    name: 'Nuclear Medicine',
    icon: <Atom className="w-5 h-5" />,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    description: 'Scintigraphy interpretation',
  },
  {
    id: 'genetic',
    strapiValue: 'Genetics',
    name: 'Genetic',
    icon: <Dna className="w-5 h-5" />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    description: 'Genetic test confirmation',
  },
];

const PatientAssignment = () => {
  const { id: patientDocumentId } = useParams();
  const navigate = useNavigate();

  // Step selections
  const [selectedSpecialistType, setSelectedSpecialistType] = useState<string>('');
  const [selectedHospitalDocId, setSelectedHospitalDocId] = useState<string>('');
  const [selectedDoctorDocId, setSelectedDoctorDocId] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Search
  const [searchHospital, setSearchHospital] = useState('');
  const [searchSpecialist, setSearchSpecialist] = useState('');

  // Data
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [doctors, setDoctors] = useState<DoctorWorkload[]>([]);

  // Loading states
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Patient info (fetched separately)
  const [patientName, setPatientName] = useState('Loading...');

  // ── Fetch patient name ──
  useEffect(() => {
    if (!patientDocumentId) return;
    (async () => {
      try {
        // Do NOT send custom JWT to Strapi standard API – it causes 401
        const res = await fetch(
          `${import.meta.env.VITE_STRAPI_URL}/api/patients/${patientDocumentId}?fields[0]=firstName&fields[1]=lastName`
        );
        const json = await res.json();
        const patient = json?.data || json;
        const first = patient?.firstName || patient?.first_name || '';
        const last = patient?.lastName || patient?.last_name || '';
        setPatientName(`${first} ${last}`.trim() || 'Unknown');
      } catch {
        setPatientName('Unknown');
      }
    })();
  }, [patientDocumentId]);

  // ── Fetch institutions ──
  useEffect(() => {
    (async () => {
      setLoadingInstitutions(true);
      try {
        const data = await strapiGet<Institution[]>('/api/auth/doctor/institutions');
        setInstitutions(data || []);
      } catch (e: any) {
        console.error('Failed to load institutions', e);
        toast.error('Failed to load hospitals');
      } finally {
        setLoadingInstitutions(false);
      }
    })();
  }, []);

  // ── Fetch doctors when hospital or specialty changes ──
  useEffect(() => {
    if (!selectedHospitalDocId || !selectedSpecialistType) {
      setDoctors([]);
      return;
    }

    const specialtyObj = specialistTypes.find((s) => s.id === selectedSpecialistType);
    if (!specialtyObj) return;

    let alive = true;
    (async () => {
      setLoadingDoctors(true);
      setSelectedDoctorDocId('');
      try {
        const data = await strapiGet<DoctorWorkload[]>(
          `/api/auth/doctor/doctors-by-institution?institutionId=${selectedHospitalDocId}&specialty=${specialtyObj.strapiValue}`
        );
        if (alive) setDoctors(data || []);
      } catch (e: any) {
        console.error('Failed to load doctors', e);
        if (alive) toast.error('Failed to load doctors');
      } finally {
        if (alive) setLoadingDoctors(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedHospitalDocId, selectedSpecialistType]);

  // Reset doctor selection when hospital or specialty changes
  useEffect(() => {
    setSelectedDoctorDocId('');
  }, [selectedHospitalDocId, selectedSpecialistType]);

  // Filtered hospitals
  const filteredInstitutions = useMemo(() => {
    const term = searchHospital.trim().toLowerCase();
    if (!term) return institutions;
    return institutions.filter(
      (i) =>
        i.name.toLowerCase().includes(term) ||
        (i.address || '').toLowerCase().includes(term)
    );
  }, [institutions, searchHospital]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    const term = searchSpecialist.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter(
      (d) =>
        d.fullName.toLowerCase().includes(term) ||
        (d.email || '').toLowerCase().includes(term)
    );
  }, [doctors, searchSpecialist]);

  // ── Workload bar helper ──
  const getWorkloadColor = (count: number) => {
    if (count <= 5) return 'bg-green-500';
    if (count <= 15) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getWorkloadLabel = (count: number) => {
    if (count <= 5) return 'Low';
    if (count <= 15) return 'Medium';
    return 'High';
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (submitting) return;

    if (!patientDocumentId) {
      toast.error('Patient ID is missing');
      return;
    }

    setSubmitting(true);

    try {
      const specialtyObj = specialistTypes.find((s) => s.id === selectedSpecialistType);

      if (selectedDoctorDocId === 'patient-pool') {
        // Assign to hospital pool
        await strapiPost('/api/auth/doctor/assign-patient', {
          patientDocumentId,
          assignType: 'pool',
          institutionDocumentId: selectedHospitalDocId,
          specialty: specialtyObj?.strapiValue,
          notes,
        });
        toast.success('Patient assigned to hospital pool successfully!');
      } else {
        // Assign to specific doctor
        await strapiPost('/api/auth/doctor/assign-patient', {
          patientDocumentId,
          assignType: 'specialist',
          doctorDocumentId: selectedDoctorDocId,
          specialty: specialtyObj?.strapiValue,
          notes,
        });
        toast.success('Patient assigned to specialist successfully!');
      }

      navigate(`/patients/${patientDocumentId}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/patients/${patientDocumentId}`);
  };

  const selectedHospitalName =
    institutions.find((i) => i.documentId === selectedHospitalDocId)?.name || '';
  const selectedHospitalPoolCount =
    institutions.find((i) => i.documentId === selectedHospitalDocId)?.poolPatientCount || 0;

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: '#29a8b6' }}>
            Patient Assignment
          </h1>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
              <span className="text-gray-700 font-semibold text-sm sm:text-base">
                🧑‍⚕️ {patientName}
              </span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
              <span className="text-gray-500 text-xs sm:text-sm font-mono">
                {patientDocumentId?.slice(0, 12)}...
              </span>
            </div>
          </div>
        </div>

        {/* Three Step Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* ─── Step 1: Select Specialist Type ─── */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-full bg-[hsl(184,44%,90%)] flex items-center justify-center text-sm font-bold text-[hsl(184,58%,44%)]">
                  1
                </div>
                Select Department
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {specialistTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setSelectedSpecialistType(type.id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedSpecialistType === type.id
                    ? 'border-[hsl(184,58%,44%)] bg-[hsl(184,44%,96%)] shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type.iconBg} ${type.iconColor}`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{type.name}</div>
                      <div className="text-gray-500 text-sm">{type.description}</div>
                    </div>
                    {selectedSpecialistType === type.id && (
                      <CheckCircle2 className="w-5 h-5 text-[hsl(184,58%,44%)]" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ─── Step 2: Select Hospital ─── */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-full bg-[hsl(184,44%,90%)] flex items-center justify-center text-sm font-bold text-[hsl(184,58%,44%)]">
                  2
                </div>
                <Building2 className="w-5 h-5 text-[hsl(184,58%,44%)]" />
                Select Hospital
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4 relative">
                <Input
                  type="text"
                  placeholder="Search hospitals..."
                  value={searchHospital}
                  onChange={(e) => setSearchHospital(e.target.value)}
                  className="pl-10 h-11"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {loadingInstitutions ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading hospitals...
                </div>
              ) : filteredInstitutions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No hospitals found</div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {filteredInstitutions.map((inst) => (
                    <div
                      key={inst.documentId}
                      onClick={() => setSelectedHospitalDocId(inst.documentId)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedHospitalDocId === inst.documentId
                        ? 'border-[hsl(184,58%,44%)] bg-[hsl(184,44%,96%)] shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-900">{inst.name}</div>
                          {inst.address && (
                            <div className="text-gray-500 text-sm mt-0.5">{inst.address}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {selectedHospitalDocId === inst.documentId && (
                            <CheckCircle2 className="w-5 h-5 text-[hsl(184,58%,44%)]" />
                          )}
                        </div>
                      </div>
                      {/* Pool count */}
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>{inst.poolPatientCount} patient(s) in pool</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── Step 3: Select Doctor ─── */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-full bg-[hsl(184,44%,90%)] flex items-center justify-center text-sm font-bold text-[hsl(184,58%,44%)]">
                  3
                </div>
                <Stethoscope className="w-5 h-5 text-[hsl(184,58%,44%)]" />
                Select Specialist
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4 relative">
                <Input
                  type="text"
                  placeholder="Search specialists..."
                  value={searchSpecialist}
                  onChange={(e) => setSearchSpecialist(e.target.value)}
                  className="pl-10 h-11"
                  disabled={!selectedSpecialistType || !selectedHospitalDocId}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {!selectedSpecialistType || !selectedHospitalDocId ? (
                <div className="text-center text-gray-400 py-8 space-y-2">
                  <Stethoscope className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="text-sm">Select a department and hospital first</p>
                </div>
              ) : loadingDoctors ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading doctors...
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {/* ── Patient Pool Option ── */}
                  <div
                    onClick={() => setSelectedDoctorDocId('patient-pool')}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedDoctorDocId === 'patient-pool'
                      ? 'border-[hsl(184,94%,34%)] bg-[hsl(184,44%,96%)] shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[hsl(184,44%,90%)] flex items-center justify-center">
                        <Users className="w-5 h-5 text-[hsl(184,58%,44%)]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[hsl(184,91%,17%)]">
                          Patient Pool – {selectedHospitalName}
                        </div>
                        <div className="text-gray-500 text-sm">
                          Assign to hospital pool for available specialists
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[hsl(184,58%,44%)]">
                          {selectedHospitalPoolCount}
                        </div>
                        <div className="text-xs text-gray-400">in pool</div>
                      </div>
                      {selectedDoctorDocId === 'patient-pool' && (
                        <CheckCircle2 className="w-5 h-5 text-[hsl(184,58%,44%)]" />
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  {filteredDoctors.length > 0 && (
                    <div className="flex items-center gap-2 py-1">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 font-medium">or assign directly</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}

                  {/* ── Individual Doctors ── */}
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                      <div
                        key={doc.documentId}
                        onClick={() => setSelectedDoctorDocId(doc.documentId)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedDoctorDocId === doc.documentId
                          ? 'border-[hsl(184,58%,44%)] bg-[hsl(184,44%,96%)] shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[hsl(184,44%,90%)] flex items-center justify-center text-lg font-bold text-[hsl(184,58%,44%)]">
                              {doc.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{doc.fullName}</div>
                              <div className="text-gray-500 text-sm">{doc.specialty}</div>
                            </div>
                          </div>
                          {selectedDoctorDocId === doc.documentId && (
                            <CheckCircle2 className="w-5 h-5 text-[hsl(184,58%,44%)] mt-1" />
                          )}
                        </div>

                        {/* Workload Bar */}
                        <div className="mt-3 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 flex items-center gap-1">
                              <Activity className="w-3 h-3" /> Workload
                            </span>
                            <span
                              className={`font-semibold px-2 py-0.5 rounded-full text-white text-[10px] ${getWorkloadColor(doc.totalPatientCount)}`}
                            >
                              {getWorkloadLabel(doc.totalPatientCount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${getWorkloadColor(doc.totalPatientCount)}`}
                              style={{
                                width: `${Math.min((doc.totalPatientCount / 30) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-gray-400">
                            <span className="font-semibold text-gray-600">
                              {doc.totalPatientCount} patient(s)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-4 text-sm">
                      No doctors found for this department at the selected hospital
                    </div>
                  )}
                </div>
              )}

              {/* Notes Section */}
              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Add notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-200 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(184,58%,44%)]/30"
                  placeholder="Enter any additional notes about this assignment..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="rounded-xl px-8 h-11 w-full sm:w-auto border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white rounded-xl px-8 h-11 w-full sm:w-auto shadow-sm transition-all"
            disabled={
              !selectedSpecialistType ||
              !selectedHospitalDocId ||
              !selectedDoctorDocId ||
              submitting
            }
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Assigning...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" /> Submit Assignment
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PatientAssignment;
