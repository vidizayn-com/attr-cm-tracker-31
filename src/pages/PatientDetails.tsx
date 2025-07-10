import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';

const PatientDetails = () => {
  const { id } = useParams();
  const { getPatient, updatePatient } = usePatients();
  const [patientData, setPatientData] = useState(null);
  const [caregiverPermission, setCaregiverPermission] = useState(false);
  const [caregiverData, setCaregiverData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [status, setStatus] = useState<'New' | 'Diagnosis' | 'Follow-up' | 'Cancelled'>('New');
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (id) {
      const patient = getPatient(id);
      if (patient) {
        setPatientData(patient);
        setCaregiverPermission(patient.allowCaregiver);
        setStatus(patient.status);
        setCancellationReason(patient.cancellationReason || '');
      }
    }
  }, [id, getPatient]);

  const handleSave = () => {
    if (!id || !patientData) return;
    
    // Update the patient in the shared context
    updatePatient(id, {
      status,
      cancellationReason: status === 'Cancelled' ? cancellationReason : undefined,
      allowCaregiver: caregiverPermission
    });
    
    toast.success('Patient data saved successfully!');
    console.log('Saving patient data:', {
      patientData,
      caregiverPermission,
      caregiverData,
      status,
      cancellationReason
    });
  };

  if (!patientData) {
    return <Layout><div>Loading...</div></Layout>;
  }

  // Sample history data with specialists
  const historyData = [
    {
      id: '1',
      date: '2024-12-15',
      physicianName: 'Dr. Sarah Johnson',
      specialty: 'Hematology',
      diagnosis: 'Anemia secondary to chronic disease',
      treatment: 'Iron supplementation, monitoring',
      notes: 'Patient shows improvement in hemoglobin levels. Continue current treatment plan and follow-up in 3 months.'
    },
    {
      id: '2',
      date: '2024-11-28',
      physicianName: 'Dr. Michael Chen',
      specialty: 'Nuclear Medicine',
      diagnosis: 'Bone scan - no metastatic disease',
      treatment: 'Monitoring, no active treatment needed',
      notes: 'Bone scintigraphy shows no evidence of skeletal metastases. Patient advised for regular follow-up.'
    },
    {
      id: '3',
      date: '2024-10-10',
      physicianName: 'Dr. Emily Rodriguez',
      specialty: 'Genetics',
      diagnosis: 'Genetic counseling completed',
      treatment: 'Family screening recommended',
      notes: 'Genetic testing revealed carrier status for hereditary condition. Family members advised for screening.'
    },
    {
      id: '4',
      date: '2024-09-22',
      physicianName: 'Dr. Ahmed Hassan',
      specialty: 'Hematology',
      diagnosis: 'Follow-up for thrombocytopenia',
      treatment: 'Platelet monitoring, lifestyle modifications',
      notes: 'Platelet count stable. Patient responding well to treatment modifications. Continue monitoring.'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#29a8b6' }}>Patient Details</h1>
          <div className="flex space-x-4">
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <span className="text-white font-semibold">Patient: {patientData.firstName} {patientData.lastName}</span>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <span className="text-white font-semibold">ID: {patientData.id}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mb-6">
          <Link to={`/patients/${id}/assign`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12">
              <span className="mr-2">👤</span> Assign patient
            </Button>
          </Link>
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 h-12">
            <span className="mr-2">📋</span> Report
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 h-12"
          >
            <span className="mr-2">💾</span> Save
          </Button>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Patient Information */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">👤</span>
                <span>Patient Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">First Name</label>
                  <Input value={patientData.firstName} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Last Name</label>
                  <Input value={patientData.lastName} readOnly className="bg-gray-100" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">ID</label>
                  <Input value={patientData.id} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Gender</label>
                  <Input value={patientData.gender} readOnly className="bg-gray-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Date of Birth</label>
                  <Input value={patientData.dateOfBirth} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Contact Number</label>
                  <Input value={patientData.contactNumber} readOnly className="bg-gray-100" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Address</label>
                <Input value={patientData.address} readOnly className="bg-gray-100" />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Assigned To</label>
                <Input value={patientData.assignedTo} readOnly className="bg-gray-100" />
              </div>

              {/* Status Field */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Status</label>
                <Select value={status} onValueChange={(value: 'New' | 'Diagnosis' | 'Follow-up' | 'Cancelled') => setStatus(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Diagnosis">Diagnosis</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cancellation Reason - only show when status is Cancelled */}
              {status === 'Cancelled' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Cancellation Reason</label>
                  <Textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Enter reason for cancellation"
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {/* Caregiver Permission Checkbox */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="caregiverPermission"
                    checked={caregiverPermission}
                    onCheckedChange={(checked) => setCaregiverPermission(checked as boolean)}
                  />
                  <label htmlFor="caregiverPermission" className="text-gray-700 font-semibold">
                    Permission to share caregiver information received
                  </label>
                </div>

                {/* Caregiver Information Fields - only show when checkbox is checked */}
                {caregiverPermission && (
                  <div className="space-y-4 ml-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Caregiver Name</label>
                      <Input
                        value={caregiverData.name}
                        onChange={(e) => setCaregiverData({...caregiverData, name: e.target.value})}
                        placeholder="Enter caregiver name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Caregiver Email</label>
                      <Input
                        type="email"
                        value={caregiverData.email}
                        onChange={(e) => setCaregiverData({...caregiverData, email: e.target.value})}
                        placeholder="Enter caregiver email"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Caregiver Phone</label>
                      <Input
                        type="tel"
                        value={caregiverData.phone}
                        onChange={(e) => setCaregiverData({...caregiverData, phone: e.target.value})}
                        placeholder="Enter caregiver phone"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Findings */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">📋</span>
                <span>Clinical Findings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* LVH>12 */}
              <div className={`flex items-center space-x-3 p-3 rounded-xl ${patientData.clinicalFindings.lvh12 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.clinicalFindings.lvh12 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.clinicalFindings.lvh12 && <span className="text-white text-sm">✓</span>}
                </div>
                <span className="font-semibold">LVH&gt;12</span>
                <Input value={patientData.clinicalFindings.lvh12Value} className="w-16 text-center" readOnly />
                <span>mm</span>
                {patientData.clinicalFindings.lvh12 && <span className="text-blue-600 text-sm">Meets criteria</span>}
              </div>

              {/* NT-proBNP */}
              <div className={`p-3 rounded-xl ${patientData.clinicalFindings.ntProBnp ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.clinicalFindings.ntProBnp ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    {patientData.clinicalFindings.ntProBnp && <span className="text-white text-sm">✓</span>}
                  </div>
                  <span className="font-semibold">NT-proBNP &gt;600 (or) BNP &gt;150</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input value={patientData.clinicalFindings.ntProBnpValue} className="text-center" readOnly />
                    <span className="text-sm">pg/mL</span>
                  </div>
                  <div>
                    <Input value={patientData.clinicalFindings.bnpValue} placeholder="BNP" className="text-center" readOnly />
                    <span className="text-sm">pg/mL</span>
                  </div>
                </div>
                {patientData.clinicalFindings.ntProBnp && <span className="text-blue-600 text-sm">Meets criteria</span>}
              </div>

              {/* EF >= 40 */}
              <div className={`flex items-center space-x-3 p-3 rounded-xl ${patientData.clinicalFindings.ef40 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.clinicalFindings.ef40 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.clinicalFindings.ef40 && <span className="text-white text-sm">✓</span>}
                </div>
                <span className="font-semibold">EF &gt;= 40</span>
                <Input value={patientData.clinicalFindings.ef40Value} className="w-16 text-center" readOnly />
                <span>%</span>
                {patientData.clinicalFindings.ef40 && <span className="text-blue-600 text-sm">Meets criteria</span>}
              </div>

              {/* GFR > 30 */}
              <div className={`flex items-center space-x-3 p-3 rounded-xl ${patientData.clinicalFindings.gfr30 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.clinicalFindings.gfr30 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.clinicalFindings.gfr30 && <span className="text-white text-sm">✓</span>}
                </div>
                <span className="font-semibold">GFR &gt; 30 ml/min/1.72 m²</span>
                <Input value={patientData.clinicalFindings.gfr30Value} className="w-16 text-center" readOnly />
                <span>ml/min/1.72 m²</span>
                {patientData.clinicalFindings.gfr30 && <span className="text-blue-600 text-sm">Meets criteria</span>}
              </div>

              {/* Age >= 65 */}
              <div className={`flex items-center space-x-3 p-3 rounded-xl ${patientData.clinicalFindings.age65 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.clinicalFindings.age65 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.clinicalFindings.age65 && <span className="text-white text-sm">✓</span>}
                </div>
                <span className="font-semibold">Age &gt;= 65</span>
                <Input value={patientData.clinicalFindings.age65Value} className="w-16 text-center" readOnly />
                <span>years</span>
                {patientData.clinicalFindings.age65 && <span className="text-blue-600 text-sm">Meets criteria</span>}
              </div>
            </CardContent>
          </Card>

          {/* Red Flag Symptoms */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">⚠️</span>
                <span>Red Flag Symptoms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.redFlagSymptoms.ecgHypovoltage ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.ecgHypovoltage && <span className="text-white text-sm">✓</span>}
                </div>
                <span>ECG Hypovoltage</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.redFlagSymptoms.pericardialEffusion ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.pericardialEffusion && <span className="text-white text-sm">✓</span>}
                </div>
                <span>Pericardial Effusion</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.redFlagSymptoms.biatrialDilation ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.biatrialDilation && <span className="text-white text-sm">✓</span>}
                </div>
                <span>Biatrial Dilation</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.redFlagSymptoms.thickeningInteratrialSeptum ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.thickeningInteratrialSeptum && <span className="text-white text-sm">✓</span>}
                </div>
                <span>Thickening of the Interatrial Septum and Valves</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.redFlagSymptoms.fiveFiveFiveFinding ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.fiveFiveFiveFinding && <span className="text-white text-sm">✓</span>}
                </div>
                <span>5-5-5 Finding</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.redFlagSymptoms.diastolicDysfunction ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.diastolicDysfunction && <span className="text-white text-sm">✓</span>}
                </div>
                <span>Diastolic Dysfunction with Increased Left Ventricular Filling Pressure</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.redFlagSymptoms.intoleranceHeartFailure ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.intoleranceHeartFailure && <span className="text-white text-sm">✓</span>}
                </div>
                <span>Intolerance to Standard Heart Failure Treatment</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.redFlagSymptoms.spontaneousResolutionHypertension ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.spontaneousResolutionHypertension && <span className="text-white text-sm">✓</span>}
                </div>
                <span>Spontaneous Resolution of Hypertension</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.redFlagSymptoms.taviAorticStenosis ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.taviAorticStenosis && <span className="text-white text-sm">✓</span>}
                </div>
                <span>TAVI / Aortic Stenosis</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${patientData.redFlagSymptoms.other ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.other && <span className="text-white text-sm">✓</span>}
                </div>
                <span>Other</span>
                <Input value={patientData.redFlagSymptoms.otherValue} placeholder="" className="flex-1" readOnly />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">📋</span>
              <span>History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Physician</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.date}</TableCell>
                    <TableCell>{entry.physicianName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.specialty === 'Hematology' ? 'bg-red-100 text-red-800' :
                        entry.specialty === 'Nuclear Medicine' ? 'bg-blue-100 text-blue-800' :
                        entry.specialty === 'Genetics' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.specialty}
                      </span>
                    </TableCell>
                    <TableCell>{entry.diagnosis}</TableCell>
                    <TableCell>{entry.treatment}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={entry.notes}>
                        {entry.notes}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientDetails;
