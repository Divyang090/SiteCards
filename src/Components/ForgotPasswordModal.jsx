import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { BASE_URL } from '../Configuration/Config';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '' }) => {
  const [currentStep, setCurrentStep] = useState('email');
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');

  const FORGOT_PASSWORD_API = `${BASE_URL}/user/forgot-password`;
  const RESET_PASSWORD_API = `${BASE_URL}/user/reset-password`;

  // Check for token in URL when modal opens
  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      console.log('🔍 ForgotPasswordModal - Checking for token:', token);
      
      if (token) {
        console.log('✅ Token found, switching to reset step');
        setResetToken(token);
        setCurrentStep('reset');
        // Clear the URL to prevent loops
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.log('❌ No token found, staying on email step');
        setCurrentStep('email');
        setEmail(initialEmail);
      }
      
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
    }
  }, [isOpen, initialEmail]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStrongPassword = (password) => {
    return password.length >= 6;
  };

  // Step 1: Send reset link
  const handleSendResetLink = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
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
        body: JSON.stringify({
          user_email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      const data = await response.json();
      setSuccess('Password reset instructions have been sent to your email!');
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please try again later.');
      } else {
        setError(err.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with token
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (!resetToken) {
      setError('Invalid reset link. Please request a new reset link.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(RESET_PASSWORD_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      const data = await response.json();
      setSuccess('Password reset successfully! You can now login with your new password.');
      
      // ✅ Just show success message and close after timeout
      setTimeout(() => {
        onClose();
      }, 5000);

    } catch (err) {
      console.error('Reset password error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please try again later.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setCurrentStep('email');
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 theme-black flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-opacity-50 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative theme-bg-secondary rounded-lg w-full max-w-md mx-4 border border-gray-200 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold theme-text-primary">
            {currentStep === 'email' ? 'Reset Your Password' : 'Create New Password'}
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
          <div className="mx-4 mt-4 p-3 rounded-lg mb-6 shadow-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            <div className="flex flex-col space-y-3">
              <p>{success}</p>
              <div className="flex space-x-2">
                
                {/* <button
                  onClick={() => {
                    // Clear URL and close
                    window.history.replaceState({}, document.title, "/");
                    onClose();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors duration-200"
                >
                  Close
                </button> */}
              </div>
              <p className="text-xs text-green-600">
                Auto-closing in 5 seconds...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Email Input - ONLY show if no token in URL */}
        {currentStep === 'email' && !success && (
          <form onSubmit={handleSendResetLink} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email address"
                />
              </div>

              <p className="text-sm text-gray-500">
                We'll send a reset link to your email address.
              </p>
            </div>

            {/* Send Reset Link Button */}
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* Back to Login */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm focus:outline-none disabled:opacity-50"
              >
                ← Back to login
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Reset Password - ONLY show when token is present and no success */}
        {currentStep === 'reset' && !success && (
          <form onSubmit={handleResetPassword} className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-400 text-center">
                Please enter your new password below.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="w-full px-3 py-2 theme-text-secondary border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter new password (min. 6 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 theme-text-secondary border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            {/* Reset Password Button */}
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
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            {/* Back to email input */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleBackToEmail}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm focus:outline-none disabled:opacity-50"
              >
                ← Request new reset link
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;