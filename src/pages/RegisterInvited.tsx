import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle, Building2, Phone } from 'lucide-react';

import { STRAPI_URL } from '@/lib/strapiClient';

interface HospitalItem {
  id: number;
  documentId?: string;
  name: string;
}

interface InvitationInfo {
  fullName: string;
  email: string;
  specialty: string;
  status: string;
  institutions?: HospitalItem[];
}

const RegisterInvited = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [customHospitalName, setCustomHospitalName] = useState<string>('');
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${STRAPI_URL}/api/auth/doctor/invitation-info?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error?.message || data?.message || 'Invalid invitation link');
        } else {
          setInfo(data);
          if (data.institutions && Array.isArray(data.institutions)) {
            setHospitals(data.institutions);
          }
        }
      } catch (e: any) {
        setError('Failed to load invitation info');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  };

  const specialtyDisplayName: Record<string, string> = {
    Cardiology: 'Cardiology',
    NuclearMedicine: 'Nuclear Medicine',
    Hematology: 'Hematology',
    Genetics: 'Genetics',
  };

  const handleSubmit = async () => {
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (!cleanPhoneDigits) {
      toast.error('Phone number is required');
      return;
    }
    if (cleanPhoneDigits.length < 10) {
      toast.error('Please enter a valid phone number (min 10 digits)');
      return;
    }

    if (!selectedHospitalId) {
      toast.error('Please select or enter your hospital');
      return;
    }

    if (selectedHospitalId === 'OTHER' && !customHospitalName.trim()) {
      toast.error('Please enter your hospital name');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/doctor/register-invited`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          phone: cleanPhoneDigits,
          licenseNo: licenseNo || undefined,
          institutionId: selectedHospitalId !== 'OTHER' ? Number(selectedHospitalId) : undefined,
          hospitalName: selectedHospitalId === 'OTHER' ? customHospitalName.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || 'Registration failed');
      }

      // Save token and redirect
      if (data.token) {
        localStorage.setItem('doctor_token', data.token);
      }

      setSuccess(true);
      toast.success('Registration completed! Redirecting...');

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
        window.location.reload();
      }, 1500);

    } catch (e: any) {
      toast.error(e.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!window.confirm("Are you sure you want to decline this invitation?")) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/doctor/invitations/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || 'Decline failed');
      }

      toast.success('Invitation declined successfully');
      setError('You have declined this invitation.');
    } catch (e: any) {
      toast.error(e.message || 'Decline failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-cyan-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-white/60">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#089bab] to-[#06767f] rounded-2xl mb-4 shadow-lg">
              <img
                src="/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png"
                alt="ATTR Navigator Logo"
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain filter brightness-0 invert"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Complete Registration</h1>
            <p className="text-sm text-gray-500">ATTR Navigator</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading invitation...
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <p className="text-sm text-gray-500 mb-6">The invitation link may be invalid or expired.</p>
              <Button onClick={() => navigate('/login')} variant="outline" className="rounded-xl">
                Go to Login
              </Button>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          )}

          {/* Registration Form */}
          {!loading && !error && info && !success && (
            <>
              {/* Invitation Info */}
              <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-2xl p-4 mb-6 border border-cyan-100">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Name</span>
                    <p className="font-semibold text-gray-900">{info.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Specialty</span>
                    <p className="font-semibold text-[#089bab]">{specialtyDisplayName[info.specialty] || info.specialty}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 text-xs">Email</span>
                    <p className="font-semibold text-gray-900">{info.email}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Phone (required) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="tel"
                      value={formatPhone(phone)}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className="h-11 rounded-xl pl-10"
                      placeholder="0555 111 22 33 *"
                      maxLength={15}
                    />
                  </div>
                </div>

                {/* Hospital / Institution (required) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Hospital / Institution <span className="text-red-500">*</span>
                  </label>
                  <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select hospital..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-60">
                      {hospitals.map((h) => (
                        <SelectItem key={h.id} value={String(h.id)}>
                          {h.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="OTHER" className="font-semibold text-[#089bab]">
                        + Enter new hospital name...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Hospital Input */}
                {selectedHospitalId === 'OTHER' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      New Hospital Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        value={customHospitalName}
                        onChange={(e) => setCustomHospitalName(e.target.value)}
                        className="h-11 rounded-xl pl-10"
                        placeholder="e.g. City Central Hospital *"
                      />
                    </div>
                  </div>
                )}

                {/* License No (optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">License Number</label>
                  <Input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="License number (optional)"
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full h-12 bg-gradient-to-r from-[#089bab] to-[#06767f] hover:from-[#07858e] hover:to-[#055c64] text-white text-base font-semibold rounded-xl shadow-lg shadow-cyan-200/50 transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>

                <Button
                  onClick={handleDecline}
                  disabled={submitting}
                  variant="outline"
                  className="w-full h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-xl transition-all duration-300 mt-2"
                >
                  Decline Invitation
                </Button>
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-400">
                  Already registered?{' '}
                  <a href="/login" className="text-[#089bab] hover:underline font-medium">Login here</a>
                </p>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-gray-400">
            ©2025 Digital Cardiology Association. All rights reserved.
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterInvited;
