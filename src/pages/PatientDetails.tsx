import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import { Copy, History, Upload, FileText, Image, Trash2, Eye, TrendingUp } from 'lucide-react';

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
  const [showHistoricalRecords, setShowHistoricalRecords] = useState(false);
  const [historicalFilter, setHistoricalFilter] = useState({
    doctor: '',
    testName: '',
    dateFrom: '',
    dateTo: ''
  });
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: 'Lab_Results_2024-12-10.pdf',
      type: 'pdf',
      size: '2.3 MB',
      uploadDate: '2024-12-10',
      category: 'Lab Results'
    },
    {
      id: 2,
      name: 'Echocardiogram_Report.pdf',
      type: 'pdf',
      size: '1.8 MB',
      uploadDate: '2024-12-08',
      category: 'Imaging'
    },
    {
      id: 3,
      name: 'Patient_Photo.jpg',
      type: 'image',
      size: '450 KB',
      uploadDate: '2024-12-05',
      category: 'Photos'
    },
    {
      id: 4,
      name: 'Previous_Medical_History.pdf',
      type: 'pdf',
      size: '3.1 MB',
      uploadDate: '2024-11-28',
      category: 'Medical History'
    }
  ]);
  const [fileUploadData, setFileUploadData] = useState({
    fileName: '',
    category: 'General'
  });
  const [showNtProBnpChart, setShowNtProBnpChart] = useState(false);
  const [showGfrChart, setShowGfrChart] = useState(false);

  // Historical chart data
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

  // Generate diagnosis summary based on patient data
  const generateDiagnosisSummary = () => {
    const clinicalFindings = [];
    const redFlags = [];
    
    // Check clinical findings
    if (patientData.clinicalFindings.lvh12) clinicalFindings.push(`LVH >12mm (${patientData.clinicalFindings.lvh12Value}mm)`);
    if (patientData.clinicalFindings.ntProBnp) clinicalFindings.push(`Elevated NT-proBNP (${patientData.clinicalFindings.ntProBnpValue} pg/mL)`);
    if (patientData.clinicalFindings.ef40) clinicalFindings.push(`Preserved EF (${patientData.clinicalFindings.ef40Value}%)`);
    if (patientData.clinicalFindings.gfr30) clinicalFindings.push(`GFR >30 (${patientData.clinicalFindings.gfr30Value} ml/min/1.73m²)`);
    if (patientData.clinicalFindings.age65) clinicalFindings.push(`Age ≥65 years (${patientData.clinicalFindings.age65Value} years)`);
    
    // Check red flag symptoms
    if (patientData.redFlagSymptoms.ecgHypovoltage) redFlags.push('ECG hypovoltage');
    if (patientData.redFlagSymptoms.pericardialEffusion) redFlags.push('pericardial effusion');
    if (patientData.redFlagSymptoms.biatrialDilation) redFlags.push('biatrial dilation');
    if (patientData.redFlagSymptoms.thickeningInteratrialSeptum) redFlags.push('thickening of interatrial septum and valves');
    if (patientData.redFlagSymptoms.fiveFiveFiveFinding) redFlags.push('5-5-5 finding');
    if (patientData.redFlagSymptoms.diastolicDysfunction) redFlags.push('diastolic dysfunction with increased LV filling pressure');
    if (patientData.redFlagSymptoms.intoleranceHeartFailure) redFlags.push('intolerance to standard heart failure treatment');
    if (patientData.redFlagSymptoms.spontaneousResolutionHypertension) redFlags.push('spontaneous resolution of hypertension');
    if (patientData.redFlagSymptoms.taviAorticStenosis) redFlags.push('TAVI/aortic stenosis');
    if (patientData.redFlagSymptoms.other && patientData.redFlagSymptoms.otherValue) redFlags.push(patientData.redFlagSymptoms.otherValue);

    const summary = `PATIENT DIAGNOSIS SUMMARY

Patient: ${patientData.firstName} ${patientData.lastName}
ID: ${patientData.id}
Status: ${status}

CLINICAL PRESENTATION:
Based on comprehensive evaluation, this ${patientData.clinicalFindings.age65Value || 'adult'}-year-old ${patientData.gender.toLowerCase()} patient presents with clinical findings suggestive of cardiac amyloidosis evaluation.

SIGNIFICANT CLINICAL FINDINGS:
${clinicalFindings.length > 0 ? clinicalFindings.map(finding => `• ${finding}`).join('\n') : '• No significant clinical findings documented'}

RED FLAG SYMPTOMS:
${redFlags.length > 0 ? redFlags.map(flag => `• ${flag}`).join('\n') : '• No red flag symptoms documented'}

ASSESSMENT:
The constellation of clinical findings ${clinicalFindings.length > 0 ? 'including ' + clinicalFindings.slice(0, 2).join(' and ') : ''} ${redFlags.length > 0 ? 'along with red flag symptoms such as ' + redFlags.slice(0, 2).join(' and ') : ''} ${clinicalFindings.length > 0 || redFlags.length > 0 ? 'warrants further evaluation for cardiac amyloidosis' : 'requires continued monitoring and evaluation'}.

RECOMMENDATIONS:
• Continue comprehensive cardiac evaluation
• Consider advanced imaging studies if indicated
• Multidisciplinary consultation as appropriate
• Regular follow-up monitoring
• Patient and family education regarding condition

Generated on: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`;

    return summary;
  };

  // Generate comprehensive historical clinical records
  const generateHistoricalRecords = () => {
    const allRecords = [
      // LVH Echocardiogram records
      { date: '2024-12-10', doctor: 'Dr. Sarah Johnson', testName: 'Echocardiogram - LVH', result: '14.2', unit: 'mm' },
      { date: '2024-11-15', doctor: 'Dr. Michael Chen', testName: 'Echocardiogram - LVH', result: '13.8', unit: 'mm' },
      { date: '2024-10-20', doctor: 'Dr. Sarah Johnson', testName: 'Echocardiogram - LVH', result: '13.5', unit: 'mm' },
      { date: '2024-09-25', doctor: 'Dr. Robert Kim', testName: 'Echocardiogram - LVH', result: '13.1', unit: 'mm' },
      
      // NT-proBNP records
      { date: '2024-12-08', doctor: 'Dr. Emily Rodriguez', testName: 'NT-proBNP', result: '850', unit: 'pg/mL' },
      { date: '2024-11-12', doctor: 'Dr. Ahmed Hassan', testName: 'NT-proBNP', result: '780', unit: 'pg/mL' },
      { date: '2024-10-18', doctor: 'Dr. Emily Rodriguez', testName: 'NT-proBNP', result: '720', unit: 'pg/mL' },
      { date: '2024-09-22', doctor: 'Dr. Lisa Wang', testName: 'NT-proBNP', result: '680', unit: 'pg/mL' },
      { date: '2024-08-28', doctor: 'Dr. Ahmed Hassan', testName: 'NT-proBNP', result: '650', unit: 'pg/mL' },
      
      // BNP records
      { date: '2024-11-25', doctor: 'Dr. Lisa Wang', testName: 'BNP', result: '180', unit: 'pg/mL' },
      { date: '2024-10-30', doctor: 'Dr. David Thompson', testName: 'BNP', result: '165', unit: 'pg/mL' },
      { date: '2024-09-15', doctor: 'Dr. Lisa Wang', testName: 'BNP', result: '155', unit: 'pg/mL' },
      
      // Ejection Fraction records
      { date: '2024-12-05', doctor: 'Dr. Robert Kim', testName: 'Ejection Fraction', result: '42', unit: '%' },
      { date: '2024-11-10', doctor: 'Dr. Maria Santos', testName: 'Ejection Fraction', result: '44', unit: '%' },
      { date: '2024-10-12', doctor: 'Dr. Robert Kim', testName: 'Ejection Fraction', result: '45', unit: '%' },
      { date: '2024-09-08', doctor: 'Dr. Maria Santos', testName: 'Ejection Fraction', result: '46', unit: '%' },
      
      // GFR records
      { date: '2024-12-01', doctor: 'Dr. David Thompson', testName: 'GFR', result: '65', unit: 'ml/min/1.73m²' },
      { date: '2024-11-05', doctor: 'Dr. Jennifer Lee', testName: 'GFR', result: '68', unit: 'ml/min/1.73m²' },
      { date: '2024-10-10', doctor: 'Dr. David Thompson', testName: 'GFR', result: '70', unit: 'ml/min/1.73m²' },
      { date: '2024-09-12', doctor: 'Dr. Jennifer Lee', testName: 'GFR', result: '72', unit: 'ml/min/1.73m²' },
      
      // Additional comprehensive tests
      { date: '2024-12-03', doctor: 'Dr. Anna Kowalski', testName: 'Troponin I', result: '0.8', unit: 'ng/mL' },
      { date: '2024-11-20', doctor: 'Dr. James Wilson', testName: 'CRP', result: '8.5', unit: 'mg/L' },
      { date: '2024-11-18', doctor: 'Dr. Anna Kowalski', testName: 'Creatinine', result: '1.2', unit: 'mg/dL' },
      { date: '2024-11-02', doctor: 'Dr. Peter Brown', testName: 'Hemoglobin', result: '12.8', unit: 'g/dL' },
      { date: '2024-10-28', doctor: 'Dr. James Wilson', testName: 'Total Cholesterol', result: '220', unit: 'mg/dL' },
      { date: '2024-10-25', doctor: 'Dr. Anna Kowalski', testName: 'HDL Cholesterol', result: '45', unit: 'mg/dL' },
      { date: '2024-10-22', doctor: 'Dr. Peter Brown', testName: 'LDL Cholesterol', result: '145', unit: 'mg/dL' },
      { date: '2024-10-18', doctor: 'Dr. James Wilson', testName: 'Triglycerides', result: '150', unit: 'mg/dL' },
      { date: '2024-10-15', doctor: 'Dr. Anna Kowalski', testName: 'HbA1c', result: '6.2', unit: '%' },
      { date: '2024-10-05', doctor: 'Dr. Peter Brown', testName: 'TSH', result: '2.4', unit: 'mIU/L' },
      { date: '2024-09-28', doctor: 'Dr. James Wilson', testName: 'Vitamin D', result: '28', unit: 'ng/mL' },
      { date: '2024-09-20', doctor: 'Dr. Anna Kowalski', testName: 'Vitamin B12', result: '350', unit: 'pg/mL' },
      { date: '2024-09-18', doctor: 'Dr. Peter Brown', testName: 'Folate', result: '12', unit: 'ng/mL' },
      { date: '2024-09-10', doctor: 'Dr. James Wilson', testName: 'Uric Acid', result: '6.8', unit: 'mg/dL' },
      { date: '2024-08-30', doctor: 'Dr. Anna Kowalski', testName: 'Albumin', result: '4.2', unit: 'g/dL' },
    ];

    return allRecords;
  };

  // Filter and sort historical records
  const getFilteredAndSortedRecords = () => {
    let filtered = generateHistoricalRecords();

    // Apply filters
    if (historicalFilter.doctor) {
      filtered = filtered.filter(record => 
        record.doctor.toLowerCase().includes(historicalFilter.doctor.toLowerCase())
      );
    }

    if (historicalFilter.testName) {
      filtered = filtered.filter(record => 
        record.testName.toLowerCase().includes(historicalFilter.testName.toLowerCase())
      );
    }

    if (historicalFilter.dateFrom) {
      filtered = filtered.filter(record => 
        new Date(record.date) >= new Date(historicalFilter.dateFrom)
      );
    }

    if (historicalFilter.dateTo) {
      filtered = filtered.filter(record => 
        new Date(record.date) <= new Date(historicalFilter.dateTo)
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: string | number = a[sortConfig.key as keyof typeof a];
        let bValue: string | number = b[sortConfig.key as keyof typeof b];

        // Handle date sorting
        if (sortConfig.key === 'date') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        // Handle numeric result sorting
        if (sortConfig.key === 'result') {
          aValue = parseFloat(aValue as string) || 0;
          bValue = parseFloat(bValue as string) || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sort by date (newest first)
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return filtered;
  };

  // Handle column sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (key: 'doctor' | 'testName') => {
    const allRecords = generateHistoricalRecords();
    return [...new Set(allRecords.map(record => record[key]))].sort();
  };

  // Handle file upload (mock)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && fileUploadData.fileName.trim()) {
      Array.from(files).forEach(file => {
        const newFile = {
          id: Date.now() + Math.random(),
          name: fileUploadData.fileName || file.name,
          type: file.type.includes('image') ? 'image' : 'pdf',
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
          category: fileUploadData.category
        };
        setUploadedFiles(prev => [...prev, newFile]);
      });
      setFileUploadData({ fileName: '', category: 'General' });
      toast.success(`${files.length} file(s) uploaded successfully!`);
    } else if (files && !fileUploadData.fileName.trim()) {
      toast.error('Please enter a file name before uploading.');
    }
  };

  // Handle file deletion
  const handleFileDelete = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast.success('File deleted successfully!');
  };

  // Handle file view (mock)
  const handleFileView = (fileName: string) => {
    toast.info(`Opening ${fileName}...`);
  };

  const handleCopyDiagnosis = async () => {
    try {
      await navigator.clipboard.writeText(generateDiagnosisSummary());
      toast.success('Diagnosis summary copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy diagnosis summary');
    }
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
        <div className="flex flex-wrap justify-end gap-4 mb-6">
          <Link to={`/patients/${id}/assign`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12">
              <span className="mr-2">👤</span> Assign patient
            </Button>
          </Link>
          <Button 
            onClick={() => window.open('https://ofisimheryerde.sharepoint.com/:b:/r/sites/vidizaynpm/Shared%20Documents/VidiDocs/Projects/ATTR-CM%20Tracker/ATTR_CM_Patient_Report_Final_Example.pdf?csf=1&web=1&e=nsF3sZ', '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 h-12"
          >
            <span className="mr-2">📋</span> Report
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-6 h-12">
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
                      value={fileUploadData.fileName}
                      onChange={(e) => setFileUploadData(prev => ({ ...prev, fileName: e.target.value }))}
                      placeholder="Enter file name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <Select 
                      value={fileUploadData.category} 
                      onValueChange={(value) => setFileUploadData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Lab Results">Lab Results</SelectItem>
                        <SelectItem value="Imaging">Imaging</SelectItem>
                        <SelectItem value="Medical History">Medical History</SelectItem>
                        <SelectItem value="Photos">Photos</SelectItem>
                        <SelectItem value="Assessment">Assessment</SelectItem>
                        <SelectItem value="Identification">Identification</SelectItem>
                        <SelectItem value="Reports">Reports</SelectItem>
                      </SelectContent>
                    </Select>
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
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
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
                    {uploadedFiles.map((file) => (
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
                    {uploadedFiles.length === 0 && (
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
              
              <div className="grid grid-cols-1 gap-4">
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📋</span>
                  <span>Clinical Findings</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      <History className="w-4 h-4 mr-2" />
                      Historical Records
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>Historical Clinical Records</DialogTitle>
                    </DialogHeader>
                    
                    {/* Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium mb-1">Doctor</label>
                        <Select 
                          value={historicalFilter.doctor || 'all-doctors'} 
                          onValueChange={(value) => setHistoricalFilter({...historicalFilter, doctor: value === 'all-doctors' ? '' : value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All doctors" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="all-doctors">All doctors</SelectItem>
                            {getUniqueValues('doctor').map(doctor => (
                              <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Test Name</label>
                        <Select 
                          value={historicalFilter.testName || 'all-tests'} 
                          onValueChange={(value) => setHistoricalFilter({...historicalFilter, testName: value === 'all-tests' ? '' : value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All tests" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="all-tests">All tests</SelectItem>
                            {getUniqueValues('testName').map(testName => (
                              <SelectItem key={testName} value={testName}>{testName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Date From</label>
                        <Input
                          type="date"
                          value={historicalFilter.dateFrom}
                          onChange={(e) => setHistoricalFilter({...historicalFilter, dateFrom: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Date To</label>
                        <Input
                          type="date"
                          value={historicalFilter.dateTo}
                          onChange={(e) => setHistoricalFilter({...historicalFilter, dateTo: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Showing {getFilteredAndSortedRecords().length} of {generateHistoricalRecords().length} records
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setHistoricalFilter({ doctor: '', testName: '', dateFrom: '', dateTo: '' });
                          setSortConfig(null);
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white">
                          <TableRow>
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleSort('date')}
                            >
                              Date {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleSort('doctor')}
                            >
                              Doctor {sortConfig?.key === 'doctor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleSort('testName')}
                            >
                              Test Name {sortConfig?.key === 'testName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleSort('result')}
                            >
                              Result {sortConfig?.key === 'result' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead>Result Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredAndSortedRecords().map((record, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell>{new Date(record.date).toLocaleDateString('tr-TR')}</TableCell>
                              <TableCell>{record.doctor}</TableCell>
                              <TableCell>{record.testName}</TableCell>
                              <TableCell className="font-mono">{record.result}</TableCell>
                              <TableCell>{record.unit}</TableCell>
                            </TableRow>
                          ))}
                          {getFilteredAndSortedRecords().length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                No records found matching the current filters
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </DialogContent>
                </Dialog>
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
                  <button 
                    onClick={() => setShowNtProBnpChart(true)}
                    className="ml-auto p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="View NT-proBNP trend"
                  >
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </button>
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
                <button 
                  onClick={() => setShowGfrChart(true)}
                  className="ml-auto p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  title="View GFR trend"
                >
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </button>
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
              
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${patientData.redFlagSymptoms.other ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {patientData.redFlagSymptoms.other && <span className="text-white text-sm">✓</span>}
                </div>
                <div className="flex-1">
                  <span>Other / Doctor's Comment</span>
                  <Textarea value={patientData.redFlagSymptoms.otherValue} placeholder="" className="mt-2 min-h-40 resize-none w-full" rows={10} readOnly />
                </div>
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

        {/* Diagnosis Summary */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🩺</span>
                <span>Diagnosis Summary</span>
              </div>
              <Button
                onClick={handleCopyDiagnosis}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:bg-[#29a8b6] hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-xl">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                {generateDiagnosisSummary()}
              </pre>
            </div>
            <div className="mt-4 text-xs text-gray-500 italic">
              * This summary is automatically generated based on patient data and clinical findings. 
              Please review and validate all information before clinical use.
            </div>
          </CardContent>
        </Card>

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

export default PatientDetails;
