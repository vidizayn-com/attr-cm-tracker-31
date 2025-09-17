
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const PatientRegistration = () => {
  const navigate = useNavigate();
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
    }
  });

  const handleSubmit = () => {
    console.log('Patient registration submitted:', formData);
    navigate('/patients');
  };

  const handleCancel = () => {
    navigate('/patients');
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
                <div className="flex items-start space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.redFlagSymptoms.other}
                    onChange={(e) => setFormData({
                      ...formData,
                      redFlagSymptoms: {...formData.redFlagSymptoms, other: e.target.checked}
                    })}
                    className="w-5 h-5 flex-shrink-0 mt-1"
                  />
                  <span className="text-sm sm:text-base">Other</span>
                </div>
                <div className="ml-8">
                  <Input
                    value={formData.redFlagSymptoms.otherValue}
                    onChange={(e) => setFormData({
                      ...formData,
                      redFlagSymptoms: {...formData.redFlagSymptoms, otherValue: e.target.value}
                    })}
                    placeholder="Specify other symptom"
                    className="h-8 sm:h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
          <Button
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 sm:px-8 h-12 w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 sm:px-8 h-12 w-full sm:w-auto order-1 sm:order-2"
          >
            Submit
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PatientRegistration;
