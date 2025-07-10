
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getPatientProfile, PatientProfile } from '@/data/mockPatients';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState<PatientProfile>({
    id: '',
    fullName: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    age: 0,
    specialty: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    institution: '',
    registrationNumber: '',
    lastVisit: '',
    nextAppointment: '',
    assignedTo: '',
    caregiverPermission: false,
    caregiverName: '',
    caregiverEmail: '',
    caregiverPhone: '',
    status: 'New',
    physicianData: [],
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

  useEffect(() => {
    // Load patient data based on ID from URL
    const patientId = id || 'default';
    const patientData = getPatientProfile(patientId);
    setFormData(patientData);
  }, [id]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving profile data:', formData);
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Edit Profile</h1>
          <p className="text-white/80">Update {formData.fullName}'s information</p>
        </div>

        {/* Profile Form */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">👤</span>
              <span>Professional Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="h-12 text-base"
                placeholder="Enter your full name"
              />
            </div>

            {/* Specialty and Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Specialty</label>
                <Input
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  className="h-12 text-base"
                  placeholder="e.g., Cardiologist"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="h-12 text-base"
                  placeholder="e.g., MD, PhD"
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-12 text-base"
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-12 text-base"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Institution</label>
              <Input
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                className="h-12 text-base"
                placeholder="Enter your medical institution"
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Registration Number</label>
              <Input
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                className="h-12 text-base"
                placeholder="Enter your medical registration number"
              />
            </div>

            {/* Caregiver Permission Checkbox */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="caregiverPermission"
                  checked={formData.caregiverPermission}
                  onCheckedChange={(checked) => handleInputChange('caregiverPermission', checked as boolean)}
                />
                <label htmlFor="caregiverPermission" className="text-gray-700 font-semibold">
                  Permission to share caregiver information received
                </label>
              </div>

              {/* Caregiver Information Fields - only show when checkbox is checked */}
              {formData.caregiverPermission && (
                <div className="space-y-4 ml-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Caregiver Name</label>
                    <Input
                      value={formData.caregiverName}
                      onChange={(e) => handleInputChange('caregiverName', e.target.value)}
                      className="h-12 text-base"
                      placeholder="Enter caregiver name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Caregiver Email</label>
                    <Input
                      type="email"
                      value={formData.caregiverEmail}
                      onChange={(e) => handleInputChange('caregiverEmail', e.target.value)}
                      className="h-12 text-base"
                      placeholder="Enter caregiver email"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Caregiver Phone</label>
                    <Input
                      type="tel"
                      value={formData.caregiverPhone}
                      onChange={(e) => handleInputChange('caregiverPhone', e.target.value)}
                      className="h-12 text-base"
                      placeholder="Enter caregiver phone"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="h-12 px-8 text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-base"
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileEdit;
