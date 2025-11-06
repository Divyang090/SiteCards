import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../Configuration/Config';

const AuthModal = ({ isOpen, onClose, currentView, onSwitchView, onLogin, onRegister }) => {

  const API_BASE = "http://192.168.1.22:8087/api/user";
  const LOGIN_API = `${API_BASE}/login`;
  const REGISTER_API = `${API_BASE}/register`;
  const FORGOT_PASSWORD_API = `${API_BASE}/forgot-password`;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStrongPassword = (password) => {
    return password.length >= 6;
  };

  // ==================== LOGIN FUNCTION ====================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Get form values directly from the form elements
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    console.log('sLOGIN DEBUG:', { email, password, emailLength: email.length, passwordLength: password.length });

    // Basic validation
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
        headers: {
          'Content-Type': 'application/json',
        },
        //Use backend field names
        body: JSON.stringify({
          user_email: email,        // Changed to user_email
          user_password: password   // Changed to user_password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      if (onLogin) {
        onLogin(data);
      }

      setSuccess('Login successful!');
      setTimeout(() => {
        onClose();
      }, 1500);

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

  // ==================== REGISTER FUNCTION ====================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Get form values directly from the form elements
    const form = e.target;
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();

    console.log('REGISTER DEBUG:', {
      fullName, email, password, confirmPassword,
      fullNameLength: fullName.length,
      emailLength: email.length,
      passwordLength: password.length,
      confirmPasswordLength: confirmPassword.length
    });

    // Validation
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(REGISTER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //Use backend field names
        body: JSON.stringify({
          user_name: fullName,    // Changed to user_fullname
          user_email: email,          // Changed to user_email
          user_password: password     // Changed to user_password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      if (onRegister) {
        onRegister(data);
      }

      setSuccess('Registration successful! Please check your email to verify your account.');

      setTimeout(() => {
        onSwitchView('login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please check if backend is running on port 5000.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== FORGOT PASSWORD FUNCTION ====================
  const handleForgotPassword = async () => {
    // Get email from the login form directly
    const emailInput = document.querySelector('input[name="email"]');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
      setError('Please enter your email address first');
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
      const response = await fetch(FORGOT_PASSWORD_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //Use backend field name
        body: JSON.stringify({
          user_email: email  // Changed to user_email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      const data = await response.json();
      setSuccess('Password reset instructions have been sent to your email!');

    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please check if backend is running on port 5000.');
      } else {
        setError(err.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== EFFECT FOR CLEANUP ====================
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ==================== JSX RENDER ====================
  return (
    <div className="fixed inset-0 z-50 theme-black flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0  bg-opacity-50 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative theme-bg-secondary rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold theme-text-primary">
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

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => onSwitchView('login')}
            disabled={loading}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${currentView === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => onSwitchView('register')}
            disabled={loading}
            className={`flex-1 py-3 text-sm font-medium transition-colors duration-200 ${currentView === 'register'
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
              <p className="theme-text-primary text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchView('register')}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none disabled:opacity-50"
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
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <span className="ml-2 theme-text-primary">
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
              <p className="theme-text-primary text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchView('login')}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none disabled:opacity-50"
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