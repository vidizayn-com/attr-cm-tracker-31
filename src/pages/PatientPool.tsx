import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { UserCheck, Search, Filter } from 'lucide-react';

const PatientPool = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');

  // Mock data for patients waiting in pool
  const poolPatients = [
    {
      id: '1',
      firstName: 'Sara',
      lastName: 'Tancredi',
      age: 45,
      registrationDate: '2024-12-15',
      hospital: 'City General Hospital',
      expectedSpecialty: 'Hematology',
      assignedCardiologist: 'Dr. Michael Scofield',
      status: 'Waiting Assignment',
      priority: 'High'
    },
    {
      id: '2',
      firstName: 'Lincoln',
      lastName: 'Burrows',
      age: 52,
      registrationDate: '2024-12-14',
      hospital: 'University Medical Center',
      expectedSpecialty: 'Nuclear Medicine',
      assignedCardiologist: 'Dr. Sarah Johnson',
      status: 'Waiting Assignment',
      priority: 'Medium'
    },
    {
      id: '3',
      firstName: 'Theodore',
      lastName: 'Bagwell',
      age: 48,
      registrationDate: '2024-12-13',
      hospital: 'Memorial Healthcare',
      expectedSpecialty: 'Genetic',
      assignedCardiologist: 'Dr. Michael Scofield',
      status: 'Waiting Assignment',
      priority: 'High'
    },
    {
      id: '4',
      firstName: 'Fernando',
      lastName: 'Sucre',
      age: 38,
      registrationDate: '2024-12-12',
      hospital: 'City General Hospital',
      expectedSpecialty: 'Hematology',
      assignedCardiologist: 'Dr. Emily Rodriguez',
      status: 'Waiting Assignment',
      priority: 'Low'
    },
    {
      id: '5',
      firstName: 'John',
      lastName: 'Abruzzi',
      age: 55,
      registrationDate: '2024-12-11',
      hospital: 'University Medical Center',
      expectedSpecialty: 'Nuclear Medicine',
      assignedCardiologist: 'Dr. Michael Scofield',
      status: 'Waiting Assignment',
      priority: 'Medium'
    }
  ];

  const hospitals = ['City General Hospital', 'University Medical Center', 'Memorial Healthcare'];
  const specialties = ['Hematology', 'Nuclear Medicine', 'Genetic'];

  // Filter patients based on search and filters
  const filteredPatients = poolPatients.filter(patient => {
    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHospital = hospitalFilter === '' || patient.hospital === hospitalFilter;
    const matchesSpecialty = specialtyFilter === '' || patient.expectedSpecialty === specialtyFilter;
    
    return matchesSearch && matchesHospital && matchesSpecialty;
  });

  const handleAssignToMe = (patientId: string, patientName: string) => {
    // Handle assignment to current user
    toast.success(`${patientName} assigned to you successfully!`);
    console.log(`Assigning patient ${patientId} to current user`);
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case 'Hematology': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Nuclear Medicine': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Genetic': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#29a8b6' }}>Patient Pool</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {filteredPatients.length} patients waiting
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Hospital Filter */}
              <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Hospitals" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="">All Hospitals</SelectItem>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital} value={hospital}>
                      {hospital}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Specialty Filter */}
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="">All Specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setHospitalFilter('');
                  setSpecialtyFilter('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Pool Table */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
          <CardHeader>
            <CardTitle>Patients Waiting for Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Expected Specialty</TableHead>
                    <TableHead>Assigned Cardiologist</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">{patient.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </div>
                      </TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{new Date(patient.registrationDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">{patient.hospital}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getSpecialtyColor(patient.expectedSpecialty)} border`}>
                          {patient.expectedSpecialty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{patient.assignedCardiologist}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPriorityColor(patient.priority)} border`}>
                          {patient.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAssignToMe(patient.id, `${patient.firstName} ${patient.lastName}`)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Assign to Me
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewPatient(patient.id)}
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
                  <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No patients found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientPool;