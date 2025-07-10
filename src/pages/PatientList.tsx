
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FileSpreadsheet } from 'lucide-react';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import { exportPatientsToExcel } from '@/utils/excelExport';

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('A-Z');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  const { patients } = usePatients();

  const getStatusBadge = (status: string) => {
    const styles = {
      'New': 'bg-green-500 text-white',
      'Diagnosis': 'bg-orange-500 text-white',
      'Follow-up': 'bg-blue-500 text-white',
      'Cancelled': 'bg-red-500 text-white'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-500 text-white';
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleExcelExport = () => {
    exportPatientsToExcel(patients);
  };

  return (
    <Layout>
      <div className="p-2 sm:p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: '#29a8b6' }}>Patient List</h1>
        </div>

        {/* Controls */}
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

            <Link to="/patients/register" className="w-full sm:w-auto">
              <Button className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 w-full sm:w-auto">
                <span className="mr-2">⊕</span> Add patient
              </Button>
            </Link>
          </div>
        </div>

        {/* Patient Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {patients.map((patient) => (
            <Card key={patient.id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-none hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(patient.status)} whitespace-nowrap`}>
                    {patient.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm sm:text-base text-gray-700 mb-4">
                  <p><span className="font-semibold">ID:</span> {patient.id}</p>
                  <p><span className="font-semibold">Age:</span> {calculateAge(patient.dateOfBirth)}</p>
                  <p><span className="font-semibold">Last Visit:</span> {patient.lastVisit}</p>
                  <p><span className="font-semibold">Next Appointment:</span> {patient.nextAppointment}</p>
                  <p><span className="font-semibold">Assigned to:</span> Cardiologist</p>
                </div>

                <Link to={`/patients/${patient.id}`} className="w-full">
                  <Button 
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-600 border border-gray-200 rounded-xl"
                  >
                    View Full Profile →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-gray-600 text-sm sm:text-base">Showing 1-{patients.length} of {patients.length} patients</span>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" className="bg-white/90 text-gray-700 border-none rounded-xl text-sm px-3 py-1 sm:px-4 sm:py-2">
              Previous
            </Button>
            <Button className="bg-blue-600 text-white rounded-xl w-8 h-8 sm:w-10 sm:h-10 text-sm">1</Button>
            <Button variant="outline" className="bg-white/90 text-gray-700 border-none rounded-xl w-8 h-8 sm:w-10 sm:h-10 text-sm">2</Button>
            <Button variant="outline" className="bg-white/90 text-gray-700 border-none rounded-xl w-8 h-8 sm:w-10 sm:h-10 text-sm">3</Button>
            <Button variant="outline" className="bg-white/90 text-gray-700 border-none rounded-xl w-8 h-8 sm:w-10 sm:h-10 text-sm">4</Button>
            <Button variant="outline" className="bg-white/90 text-gray-700 border-none rounded-xl text-sm px-3 py-1 sm:px-4 sm:py-2">
              Next
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientList;
