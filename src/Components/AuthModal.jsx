import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../Configuration/Config';
import { useAuth } from './AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';

const AuthModal = () => {
  const { showAuthModal, closeAuthModal, login } = useAuth();
  const [currentView, setCurrentView] = useState('login');
  const [loginStep, setLoginStep] = useState('credentials');
  const [pendingLoginData, setPendingLoginData] = useState(null);
  const [otp, setOtp] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [ForgotPasswordEmail, setForgotPasswordEmail] = useState();
  const [registrationStep, setRegistrationStep] = useState('personal');
  const { authFetch } = useAuth();
  const [personalData, setPersonalData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [companyData, setCompanyData] = useState({
    company_name: '',
    company_address: '',
    company_email: '',
    company_phone: ''
  });

  const API_BASE = `${BASE_URL}/auth`;
  const LOGIN_API = `${API_BASE}/login`;
  const REGISTER_API = `${API_BASE}/register`;
  const VERIFY_OTP = `${API_BASE}/verify_login_otp`;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!showAuthModal) {
      setCurrentView('login');
      setLoginStep('credentials');
      setRegistrationStep('personal');
      setPersonalData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setCompanyData({
        company_name: '',
        company_address: '',
        company_email: '',
        company_phone: ''
      });
      setPendingLoginData(null);
      setOtp('');
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [showAuthModal]);

  //reset otp flow when modal closes or view changes
  useEffect(() => {
    if (!showAuthModal || currentView !== 'login') {
      setLoginStep('credentials');
      setPendingLoginData(null);
      setOtp('');
    }
  }, [showAuthModal, currentView]);

  const isStrongPassword = (password) => {
    return password.length >= 6;
  };

  //Forgot Password Handler
  const handleForgotPassword = () => {
    // Get email from the login form
    const emailInput = document.querySelector('input[name="email"]');
    const email = emailInput ? emailInput.value.trim() : '';

    setForgotPasswordEmail(email);
    setShowForgotPasswordModal(true);
  };

  // Close forgot password modal
  const handleCloseForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
  };

  const handleLoginSuccess = (userData) => {
    login(userData); // This updates global state
  };

  // ==================== STEP 1: VERIFY CREDENTIALS & SEND OTP ====================
  const handleVerifyCredentials = async (e) => {
    e.preventDefault();

    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(LOGIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: email,
          user_password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      console.log('Login API response:', data);

      setPendingLoginData({
        name: data.user_name || 'user',
        email: email,
        company_id: data.company_id,
        tokens: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token
        }
      });

      setLoginStep('otp');
      setSuccess('OTP has been sent to your email. Please enter it below.');

    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please check if backend is running on port 5000.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== STEP 2: VERIFY OTP ====================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    if (!pendingLoginData) {
      setError('Session expired. Please try logging in again.');
      setLoginStep('credentials');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: pendingLoginData.email,
          otp_code: otp
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }

      const data = await response.json();

      // Only now do we actually log the user in
      login({pendingLoginData, 
        company_id: pendingLoginData.company_id },
        {
        accessToken: data.access_token,
        refreshToken: data.refresh_token
      });
      setSuccess('Login successful!');
      setTimeout(() => {
        closeAuthModal();
      }, 1500);

    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== GO BACK TO CREDENTIALS STEP ====================
  const handleBackToCredentials = () => {
    setLoginStep('credentials');
    setPendingLoginData(null);
    setOtp('');
    setError('');
    setSuccess('');
  };

  // ==================== REGISTER FUNCTION ====================

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(REGISTER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: personalData.fullName,
          user_email: personalData.email,
          user_password: personalData.password,

          company_name: companyData.company_name,
          company_address: companyData.company_address,
          company_email: companyData.company_email,
          company_phone: companyData.company_phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      setSuccess('Registration successful! Please check your email for OTP.');
      setTimeout(() => closeAuthModal(), 2000);

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== EFFECT FOR CLEANUP ====================
  useEffect(() => {
    if (!showAuthModal) {
      setCurrentView('login');
      setLoginStep('credentials');
      setRegistrationStep('personal'); // Reset to first step
      setPersonalData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setPendingLoginData(null);
      setOtp('');
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  // ==================== JSX RENDER ====================
  return (
    <div className="fixed inset-0 z-50 theme-black flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-opacity-50 backdrop-blur-[1px]"
        onClick={closeAuthModal}
      ></div>

      {/* Modal content */}
      <div className="relative theme-bg-secondary rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold theme-text-primary">
            {loginStep === 'credentials'
              ? 'Login to Your Account'
              : 'Verify OTP'}
          </h2>
          <button
            onClick={closeAuthModal}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tabs - Only show when in credentials step */}
        {loginStep === 'credentials' && (
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setCurrentView('login')}
              disabled={loading}
              className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${currentView === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => setCurrentView('register')}
              disabled={loading}
              className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${currentView === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Register
            </button>
          </div>
        )}

        {/* Login Form - Credentials Step */}
        {currentView === 'login' && loginStep === 'credentials' && (
          <form onSubmit={handleVerifyCredentials} className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="ml-2 theme-text-primary">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  disabled={loading}
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Verify Credentials Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Generate OTP'
              )}
            </button>

            {/* Switch to Register */}
            <div className=" pt-4 border-t border-gray-100 text-center">
              <p className="theme-text-primary text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('register')}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none disabled:opacity-50"
                >
                  Create one now
                </button>
              </p>
            </div>
          </form>
        )}

        {/* OTP Verification Step */}
        {currentView === 'login' && loginStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  Enter OTP *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={loading}
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-center text-lg font-mono"
                  placeholder="Enter 6-digit OTP"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Please check your email for the OTP
                </p>
              </div>
            </div>

            {/* Verify OTP Button */}
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying OTP...
                </>
              ) : (
                'Verify OTP & Login'
              )}
            </button>

            {/* Back to credentials */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleBackToCredentials}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm focus:outline-none disabled:opacity-50"
              >
                ← Back to login
              </button>
            </div>
          </form>
        )}

        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={handleCloseForgotPasswordModal}
          initialEmail={ForgotPasswordEmail}
        />

        {/* Register Flow - Personal Details */}
        {currentView === 'register' && registrationStep === 'personal' && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            const fullName = form.fullName.value.trim();
            const email = form.email.value.trim();
            const password = form.password.value.trim();
            const confirmPassword = form.confirmPassword.value.trim();

            // Your existing validation
            if (!fullName || !email || !password || !confirmPassword) {
              setError('Please fill in all fields');
              return;
            }
            if (!isValidEmail(email)) {
              setError('Please enter a valid email address');
              return;
            }
            if (password !== confirmPassword) {
              setError("Passwords don't match!");
              return;
            }
            if (!isStrongPassword(password)) {
              setError("Password must be at least 6 characters long");
              return;
            }

            setPersonalData({ fullName, email, password, confirmPassword });
            setRegistrationStep('company');
            setError('');
          }} className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={personalData.fullName}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={personalData.email}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  defaultValue={personalData.password}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Create a password (min. 6 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  defaultValue={personalData.confirmPassword}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
            >
              Next → Company Details
            </button>
          </form>
        )}

        {/* Register Flow - Company Details */}
        {currentView === 'register' && registrationStep === 'company' && (
          <form onSubmit={handleCompleteRegistration} className="p-4">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Company Information</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={companyData.company_name}
                  onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Company Name *"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={companyData.company_address}
                  onChange={(e) => setCompanyData({ ...companyData, company_address: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Company Address *"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={companyData.company_email}
                  onChange={(e) => setCompanyData({ ...companyData, company_email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Company Email *"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={companyData.company_phone}
                  onChange={(e) => setCompanyData({ ...companyData, company_phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Company Phone *"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setRegistrationStep('personal')}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-colors duration-200"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;