import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { UserCheck, Search, Filter, Loader2, UserPlus } from 'lucide-react';
import { strapiGet, strapiPost } from '@/lib/strapiClient';
import { useUser } from '@/contexts/UserContext';

// ── Types ──
type PoolPatient = {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  age: number | null;
  dateOfBirth: string | null;
  contactNumber: string | null;
  registrationDate: string | null;
  lastVisit: string | null;
  nextAppointment: string | null;
  hospital: {
    id: number;
    documentId: string;
    name: string;
  } | null;
  primaryCardiologist: {
    id: number;
    documentId: string;
    fullName: string;
    specialty: string;
  } | null;
};

const PatientPool = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PoolPatient[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // ── Fetch pool patients ──
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await strapiGet<PoolPatient[]>('/api/auth/doctor/pool-patients');
        setPatients(data || []);
      } catch (e: any) {
        console.error('Failed to load pool patients', e);
        toast.error('Failed to load pool patients');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Derive unique hospital names for filter ──
  const hospitalNames = useMemo(() => {
    const names = new Set<string>();
    patients.forEach((p) => {
      if (p.hospital?.name) names.add(p.hospital.name);
    });
    return Array.from(names).sort();
  }, [patients]);

  // ── Filter ──
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        fullName.includes(searchTerm.toLowerCase()) ||
        String(patient.id).includes(searchTerm);

      const matchesHospital =
        hospitalFilter === 'all' ||
        patient.hospital?.name === hospitalFilter;

      return matchesSearch && matchesHospital;
    });
  }, [patients, searchTerm, hospitalFilter]);

  const handleViewPatient = (documentId: string) => {
    navigate(`/patients/${documentId}`);
  };

  const handleAssignPatient = (documentId: string) => {
    navigate(`/patients/${documentId}/assign`);
  };

  const handleAssignToMe = async (patient: PoolPatient) => {
    if (assigningId) return;
    setAssigningId(patient.documentId);
    try {
      await strapiPost('/api/auth/doctor/assign-to-me', {
        patientDocumentId: patient.documentId,
      });
      toast.success(`${patient.firstName} ${patient.lastName} assigned to you!`);
      // Remove from list
      setPatients((prev) => prev.filter((p) => p.documentId !== patient.documentId));
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to assign patient');
    } finally {
      setAssigningId(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#29a8b6' }}>Patient Pool</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {loading ? '...' : `${filteredPatients.length} patients waiting`}
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-auto"
                />
              </div>

              {/* Hospital Filter */}
              <div className="w-full">
                <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
                  <SelectTrigger className="h-10 sm:h-auto">
                    <SelectValue placeholder="All Hospitals" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all">All Hospitals</SelectItem>
                    {hospitalNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setHospitalFilter('all');
                  }}
                  className="w-full h-10 sm:h-auto"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Pool Table */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Patients Waiting for Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-3" />
                <p className="text-gray-500">Loading pool patients...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Patient ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">Name</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Age</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Registration Date</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Hospital</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Primary Cardiologist</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Last Visit</TableHead>
                      <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.documentId} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-xs sm:text-sm">{patient.id}</TableCell>
                        <TableCell>
                          <div className="font-medium text-xs sm:text-sm">
                            {patient.firstName} {patient.lastName}
                          </div>
                          {/* Mobile-only extra info */}
                          <div className="text-xs text-gray-500 sm:hidden">
                            {patient.age ? `Age: ${patient.age}` : ''}
                            {patient.registrationDate ? ` • ${formatDate(patient.registrationDate)}` : ''}
                          </div>
                          <div className="text-xs text-gray-500 lg:hidden">
                            {patient.hospital?.name || 'No hospital'}
                          </div>
                          <div className="text-xs text-gray-500 xl:hidden">
                            {patient.primaryCardiologist?.fullName || 'No cardiologist'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                          {patient.age ?? '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                          {formatDate(patient.registrationDate)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-xs sm:text-sm text-gray-600">
                            {patient.hospital?.name || <span className="text-gray-400">-</span>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="text-xs sm:text-sm font-medium">
                            {patient.primaryCardiologist?.fullName || <span className="text-gray-400">Not assigned</span>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs sm:text-sm">
                          {formatDate(patient.lastVisit)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAssignToMe(patient)}
                              disabled={assigningId === patient.documentId}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-2 py-1 sm:px-3 sm:py-2"
                            >
                              {assigningId === patient.documentId ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                              ) : (
                                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              )}
                              <span className="hidden sm:inline">Assign to Me</span>
                              <span className="sm:hidden">Me</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAssignPatient(patient.documentId)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 sm:px-3 sm:py-2"
                            >
                              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="hidden sm:inline">Assign</span>
                              <span className="sm:hidden">Assign</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewPatient(patient.documentId)}
                              className="text-xs px-2 py-1 sm:px-3 sm:py-2"
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredPatients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-base sm:text-lg font-medium">No patients found in pool</p>
                    <p className="text-xs sm:text-sm">
                      {patients.length === 0
                        ? 'No patients are currently in the patient pool'
                        : 'Try adjusting your search criteria'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientPool;