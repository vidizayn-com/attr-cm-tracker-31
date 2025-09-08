
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('(+90) 559 230 98 61');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = () => {
    navigate('/verification');
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

          {/* Phone Number Input */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3 text-sm sm:text-base">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">📞</span>
              </div>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10 h-12 text-base sm:text-lg border-gray-300 rounded-xl"
                placeholder="(+90) --- -- -- --"
              />
            </div>
            <p className="text-primary text-xs sm:text-sm mt-2 italic">
              Enter the phone number registered with your cardiologist
            </p>
          </div>

          {/* Authorization Checkbox */}
          <div className="mb-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="authorization"
                checked={isAuthorized}
                onCheckedChange={(checked) => setIsAuthorized(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="authorization"
                className="text-sm text-gray-700 leading-5 cursor-pointer"
              >
                I hereby authorize the association to fully access and share my information
              </label>
            </div>
          </div>

          {/* Send Code Button */}
          <Button
            onClick={handleSendCode}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-base sm:text-lg font-semibold rounded-xl"
          >
            Send Verification Code
          </Button>

          {/* Support */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm sm:text-base">
              Need assistance? Please contact{' '}
              <a href="mailto:dika.cardio@email.com" className="text-blue-600 hover:underline">
                dika.cardio@email.com
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
