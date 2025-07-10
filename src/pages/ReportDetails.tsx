
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import { ArrowLeft, Upload, User, FileText, AlertTriangle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportDetails = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState({
    cardiology: null as File | null,
    nuclear: null as File | null,
    genetic: null as File | null,
    hematology: null as File | null
  });

  const handleFileChange = (reportType: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [reportType]: file }));
  };

  const handleSubmit = () => {
    // Handle form submission
    navigate('/report-tracker');
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/report-tracker')}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: '#29a8b6' }}>
            Report Details
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Patient Information */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                <User className="w-5 h-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input placeholder="Enter patient full name" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <Input type="date" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <Input placeholder="Enter contact number" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Textarea placeholder="Enter address" className="rounded-xl" />
              </div>
            </CardContent>
          </Card>

          {/* Clinical Findings */}
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                <Heart className="w-5 h-5 mr-2" />
                Clinical Findings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LVH12 Value</label>
                <Input placeholder="Enter LVH12 value" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NT-proBNP Value</label>
                <Input placeholder="Enter NT-proBNP value" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EF40 Value</label>
                <Input placeholder="Enter EF40 value" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GFR30 Value</label>
                <Input placeholder="Enter GFR30 value" className="rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Red Flag Symptoms */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-none mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-900">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Red Flag Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'ECG Hypovoltage',
                'Pericardial Effusion',
                'Biatrial Dilation',
                'Thickening Interatrial Septum',
                '5-5-5 Finding',
                'Diastolic Dysfunction',
                'Intolerance Heart Failure',
                'Spontaneous Resolution Hypertension',
                'TAVI Aortic Stenosis'
              ].map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={symptom}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={symptom} className="text-sm text-gray-700">
                    {symptom}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Symptoms</label>
              <Textarea placeholder="Describe other symptoms..." className="rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* Report Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[
            { title: 'Cardiology Report', key: 'cardiology' },
            { title: 'Nuclear Medicine Report', key: 'nuclear' },
            { title: 'Genetic Report', key: 'genetic' },
            { title: 'Hematology Report', key: 'hematology' }
          ].map((report) => (
            <Card key={report.key} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-bold text-gray-900">
                  <FileText className="w-5 h-5 mr-2" />
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Notes</label>
                  <Textarea 
                    placeholder={`Enter ${report.title.toLowerCase()} notes...`}
                    className="rounded-xl min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                    <input
                      type="file"
                      id={`file-${report.key}`}
                      className="hidden"
                      onChange={(e) => handleFileChange(report.key as keyof typeof files, e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    <label htmlFor={`file-${report.key}`} className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {files[report.key as keyof typeof files]?.name || 'Click to upload file'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG</p>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate('/report-tracker')}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl px-8"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8"
          >
            Save Report
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ReportDetails;
