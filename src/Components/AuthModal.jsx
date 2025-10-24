import React, { useState, useEffect } from 'react';

const AuthModal = ({ isOpen, onClose, currentView, onSwitchView, onLogin, onRegister }) => {
  // ==================== ADD YOUR API LINK HERE ====================
const API_BASE = "http://localhost:5000/api";
  const LOGIN_API = `${API_BASE}/login`;
  const REGISTER_API = `${API_BASE}/register`;
  const FORGOT_PASSWORD_API = `${API_BASE}/forgot-password`;

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Login function - ALREADY HAS API CODE
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API call happens here automatically
      const response = await fetch(LOGIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
  user_email: loginData.email,      // Matches your backend
  user_password: loginData.password // Matches your backend
})
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (onLogin) {
        onLogin(data);
      }

      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register function - ALREADY HAS API CODE
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // API call happens here automatically
      const response = await fetch(REGISTER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.fullName,
          email: registerData.email,
          password: registerData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (onRegister) {
        onRegister(data);
      }

      onSwitchView('login');
      setError('Registration successful! Please login.');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function - ALREADY HAS API CODE
  const handleForgotPassword = async () => {
    if (!loginData.email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    try {
      // API call happens here automatically
      const response = await fetch(FORGOT_PASSWORD_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setError('Password reset instructions sent to your email!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Form change handlers
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLoginData({ email: '', password: '' });
      setRegisterData({ fullName: '', email: '', password: '', confirmPassword: '' });
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentView === 'login' ? 'Login to Your Account' : 'Create Your Account'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mx-6 mt-4 p-3 rounded-lg border text-sm ${
            error.includes('successful') 
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => onSwitchView('login')}
            disabled={loading}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${
              currentView === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => onSwitchView('register')}
            disabled={loading}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${
              currentView === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {currentView === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
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
                  <span className="ml-2 text-gray-600">Remember me</span>
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

            {/* Login Button */}
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
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Switch to Register */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchView('register')}
                  disabled={loading}
                  className="text-blue-600 hover:text-sky-500 font-medium focus:outline-none disabled:opacity-50"
                >
                  Create one now
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Register Form */}
        {currentView === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Create a password (min. 6 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="text-sm">
                <label className="flex items-start">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1" 
                    required
                    disabled={loading}
                  />
                  <span className="ml-2 text-gray-600">
                    I agree to the{' '}
                    <button type="button" className="text-blue-600 hover:text-blue-800 disabled:opacity-50" disabled={loading}>
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-blue-600 hover:text-blue-800 disabled:opacity-50" disabled={loading}>
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>
            </div>

            {/* Register Button */}
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Switch to Login */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchView('login')}
                  disabled={loading}
                  className="text-blue-600 hover:text-sky-500 font-medium focus:outline-none disabled:opacity-50"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;