import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordModal from './ForgotPasswordModal';

const ResetPasswordPage = () => {
  const [showResetModal, setShowResetModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically show the reset modal when this page loads
    setShowResetModal(true);
  }, []);

  const handleCloseModal = () => {
    setShowResetModal(false);
    // Redirect to home page after closing
    navigate('/');
  };

  return (
    <div className="min-h-screen theme-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="theme-text-primary">Loading password reset...</p>
      </div>
      
      <ForgotPasswordModal
        isOpen={showResetModal}
        onClose={handleCloseModal}
        initialEmail=""
      />
    </div>
  );
};

export default ResetPasswordPage;