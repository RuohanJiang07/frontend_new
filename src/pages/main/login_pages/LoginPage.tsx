import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ToastContainer } from '../../../components/ui/ToastContainer';
import { useToast } from '../../../hooks/useToast';
import { loginUser } from '../../../api/auth/login';
import { saveUserData } from '../../../utils/auth';

function LoginPage() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await loginUser({ email, password });
      
      if (response.success && response.data) {
        // Save user data to localStorage
        saveUserData(response.data);
        
        // Show success message
        success('Login successful! Welcome back.');
        
        // Navigate to landing page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // Handle login failure
        const errorMessage = response.error?.message || 'Login failed. Please try again.';
        error(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign in logic here
    console.log('Google sign in');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Left side - Image section with F3F4F6 background - 76% width */}
      <div className="w-[76%] bg-[#F3F4F6] flex flex-col">
        {/* Image container - takes most of the space */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-5xl relative">
            <img
              src="https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Study workspace"
              className="w-full h-[68vh] object-cover rounded-2xl shadow-lg"
            />
            
            {/* Bottom section with tip and pagination dots - positioned VERY close to image */}
            <div className="absolute -bottom-8 left-0 right-0">
              {/* Container for tip and dots with proper alignment */}
              <div className="flex items-center justify-between">
                {/* Tip text - aligned to left edge of image */}
                <div>
                  <p className="text-gray-700 font-['Inter',Helvetica] text-sm">
                    Do you know: we have a daily set of trending topics for you at deep learning page!
                  </p>
                </div>

                {/* Pagination dots - aligned to right edge of image */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer to account for absolute positioned bottom elements */}
        <div className="h-16"></div>
      </div>

      {/* Right side - Login form with FBFCFF background - 24% width */}
      <div className="w-[24%] bg-[#FBFCFF] flex items-center justify-start p-8">
        <div className="w-full max-w-sm">
          {/* Logo - Left aligned */}
          <div className="flex justify-start mb-6">
            <img
              className="w-12 h-10"
              alt="Hyperknow logo"
              src="/main/landing_page/hyperknow_logo 1.svg"
            />
          </div>

          {/* Welcome text - Left aligned */}
          <div className="text-left mb-8">
            <h1 className="font-['Outfit',Helvetica] font-medium text-black text-2xl leading-tight">
              Welcome to<br />
              Your AI Study<br />
              Workspace
            </h1>
          </div>

          {/* Login form */}
          <div className="space-y-4">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter',Helvetica]">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg font-['Inter',Helvetica] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter',Helvetica]">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg font-['Inter',Helvetica] text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sign In button */}
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full h-10 bg-black text-white rounded-lg font-['Inter',Helvetica] text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Sign in via Google button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full h-10 border border-gray-300 bg-white text-gray-700 rounded-lg font-['Inter',Helvetica] text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in via Google
            </Button>

            {/* Forgot password link */}
            <div className="text-center">
              <button className="text-sm text-gray-600 hover:text-gray-800 font-['Inter',Helvetica] underline">
                Forgot password?
              </button>
            </div>

            {/* Sign up link placeholder */}
            <div className="text-center pt-2">
              <span className="text-sm text-gray-600 font-['Inter',Helvetica]">
                Don't have an account?{' '}
                <button className="text-blue-600 hover:text-blue-800 underline">
                  Sign up
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;