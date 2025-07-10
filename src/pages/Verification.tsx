
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const Verification = () => {
  const [code, setCode] = useState(['1', '5', '8', '3', '7', '9']);
  const [timer, setTimer] = useState(299); // 4:59 in seconds
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
    }
  };

  const handleConfirm = () => {
    navigate('/patients');
  };

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
              <span className="text-gray-600 text-xl sm:text-2xl">🔒</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Verification Code</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              We've sent a 6-digit code to your mobile phone
            </p>
          </div>

          {/* Code Input */}
          <div className="flex justify-center space-x-2 sm:space-x-3 mb-6 sm:mb-8">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                maxLength={1}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 border-2 border-purple-500 rounded-full mb-2">
              <span className="text-purple-600 font-bold text-sm sm:text-base">{formatTime(timer)}</span>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              Code expires in <span className="text-red-600 font-semibold">{formatTime(timer)}</span> minutes
            </p>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-base sm:text-lg font-semibold rounded-xl mb-4"
          >
            Confirm Code
          </Button>

          {/* Resend */}
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              Didn't receive the code?{' '}
              <button className="text-purple-600 hover:underline font-semibold">
                Send again
              </button>
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

export default Verification;
