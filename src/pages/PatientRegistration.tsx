
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, FileText, Image, Trash2, Eye, TrendingUp } from 'lucide-react';

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [showNtProBnpChart, setShowNtProBnpChart] = useState(false);
  const [showGfrChart, setShowGfrChart] = useState(false);

  // Historical chart data for demonstration
  const ntProBnpChartData = [
    { date: '2024-08-28', value: 650, normal: 600 },
    { date: '2024-09-22', value: 680, normal: 600 },
    { date: '2024-10-18', value: 720, normal: 600 },
    { date: '2024-11-12', value: 780, normal: 600 },
    { date: '2024-12-08', value: 850, normal: 600 }
  ];

  const gfrChartData = [
    { date: '2024-09-12', value: 72, normal: 30 },
    { date: '2024-10-10', value: 70, normal: 30 },
    { date: '2024-11-05', value: 68, normal: 30 },
    { date: '2024-12-01', value: 65, normal: 30 }
  ];
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    contactNumber: '',
    email: '',
    caregiverPermission: false,
    caregiverName: '',
    caregiverEmail: '',
    caregiverPhone: '',
    clinicalFindings: {
      lvh12: false,
      lvh12Value: '',
      ntProBnp: false,
      ntProBnpValue: '',
      bnpValue: '',
      ef40: false,
      ef40Value: '',
      gfr30: false,
      gfr30Value: '',
      age65: false,
      age65Value: ''
    },
    redFlagSymptoms: {
      ecgHypovoltage: false,
      pericardialEffusion: false,
      biatrialDilation: false,
      thickeningInteratrialSeptum: false,
      fiveFiveFiveFinding: false,
      diastolicDysfunction: false,
      intoleranceHeartFailure: false,
      spontaneousResolutionHypertension: false,
      taviAorticStenosis: false,
      other: false,
      otherValue: ''
    },
    uploadedFiles: [
      {
        id: 1,
        name: 'Initial_Assessment.pdf',
        type: 'pdf',
        size: '1.2 MB',
        uploadDate: '2024-12-17',
        category: 'Assessment'
      },
      {
        id: 2,
        name: 'Patient_ID_Copy.jpg',
        type: 'image',
        size: '320 KB',
        uploadDate: '2024-12-17',
        category: 'Identification'
      }
    ],
    fileUploadData: {
      fileName: '',
      category: 'General'
    }
  });

  const handleSubmit = () => {
    console.log('Patient registration submitted:', formData);
    navigate('/patients');
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  // Handle file upload (mock)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && formData.fileUploadData.fileName.trim()) {
      Array.from(files).forEach(file => {
        const newFile = {
          id: Date.now() + Math.random(),
          name: formData.fileUploadData.fileName || file.name,
          type: file.type.includes('image') ? 'image' : 'pdf',
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          category: formData.fileUploadData.category
        };
        setFormData(prev => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, newFile],
          fileUploadData: { fileName: '', category: 'General' }
        }));
      });
      toast.success(`${files.length} file(s) uploaded successfully!`);
    } else if (files && !formData.fileUploadData.fileName.trim()) {
      toast.error('Please enter a file name before uploading.');
    }
  };

  // Handle file deletion
  const handleFileDelete = (fileId: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId)
    }));
    toast.success('File deleted successfully!');
  };

  // Handle file view (mock)
  const handleFileView = (fileName: string) => {
    toast.info(`Opening ${fileName}...`);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left" style={{ color: '#29a8b6' }}>ATTR-CM Patient Registration</h1>
        </div>

        {/* Mobile-First Responsive Layout */}
        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 mb-6 sm:mb-8">
          {/* Patient Information */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <span className="text-xl sm:text-2xl">👤</span>
                <span>Patient Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="First Name"
                    className="h-10 sm:h-auto"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Last Name"
                    className="h-10 sm:h-auto"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm sm:text-base"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    placeholder="mm/dd/yyyy"
                    className="h-10 sm:h-auto"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Contact Number</label>
                  <Input
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    placeholder="(+90) --- -- -- --"
                    className="h-10 sm:h-auto"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                  className="h-10 sm:h-auto"
                />
              </div>

              {/* Caregiver Permission Checkbox */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="caregiverPermission"
                    checked={formData.caregiverPermission}
                    onCheckedChange={(checked) => setFormData({...formData, caregiverPermission: checked as boolean})}
                    className="mt-1"
                  />
                  <label htmlFor="caregiverPermission" className="text-gray-700 font-semibold text-sm sm:text-base leading-relaxed">
                    Permission to share caregiver information received
                  </label>
                </div>

                {/* Caregiver Information Fields - only show when checkbox is checked */}
                {formData.caregiverPermission && (
                  <div className="space-y-4 ml-3 sm:ml-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Caregiver Name</label>
                      <Input
                        value={formData.caregiverName}
                        onChange={(e) => setFormData({...formData, caregiverName: e.target.value})}
                        placeholder="Enter caregiver name"
                        className="h-10 sm:h-auto"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Caregiver Email</label>
                      <Input
                        type="email"
                        value={formData.caregiverEmail}
                        onChange={(e) => setFormData({...formData, caregiverEmail: e.target.value})}
                        placeholder="Enter caregiver email"
                        className="h-10 sm:h-auto"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Caregiver Phone</label>
                      <Input
                        type="tel"
                        value={formData.caregiverPhone}
                        onChange={(e) => setFormData({...formData, caregiverPhone: e.target.value})}
                        placeholder="Enter caregiver phone"
                        className="h-10 sm:h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Findings */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <span className="text-xl sm:text-2xl">📋</span>
                <span>Clinical Findings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* LVH>12 */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.clinicalFindings.lvh12}
                    onChange={(e) => setFormData({
                      ...formData,
                      clinicalFindings: {...formData.clinicalFindings, lvh12: e.target.checked}
                    })}
                    className="w-5 h-5 flex-shrink-0"
                  />
                  <span className="font-semibold text-sm sm:text-base">LVH&gt;12</span>
                </div>
                <div className="flex items-center space-x-2 ml-8">
                  <Input
                    value={formData.clinicalFindings.lvh12Value}
                    onChange={(e) => setFormData({
                      ...formData,
                      clinicalFindings: {...formData.clinicalFindings, lvh12Value: e.target.value}
                    })}
                    className="w-20 text-center h-8 sm:h-10"
                    placeholder="Value"
                  />
                  <span className="text-sm">mm</span>
                </div>
              </div>

              {/* NT-proBNP */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-start space-x-3 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.clinicalFindings.ntProBnp}
                    onChange={(e) => setFormData({
                      ...formData,
                      clinicalFindings: {...formData.clinicalFindings, ntProBnp: e.target.checked}
                    })}
                    className="w-5 h-5 flex-shrink-0 mt-1"
                  />
                  <span className="font-semibold text-sm sm:text-base leading-tight">NT-proBNP &gt;600 (or) BNP &gt;150</span>
                  <button 
                    onClick={() => setShowNtProBnpChart(true)}
                    className="ml-auto p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="View NT-proBNP trend"
                  >
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
                <div className="ml-8 space-y-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={formData.clinicalFindings.ntProBnpValue}
                        onChange={(e) => setFormData({
                          ...formData,
                          clinicalFindings: {...formData.clinicalFindings, ntProBnpValue: e.target.value}
                        })}
                        className="w-20 text-center h-8 sm:h-10"
                        placeholder="Value"
                      />
                      <span className="text-sm">pg/mL (NT-proBNP)</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={formData.clinicalFindings.bnpValue}
                        onChange={(e) => setFormData({
                          ...formData,
                          clinicalFindings: {...formData.clinicalFindings, bnpValue: e.target.value}
                        })}
                        className="w-20 text-center h-8 sm:h-10"
                        placeholder="Value"
                      />
                      <span className="text-sm">pg/mL (BNP)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* EF >= 40 */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.clinicalFindings.ef40}
                    onChange={(e) => setFormData({
                      ...formData,
                      clinicalFindings: {...formData.clinicalFindings, ef40: e.target.checked}
                    })}
                    className="w-5 h-5 flex-shrink-0"
                  />
                  <span className="font-semibold text-sm sm:text-base">EF &gt;= 40</span>
                </div>
                <div className="flex items-center space-x-2 ml-8">
                  <Input
                    value={formData.clinicalFindings.ef40Value}
                    onChange={(e) => setFormData({
                      ...formData,
                      clinicalFindings: {...formData.clinicalFindings, ef40Value: e.target.value}
                    })}
                    className="w-20 text-center h-8 sm:h-10"
                    placeholder="Value"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>

              {/* GFR > 30 */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-start space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.clinicalFindings.gfr30}
                    onChange={(e) => setFormData({
                      ...formData,
                      clinicalFindings: {...formData.clinicalFindings, gfr30: e.target.checked}
                    })}
                    className="w-5 h-5 flex-shrink-0 mt-1"
                  />
                  <span className="font-semibold text-sm sm:text-base leading-tight">GFR &gt; 30 ml/min/1.72 m²</span>
                  <button 
                    onClick={() => setShowGfrChart(true)}
                    className="ml-auto p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="View GFR trend"
                  >
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 ml-8">
                  <Input
                    value={formData.clinicalFindings.gfr30Value}
                    onChange={(e) => setFormData({
                      ...formData,
                      clinicalFindings: {...formData.clinicalFindings, gfr30Value: e.target.value}
                    })}
                    className="w-20 text-center h-8 sm:h-10"
                    placeholder="Value"
                  />
                  <span className="text-xs sm:text-sm">ml/min/1.72 m²</span>
                </div>
              </div>

              {/* Age >= 65 */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.clinicalFindings.age65}
                    onChange={(e) => setFormData({
                      ...formData,
                      clinicalFindings: {...formData.clinicalFindings, age65: e.target.checked}
                    })}
                    className="w-5 h-5 flex-shrink-0"
                  />
                  <span className="font-semibold text-sm sm:text-base">Age &gt;= 65</span>
                </div>
                <div className="flex items-center space-x-2 ml-8">
                  <Input
                    value={formData.clinicalFindings.age65Value}
                    onChange={(e) => setFormData({
                      ...formData,
                      clinicalFindings: {...formData.clinicalFindings, age65Value: e.target.value}
                    })}
                    className="w-20 text-center h-8 sm:h-10"
                    placeholder="Value"
                  />
                  <span className="text-sm">years</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Red Flag Symptoms */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <span className="text-xl sm:text-2xl">⚠️</span>
                <span>Red Flag Symptoms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3 p-2">
                <input
                  type="checkbox"
                  checked={formData.redFlagSymptoms.ecgHypovoltage}
                  onChange={(e) => setFormData({
                    ...formData,
                    redFlagSymptoms: {...formData.redFlagSymptoms, ecgHypovoltage: e.target.checked}
                  })}
                  className="w-5 h-5 flex-shrink-0 mt-1"
                />
                <span className="text-sm sm:text-base leading-relaxed">ECG Hypovoltage</span>
              </div>
              
              <div className="flex items-start space-x-3 p-2">
                <input
                  type="checkbox"
                  checked={formData.redFlagSymptoms.pericardialEffusion}
                  onChange={(e) => setFormData({
                    ...formData,
                    redFlagSymptoms: {...formData.redFlagSymptoms, pericardialEffusion: e.target.checked}
                  })}
                  className="w-5 h-5 flex-shrink-0 mt-1"
                />
                <span className="text-sm sm:text-base leading-relaxed">Pericardial Effusion</span>
              </div>
              
              <div className="flex items-start space-x-3 p-2">
                <input
                  type="checkbox"
                  checked={formData.redFlagSymptoms.biatrialDilation}
                  onChange={(e) => setFormData({
                    ...formData,
                    redFlagSymptoms: {...formData.redFlagSymptoms, biatrialDilation: e.target.checked}
                  })}
                  className="w-5 h-5 flex-shrink-0 mt-1"
                />
                <span className="text-sm sm:text-base leading-relaxed">Biatrial Dilation</span>
              </div>
              
              <div className="flex items-start space-x-3 p-2">
                <input
                  type="checkbox"
                  checked={formData.redFlagSymptoms.thickeningInteratrialSeptum}
                  onChange={(e) => setFormData({
                    ...formData,
                    redFlagSymptoms: {...formData.redFlagSymptoms, thickeningInteratrialSeptum: e.target.checked}
                  })}
                  className="w-5 h-5 flex-shrink-0 mt-1"
                />
                <span className="text-sm sm:text-base leading-relaxed">Thickening of the Interatrial Septum and Valves</span>
              </div>
              
              <div className="flex items-start space-x-3 p-2">
                <input
                  type="checkbox"
                  checked={formData.redFlagSymptoms.fiveFiveFiveFinding}
                  onChange={(e) => setFormData({
                    ...formData,
                    redFlagSymptoms: {...formData.redFlagSymptoms, fiveFiveFiveFinding: e.target.checked}
                  })}
                  className="w-5 h-5 flex-shrink-0 mt-1"
                />
                <span className="text-sm sm:text-base leading-relaxed">5-5-5 Finding</span>
              </div>
              
              <div className="flex items-start space-x-3 p-2">
                <input
                  type="checkbox"
                  checked={formData.redFlagSymptoms.diastolicDysfunction}
                  onChange={(e) => setFormData({
                    ...formData,
                    redFlagSymptoms: {...formData.redFlagSymptoms, diastolicDysfunction: e.target.checked}
                  })}
                  className="w-5 h-5 flex-shrink-0 mt-1"
                />
                <span className="text-sm sm:text-base leading-relaxed">Diastolic Dysfunction with Increased Left Ventricular Filling Pressure</span>
              </div>
              
              <div className="flex items-start space-x-3 p-2">
                <input
                  type="checkbox"
                  checked={formData.redFlagSymptoms.intoleranceHeartFailure}
                  onChange={(e) => setFormData({
                    ...formData,
                    redFlagSymptoms: {...formData.redFlagSymptoms, intoleranceHeartFailure: e.target.checked}
                  })}
                  className="w-5 h-5 flex-shrink-0 mt-1"
                />
                <span className="text-sm sm:text-base leading-relaxed">Intolerance to Standard Heart Failure Treatment</span>
              </div>
              
              <div className="flex items-start space-x-3 p-2">
                <input
                  type="checkbox"
                  checked={formData.redFlagSymptoms.spontaneousResolutionHypertension}
                  onChange={(e) => setFormData({
                    ...formData,
                    redFlagSymptoms: {...formData.redFlagSymptoms, spontaneousResolutionHypertension: e.target.checked}
                  })}
                  className="w-5 h-5 flex-shrink-0 mt-1"
                />
                <span className="text-sm sm:text-base leading-relaxed">Spontaneous Resolution of Hypertension</span>
              </div>
              
              <div className="flex items-start space-x-3 p-2">
                <input
                  type="checkbox"
                  checked={formData.redFlagSymptoms.taviAorticStenosis}
                  onChange={(e) => setFormData({
                    ...formData,
                    redFlagSymptoms: {...formData.redFlagSymptoms, taviAorticStenosis: e.target.checked}
                  })}
                  className="w-5 h-5 flex-shrink-0 mt-1"
                />
                <span className="text-sm sm:text-base leading-relaxed">TAVI / Aortic Stenosis</span>
              </div>
              
              <div className="p-2">
                <div className="flex items-start space-x-3 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.redFlagSymptoms.other}
                    onChange={(e) => setFormData({
                      ...formData,
                      redFlagSymptoms: {...formData.redFlagSymptoms, other: e.target.checked}
                    })}
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm sm:text-base">Other / Doctor's Comment</span>
                    <Textarea
                      value={formData.redFlagSymptoms.otherValue}
                      onChange={(e) => setFormData({
                        ...formData,
                        redFlagSymptoms: {...formData.redFlagSymptoms, otherValue: e.target.value}
                      })}
                      placeholder="Enter additional symptoms or doctor's comments"
                      className="mt-2 min-h-40 resize-none w-full"
                      rows={10}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-6 sm:px-8 h-12 w-full sm:w-auto order-3 sm:order-1">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Patient Files</DialogTitle>
              </DialogHeader>
              
              {/* File Upload Form */}
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File Name</label>
                    <Input
                      value={formData.fileUploadData.fileName}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        fileUploadData: { ...prev.fileUploadData, fileName: e.target.value }
                      }))}
                      placeholder="Enter file name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.fileUploadData.category}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        fileUploadData: { ...prev.fileUploadData, category: e.target.value }
                      }))}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md"
                    >
                      <option value="General">General</option>
                      <option value="Lab Results">Lab Results</option>
                      <option value="Imaging">Imaging</option>
                      <option value="Medical History">Medical History</option>
                      <option value="Photos">Photos</option>
                      <option value="Assessment">Assessment</option>
                      <option value="Identification">Identification</option>
                      <option value="Reports">Reports</option>
                    </select>
                  </div>
                </div>
                
                {/* File Upload Section */}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload-registration"
                  />
                  <label htmlFor="file-upload-registration" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium text-gray-600">Click to upload files</p>
                      <p className="text-sm text-gray-500">Supports PDF, Images, Documents</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Uploaded Files List */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.uploadedFiles.map((file) => (
                      <TableRow key={file.id} className="hover:bg-gray-50">
                        <TableCell className="flex items-center space-x-2">
                          {file.type === 'image' ? (
                            <Image className="w-4 h-4 text-blue-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-red-500" />
                          )}
                          <span>{file.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            file.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {file.type.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>{file.size}</TableCell>
                        <TableCell>{new Date(file.uploadDate).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>{file.category}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileView(file.name)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileDelete(file.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {formData.uploadedFiles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          No files uploaded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 sm:px-8 h-12 w-full sm:w-auto order-2 sm:order-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 sm:px-8 h-12 w-full sm:w-auto order-1 sm:order-3"
          >
            Submit
          </Button>
        </div>

        {/* NT-proBNP Chart Dialog */}
        <Dialog open={showNtProBnpChart} onOpenChange={setShowNtProBnpChart}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>NT-proBNP Trend Analysis</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ntProBnpChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} pg/mL`, 
                        name === 'value' ? 'NT-proBNP' : 'Normal Threshold'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
                      name="NT-proBNP"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="normal" 
                      stroke="#dc2626" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Normal Threshold (600 pg/mL)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Trend Analysis</h4>
                <p className="text-blue-800 text-sm">
                  NT-proBNP levels show an upward trend over the past 4 months, increasing from 650 pg/mL to 850 pg/mL. 
                  All values remain above the threshold of 600 pg/mL, indicating persistent elevation requiring continued monitoring.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* GFR Chart Dialog */}
        <Dialog open={showGfrChart} onOpenChange={setShowGfrChart}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>GFR Trend Analysis</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gfrChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} ml/min/1.73m²`, 
                        name === 'value' ? 'GFR' : 'Minimum Threshold'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#16a34a" 
                      strokeWidth={3}
                      dot={{ fill: '#16a34a', strokeWidth: 2, r: 6 }}
                      name="GFR"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="normal" 
                      stroke="#dc2626" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Minimum Threshold (30 ml/min/1.73m²)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Trend Analysis</h4>
                <p className="text-green-800 text-sm">
                  GFR shows a gradual decline from 72 to 65 ml/min/1.73m² over 3 months. 
                  Values remain well above the minimum threshold of 30 ml/min/1.73m², indicating acceptable kidney function.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PatientRegistration;
