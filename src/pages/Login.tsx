import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const Login = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, sendOtp, verifyLogin, isLoading } = useUser();

  // If already logged in, redirect to dashboard (or where they came from)
  const from = (location.state as any)?.from || '/dashboard';
  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  // Format phone: 0XXX XXX XX XX
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setPhoneNumber(digits.slice(0, 11));
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    const { success, debug_otp } = await sendOtp(phoneNumber);
    if (success) {
      toast.success("OTP Code Sent: " + debug_otp);
      setStep('otp');
    }
  };

  const handleVerify = async () => {
    if (!otp) {
      toast.error("Please enter the code.");
      return;
    }

    const success = await verifyLogin(phoneNumber, otp);
    if (success) {
      toast.success("Login successful!");
      navigate(from, { replace: true });
    }
  };

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full border border-primary/20 mb-4">
              <img
                src="/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png"
                alt="ATTR-CM Tracker Logo"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Login</h1>
            <div className="inline-block bg-white rounded-full px-4 py-2 border border-primary/20">
              <span className="text-primary font-semibold text-sm sm:text-base">ATTR-CM Tracker</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
            <p className="text-gray-700 text-center text-sm sm:text-base">
              Secure access to your ATTR-CM Tracker
            </p>
          </div>

          {step === 'phone' && (
            <>
              {/* Phone Number Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">📞</span>
                  </div>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={formatPhone(phoneNumber)}
                    onChange={handlePhoneChange}
                    onKeyDown={(e) => {
                      const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
                      if (allowed.includes(e.key)) return;
                      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                      if (!/^\d$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="pl-10 h-12 text-base sm:text-lg border-gray-300 rounded-xl tracking-wider"
                    placeholder="0555 111 22 33"
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-base sm:text-lg font-semibold rounded-xl"
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">Verification Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">🔒</span>
                  </div>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 h-12 text-base sm:text-lg border-gray-300 rounded-xl"
                    placeholder="123456"
                    maxLength={6}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right cursor-pointer hover:underline" onClick={() => setStep('phone')}>
                  Change phone number
                </p>
              </div>

              <Button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-base sm:text-lg font-semibold rounded-xl"
              >
                {isLoading ? "Verifying..." : "Verify & Login"}
              </Button>
            </>
          )}

          {/* Support */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm sm:text-base">
              Need assistance? Please contact{' '}
              <a href="mailto:dika.cardio@gmail.com" className="text-blue-600 hover:underline">
                dika.cardio@gmail.com
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
            <span>©2025 Dika Cardio or its affiliates. All rights reserved.</span>
          </div>
          <div className="text-center mt-2 text-xs sm:text-sm text-gray-500 flex flex-wrap justify-center gap-2 sm:gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Term of Use</a>
            <a href="#" className="hover:underline">Copyright Note</a>
            <a href="#" className="hover:underline">Site Map</a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
