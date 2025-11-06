import React, { createContext, useContext, useState, useCallback } from 'react';

// Create context
const StatusMessageContext = createContext();

// Custom hook to use the status message
const useStatusMessage = () => {
  const context = useContext(StatusMessageContext);
  if (!context) {
    throw new Error('useStatusMessage must be used within a StatusMessageProvider');
  }
  return context;
};

// Provider component
const StatusMessageProvider = ({ children }) => {
  const [message, setMessage] = useState({ show: false, text: '', type: '' });
  const [confirmation, setConfirmation] = useState({ 
    show: false, 
    title: '', 
    message: '', 
    onConfirm: null, 
    onCancel: null,
    isLoading: false // Add loading state
  });

  const showMessage = useCallback((text, type = 'success') => {
    setMessage({ show: true, text, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setMessage({ show: false, text: '', type: '' });
    }, 3000);
  }, []);

  const showConfirmation = useCallback((title, message, onConfirm, onCancel = null) => {
    setConfirmation({
      show: true,
      title,
      message,
      onConfirm,
      onCancel,
      isLoading: false
    });
  }, []);

  const setConfirmationLoading = useCallback((isLoading) => {
    setConfirmation(prev => ({ ...prev, isLoading }));
  }, []);

  const hideMessage = useCallback(() => {
    setMessage({ show: false, text: '', type: '' });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation({ show: false, title: '', message: '', onConfirm: null, onCancel: null, isLoading: false });
  }, []);

  return (
    <StatusMessageContext.Provider value={{ 
      showMessage, 
      hideMessage, 
      showConfirmation,
      setConfirmationLoading,
      hideConfirmation
    }}>
      {children}
      <StatusMessageComponent message={message} />
      <ConfirmationModal 
        confirmation={confirmation}
        setConfirmationLoading={setConfirmationLoading}
        hideConfirmation={hideConfirmation}
      />
    </StatusMessageContext.Provider>
  );
};

// StatusMessage component
const StatusMessageComponent = ({ message }) => {
  if (!message.show) return null;

  const bgColor = message.type === 'success' 
    ? 'bg-green-100 border-green-400 text-green-700'
    : message.type === 'error'
    ? 'bg-red-100 border-red-400 text-red-700'
    : 'bg-blue-100 border-blue-400 text-blue-700';

  const icon = message.type === 'success' ? (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ) : message.type === 'error' ? (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 px-6 py-3 border rounded-lg shadow-lg ${bgColor}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{message.text}</span>
      </div>
    </div>
  );
};

// Confirmation Modal Component with loading state
const ConfirmationModal = ({ confirmation, setConfirmationLoading, hideConfirmation }) => {
  if (!confirmation.show) return null;

  const handleConfirm = async () => {
    setConfirmationLoading(true);
    try {
      await confirmation.onConfirm();
      hideConfirmation();
    } catch (error) {
      setConfirmationLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirmation.onCancel) {
      confirmation.onCancel();
    }
    hideConfirmation();
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
      <div className="theme-bg-card rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold theme-text-primary mb-2">
            {confirmation.title}
          </h3>
          <p className="theme-text-secondary mb-6">
            {confirmation.message}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={confirmation.isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmation.isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {confirmation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { useStatusMessage };

export default StatusMessageProvider;