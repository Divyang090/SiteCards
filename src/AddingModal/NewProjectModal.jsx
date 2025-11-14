import React, { useState } from 'react';
import { BASE_URL } from '../Configuration/Config';

const NewProjectModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    assignee: '',
    location: '',
    description: '',
    status: 'open',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ==================== API CONFIG ====================
  const CREATE_PROJECT_API = `${BASE_URL}/projects/projects`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!formData.title.trim() || !formData.assignee.trim() || !formData.dueDate) {
      setError('Project Title, Client Name, and Due Date are required');
      return;
    }

    setLoading(true);

    try {
      // ==================== PREPARE DATA ====================
      const backendData = {
        project_name: formData.title.trim(),
        client_name: formData.assignee.trim(),
        location: formData.location.trim(),
        project_description: formData.description.trim(),
        due_date: formData.dueDate,
        status: formData.status
      };

      console.log('Sending to backend:', backendData);

      // ==================== API CALL ====================
      const response = await fetch(CREATE_PROJECT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData)
      });

      // ==================== HANDLE RESPONSE ====================
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      const newProject = await response.json();
      
      // ==================== DEBUG BACKEND RESPONSE ====================
      console.log('🔍 FULL BACKEND RESPONSE:', newProject);
      console.log('🔍 All fields from backend:');
      Object.keys(newProject).forEach(key => {
        console.log(`  ${key}:`, newProject[key]);
      });
      
      // ==================== TRANSFORM WITH PROPER DATE HANDLING ====================
      const transformedProject = {
        id: newProject.id || newProject.project_id,
        title: newProject.project_name || newProject.name || newProject.title || formData.title,
        assignee: newProject.client_name || newProject.client || newProject.assignee || newProject.assigned_to || formData.assignee,
        status: newProject.status || formData.status,
        // FIXED: Proper date handling - use backend response first
        docDate: newProject.due_date ? new Date(newProject.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
                 newProject.end_date ? new Date(newProject.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                 formData.dueDate ? new Date(formData.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date',
        isOverdue: newProject.is_overdue || newProject.overdue || false,
        cardsCount: newProject.cards_count || newProject.cardsCount || 0,
        location: newProject.location || formData.location,
        updated: newProject.updated_at ? new Date(newProject.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Just now",
        description: newProject.project_description || newProject.description || formData.description
      };

      console.log('TRANSFORMED PROJECT:', transformedProject);
      console.log('DATE DEBUG - Final docDate:', transformedProject.docDate);
      
      // ==================== SUCCESS ====================
      setSuccess('Project created successfully!');
      
      // Wait a moment to show success message, then update parent
      setTimeout(() => {
        onSave(transformedProject);
        resetForm();
        onClose();
      }, 1000);

    } catch (err) {
      console.error('Error creating project:', err);
      
      // User-friendly error messages
      let userMessage = err.message;
      
      if (err.message.includes('Failed to fetch')) {
        userMessage = 'Cannot connect to server. Please check if backend is running.';
      } else if (err.message.includes('NetworkError')) {
        userMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FORM MANAGEMENT ====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error || success) {
      setError('');
      setSuccess('');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      assignee: '',
      location: '',
      description: '',
      status: 'open',
      dueDate: ''
    });
    setError('');
    setSuccess('');
  };

  const handleOverlayClick = (e) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    resetForm();
    onClose();
  };

  // ==================== RENDER ====================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 theme-black flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0  bg-opacity-80 backdrop-blur-[1px]"
        onClick={handleOverlayClick}
      ></div>
      
      {/* Modal content */}
      <div className="relative theme-bg-secondary rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold theme-text-primary">
            {loading ? 'Creating Project...' : 'Create New Project'}
          </h2>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Project Title */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-1">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                placeholder="Enter project title"
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-1">
                Client Name *
              </label>
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                placeholder="Enter client name"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                placeholder="Enter location"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 theme-bg-secondary border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
              >
                <option value="open">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-1">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                placeholder="Enter project description"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-24"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;