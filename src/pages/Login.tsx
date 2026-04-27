import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, sendOtp, verifyLogin, isLoading } = useUser();

  // If already logged in, redirect to dashboard (or where they came from)
  const from = (location.state as any)?.from || '/dashboard';
  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const { success, debug_otp } = await sendOtp(email);
    if (success) {
      toast.success("Verification code sent to your email" + (debug_otp ? `: ${debug_otp}` : ''));
      setStep('otp');
    }
  };

  const handleVerify = async () => {
    if (!otp) {
      toast.error("Please enter the verification code.");
      return;
    }

    const success = await verifyLogin(email, otp);
    if (success) {
      toast.success("Login successful!");
      navigate(from, { replace: true });
    }
  };

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-cyan-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-white/60">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full border border-primary/20 mb-4 shadow-sm">
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
          <div className="bg-cyan-50 rounded-xl p-4 mb-6 border border-cyan-100">
            <p className="text-gray-700 text-center text-sm sm:text-base">
              Enter your email to receive a verification code
            </p>
          </div>

          {step === 'email' && (
            <>
              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    className="pl-10 h-12 text-base sm:text-lg border-gray-300 rounded-xl"
                    placeholder="doctor@hospital.com"
                  />
                </div>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#089bab] to-[#06767f] hover:from-[#07858e] hover:to-[#055c64] text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-cyan-200/50 transition-all"
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
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 h-12 text-base sm:text-lg border-gray-300 rounded-xl tracking-widest text-center"
                    placeholder="123456"
                    maxLength={6}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-500 cursor-pointer hover:underline hover:text-gray-700" onClick={() => setStep('email')}>
                    ← Change email
                  </p>
                  <p className="text-xs text-gray-500 cursor-pointer hover:underline hover:text-[#089bab]" onClick={handleSendOtp}>
                    Resend code
                  </p>
                </div>
              </div>

              <Button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#089bab] to-[#06767f] hover:from-[#07858e] hover:to-[#055c64] text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg shadow-cyan-200/50 transition-all"
              >
                {isLoading ? "Verifying..." : "Verify & Login"}
              </Button>
            </>
          )}

          {/* Support */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm sm:text-base">
              Need assistance? Please contact{' '}
              <a href="mailto:dika.cardio@gmail.com" className="text-[#089bab] hover:underline font-medium">
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

