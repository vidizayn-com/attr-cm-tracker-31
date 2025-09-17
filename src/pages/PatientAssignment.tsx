
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { SpecialistType, Hospital, Specialist } from '@/types/patient';

const PatientAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSpecialistType, setSelectedSpecialistType] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('');
  const [searchHospital, setSearchHospital] = useState('');
  const [searchSpecialist, setSearchSpecialist] = useState('');
  const [notes, setNotes] = useState('');

  const specialistTypes: SpecialistType[] = [
    {
      id: 'hematology',
      name: 'Hematology',
      icon: '🔬',
      description: 'AL Discrimination'
    },
    {
      id: 'nuclear',
      name: 'Nuclear Medicine',
      icon: '☢️',
      description: 'Scintigraphy interpretation'
    },
    {
      id: 'genetic',
      name: 'Genetic',
      icon: '🧬',
      description: 'Genetic test confirmation'
    }
  ];

  const hospitals: Hospital[] = [
    {
      id: '1',
      name: 'City General Hospital',
      address: '123 Main St, Downtown'
    },
    {
      id: '2',
      name: 'University Medical Center',
      address: '456 College Ave, Westside'
    },
    {
      id: '3',
      name: 'Memorial Healthcare',
      address: '789 Park Blvd, Northside'
    }
  ];

  const specialists: Specialist[] = [
    // City General Hospital - Hematology
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      type: 'hematology',
      hospitalId: '1'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      type: 'hematology',
      hospitalId: '1'
    },
    // City General Hospital - Nuclear Medicine
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      type: 'nuclear',
      hospitalId: '1'
    },
    // University Medical Center - Hematology
    {
      id: '4',
      name: 'Dr. David Thompson',
      type: 'hematology',
      hospitalId: '2'
    },
    {
      id: '5',
      name: 'Dr. Lisa Wang',
      type: 'hematology',
      hospitalId: '2'
    },
    // University Medical Center - Nuclear Medicine
    {
      id: '6',
      name: 'Dr. Robert Davis',
      type: 'nuclear',
      hospitalId: '2'
    },
    {
      id: '7',
      name: 'Dr. Anna Kowalski',
      type: 'nuclear',
      hospitalId: '2'
    },
    // University Medical Center - Genetic
    {
      id: '8',
      name: 'Dr. James Wilson',
      type: 'genetic',
      hospitalId: '2'
    },
    // Memorial Healthcare - Genetic
    {
      id: '9',
      name: 'Dr. Maria Garcia',
      type: 'genetic',
      hospitalId: '3'
    },
    {
      id: '10',
      name: 'Dr. Thomas Brown',
      type: 'genetic',
      hospitalId: '3'
    },
    // Memorial Healthcare - Nuclear Medicine
    {
      id: '11',
      name: 'Dr. Jennifer Lee',
      type: 'nuclear',
      hospitalId: '3'
    }
  ];

  // Filter specialists based on selected hospital and specialist type
  const filteredSpecialists = specialists.filter(specialist => 
    specialist.hospitalId === selectedHospital && 
    specialist.type === selectedSpecialistType &&
    specialist.name.toLowerCase().includes(searchSpecialist.toLowerCase())
  );

  const handleSubmit = () => {
    // Handle assignment submission
    console.log('Assignment submitted:', {
      specialistType: selectedSpecialistType,
      hospital: selectedHospital,
      specialist: selectedSpecialist,
      notes
    });
    navigate(`/patients/${id}`);
  };

  const handleCancel = () => {
    navigate(`/patients/${id}`);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#29a8b6' }}>Patient Assignment</h1>
          <div className="flex space-x-4">
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <span className="text-white font-semibold">Patient: Sara Tancredi</span>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <span className="text-white font-semibold">ID: 30952462934</span>
            </div>
          </div>
        </div>

        {/* Three Step Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Step 1: Select Specialist Type */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader>
              <CardTitle>1. Select Specialist Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {specialistTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setSelectedSpecialistType(type.id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    selectedSpecialistType === type.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{type.icon}</div>
                    <div>
                      <div className="font-semibold text-lg">{type.name}</div>
                      <div className="text-gray-600 text-sm">{type.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Step 2: Select Hospital */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader>
              <CardTitle>2. Select Hospital</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search hospitals"
                    value={searchHospital}
                    onChange={(e) => setSearchHospital(e.target.value)}
                    className="pl-10"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-gray-500">🔍</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {hospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    onClick={() => setSelectedHospital(hospital.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedHospital === hospital.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{hospital.name}</div>
                    <div className="text-gray-600 text-sm">{hospital.address}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Select Specialist */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader>
              <CardTitle>3. Select Specialist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search specialists"
                    value={searchSpecialist}
                    onChange={(e) => setSearchSpecialist(e.target.value)}
                    className="pl-10"
                    disabled={!selectedSpecialistType || !selectedHospital}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-gray-500">🔍</span>
                  </div>
                </div>
              </div>

              {(!selectedSpecialistType || !selectedHospital) && (
                <div className="text-center text-gray-500 py-8">
                  Please select a "specialist type" and "hospital" first
                </div>
              )}

              {selectedSpecialistType && selectedHospital && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {/* Patient Pool Option */}
                  <div
                    onClick={() => setSelectedSpecialist('patient-pool')}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedSpecialist === 'patient-pool'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">👥</div>
                      <div>
                        <div className="font-semibold text-purple-600">Patient Pool</div>
                        <div className="text-gray-600 text-sm">
                          Assign to available specialists in this category
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Specialists */}
                  {filteredSpecialists.length > 0 ? (
                    filteredSpecialists.map((specialist) => (
                      <div
                        key={specialist.id}
                        onClick={() => setSelectedSpecialist(specialist.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          selectedSpecialist === specialist.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">{specialist.name}</div>
                        <div className="text-gray-600 text-sm capitalize">
                          {specialistTypes.find(t => t.id === specialist.type)?.name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No individual specialists found for the selected criteria
                    </div>
                  )}
                </div>
              )}

              {/* Notes Section */}
              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Add notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-xl resize-none"
                  placeholder="Enter any additional notes..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 h-12"
            disabled={!selectedSpecialistType || !selectedHospital || !selectedSpecialist}
          >
            Submit
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PatientAssignment;
