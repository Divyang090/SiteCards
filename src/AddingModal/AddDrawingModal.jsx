import React, { useState, useEffect } from "react";
import { BASE_URL } from '../Configuration/Config';
import StatusMessageProvider from "../Alerts/StatusMessage";
import { useStatusMessage } from "../Alerts/StatusMessage";
import { useAuth } from "../Components/AuthContext";

const AddDrawingModal = ({ spaceId, projectId, onClose, onAdd }) => {

  const { showMessage, showConfirmation } = useStatusMessage();
  const { authFetch } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    file: null,
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  //CLOSE ANIMATION HANDLER
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    // Create optimistic drawing data
    const optimisticDrawing = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      drawing_name: formData.name,
      space_id: spaceId,
      project_id: projectId,
      description: formData.description || '',
      created_at: new Date().toISOString(),
      isOptimistic: true,
      status: 'uploading',
      file: formData.file,
      // Add preview URL for immediate display
      preview_url: imagePreview
    };

    try {
      // Call onAdd immediately with optimistic data
      onAdd(optimisticDrawing);

      const uploadData = new FormData();
      uploadData.append('drawing_name', formData.name);
      uploadData.append('space_id', spaceId);
      uploadData.append('project_id', projectId);
      uploadData.append('uploads', formData.file);
      if (formData.description) {
        uploadData.append('description', formData.description);
      }

      // DEBUG: Log FormData contents
      // console.log('=== DRAWING UPLOAD DATA ===');
      // console.log('space_id:', spaceId);
      // console.log('project_id:', projectId);
      for (let [key, value] of uploadData.entries()) {
        // console.log(`${key}:`, value);
      }

      const response = await authFetch(`${BASE_URL}/drawings/post`, {
        method: 'POST',
        body: uploadData,
      });

      // console.log('Response status:', response.status);

      if (response.ok) {
        const newDrawing = await response.json();
        // console.log('New drawing created:', newDrawing);
        
        // Replace optimistic drawing with real data
        onAdd({ 
          ...newDrawing, 
          status: 'success',
          // Keep the preview URL temporarily
          preview_url: imagePreview 
        });
        
        // Close modal on success
        handleClose();
        
        // Show success message
        showMessage('Drawing added successfully!', 'success');
      } else {
        // Get detailed error message
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        
        // Mark optimistic drawing as failed
        onAdd({ 
          ...optimisticDrawing, 
          status: 'error',
          error: `Failed to add drawing: ${response.status}`
        });
        
        throw new Error(`Failed to add drawing: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error adding drawing:', error);
      
      // Mark optimistic drawing as failed
      onAdd({ 
        ...optimisticDrawing, 
        status: 'error',
        error: error.message
      });
      
      showMessage('Failed to add drawing: ' + error.message, 'failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className={`theme-bg-secondary shadow-2xl rounded-lg max-w-md w-full p-6 ${isClosing ? "animate-fadeOutDown " : "animate-fadeInUp"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Add New Drawing</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Drawing Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder='Enter Drawing Name...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">File<span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors relative">
                <input
                  type="file"
                  required
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    {/* Check if it's an image file to show preview */}
                    {imagePreview.match(/\.(jpg|jpeg|png)$/i) || imagePreview.startsWith('blob:') ? (
                      <img src={imagePreview} alt="Preview" className="max-h-48 max-w-full rounded-lg mb-2" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Click to change file</p>
                  </div>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-10 h-10 mx-auto mb-2 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0l-4 4m4-4l4 4"
                      />
                    </svg>
                    <p className="text-sm theme-text-secondary">Click to upload or drag and drop</p>
                    <p className="text-xs theme-text-secondary mt-1">JPG, PNG</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder='Enter Description here'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Add Drawing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDrawingModal;