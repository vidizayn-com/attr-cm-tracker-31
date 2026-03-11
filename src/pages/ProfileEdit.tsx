
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Shield, ShieldCheck, ShieldX, Loader2, User, Phone, Building2, Save, ArrowLeft } from 'lucide-react';
import { strapiGet } from '@/lib/strapiClient';


interface Hospital {
  id: number;
  documentId: string;
  name: string;
}

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { currentUser, updateConsent, updateProfile, refreshUser } = useUser();
  const [consentToggle, setConsentToggle] = useState(false);
  const [savingConsent, setSavingConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setConsentToggle(currentUser.dataSharingConsent);
      setPhoneNumber(currentUser.phone || '');
      setSelectedHospitalId(currentUser.hospitalData?.id?.toString() || '');
    }
  }, [currentUser]);

  // Load hospitals list from authenticated endpoint
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const data = await strapiGet<any[]>('/api/auth/doctor/institutions');
        if (Array.isArray(data)) {
          setHospitals(data.map((h: any) => ({ id: h.id, documentId: h.documentId, name: h.name })));
        }
      } catch (e) {
        console.error('Failed to load hospitals:', e);
        toast.error('Failed to load hospitals');
      } finally {
        setLoadingHospitals(false);
      }
    };
    loadHospitals();
  }, []);

  // Format phone: 0XXX XXX XX XX
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 15);
    if (digits.startsWith('+')) return digits;
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: { phone?: string; hospitalId?: number } = {};

      // Check if phone changed
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone && cleanPhone !== currentUser?.phone?.replace(/\D/g, '')) {
        updateData.phone = cleanPhone;
      }

      // Check if hospital changed
      if (selectedHospitalId && selectedHospitalId !== currentUser?.hospitalData?.id?.toString()) {
        updateData.hospitalId = Number(selectedHospitalId);
      }

      if (Object.keys(updateData).length > 0) {
        const success = await updateProfile(updateData);
        if (success) {
          toast.success("Profile updated successfully!");
        } else {
          toast.error("Failed to update profile.");
        }
      } else {
        toast.info("No changes to save.");
      }
    } catch (e) {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleConsentChange = async (checked: boolean) => {
    setSavingConsent(true);
    const success = await updateConsent(checked);
    if (success) {
      setConsentToggle(checked);
      toast.success(checked ? "Data sharing consent granted." : "Data sharing consent revoked.");
    }
    setSavingConsent(false);
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#29a8b6' }}>Edit Profile</h1>
          <p className="text-gray-600">Update your professional information</p>
        </div>

        {/* Profile Form */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[hsl(184,44%,90%)] flex items-center justify-center">
                <User className="w-5 h-5 text-[hsl(184,58%,44%)]" />
              </div>
              <span>Professional Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <Input
                value={currentUser.name}
                disabled
                className="h-12 text-base bg-gray-50"
              />
              <p className="text-xs text-gray-400 mt-1">Contact admin to change your name</p>
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Specialty</label>
              <Input
                value={currentUser.role}
                disabled
                className="h-12 text-base bg-gray-50"
              />
              <p className="text-xs text-gray-400 mt-1">Contact admin to change your specialty</p>
            </div>

            {/* Phone (editable) */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  type="tel"
                  value={phoneNumber.startsWith('+') ? phoneNumber : formatPhone(phoneNumber)}
                  onChange={handlePhoneChange}
                  className="pl-10 h-12 text-base"
                  placeholder="0555 111 22 33"
                />
              </div>
            </div>

            {/* Hospital (editable dropdown) */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Building2 className="w-4 h-4 text-[hsl(184,58%,44%)]" />
                Hospital
              </label>
              {currentUser.hospital && (
                <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-[hsl(184,44%,96%)] rounded-lg border border-[hsl(184,44%,87%)]">
                  <Building2 className="w-4 h-4 text-[hsl(184,58%,44%)]" />
                  <span className="text-sm font-medium text-[hsl(184,91%,17%)]">
                    Current: {currentUser.hospital}
                  </span>
                </div>
              )}
              {loadingHospitals ? (
                <div className="flex items-center gap-2 text-gray-400 h-12">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading hospitals...</span>
                </div>
              ) : (
                <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select a hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map(h => (
                      <SelectItem key={h.id} value={h.id.toString()}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="h-11 px-6 rounded-xl border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[hsl(184,58%,44%)] hover:bg-[hsl(184,58%,38%)] text-white h-11 px-6 rounded-xl shadow-sm transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing Consent Section */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-cyan-600" />
              <span>Data Sharing Consent</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-700 mb-3">
                By granting consent, your patient statistics will be transparently shared with the
                Dika Cardio Association and will be visible in the admin panel.
              </p>
              <p className="text-xs text-gray-500 italic">
                You can change this setting at any time.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataSharingConsent"
                  checked={consentToggle}
                  onCheckedChange={(checked) => handleConsentChange(checked as boolean)}
                  disabled={savingConsent}
                  className="mt-1"
                />
                <label htmlFor="dataSharingConsent" className="cursor-pointer">
                  <div className="font-semibold text-gray-800">
                    I consent to share my data with the association
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Patient statistics will be visible in the admin panel
                  </div>
                </label>
              </div>
              <div className="flex-shrink-0 ml-4">
                {consentToggle ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-medium">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400">
                    <ShieldX className="w-5 h-5" />
                    <span className="text-xs font-medium">Inactive</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileEdit;
