import React, { useState } from "react";
import { BASE_URL } from '../Configuration/Config';
import StatusMessageProvider from "../Alerts/StatusMessage";
import { useStatusMessage } from "../Alerts/StatusMessage";

const AddDrawingModal = ({ spaceId, projectId, onClose, onAdd }) => {

  const {showMessage, showConfirmation} = useStatusMessage();
  const [formData, setFormData] = useState({
    name: '',
    file: null,
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsUploading(true);

  try {
    const uploadData = new FormData();
    uploadData.append('drawing_name', formData.name);
    uploadData.append('space_id', spaceId);
    uploadData.append('project_id', projectId);
    uploadData.append('uploads', formData.file);
    if (formData.description) {
      uploadData.append('description', formData.description);
    }

    // DEBUG: Log FormData contents
    console.log('=== DRAWING UPLOAD DATA ===');
    console.log('space_id:', spaceId);
    console.log('project_id:', projectId);
    for (let [key, value] of uploadData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch(`${BASE_URL}/drawings/post`, {
      method: 'POST',
      body: uploadData,
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const newDrawing = await response.json();
      console.log('New drawing created:', newDrawing);
      onAdd(newDrawing);
    } else {
      // Get detailed error message
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Failed to add drawing: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error adding drawing:', error);
    showMessage('Failed to add drawing: ' + error.message, 'failed');
  } finally {
    setIsUploading(false);
  }
};
  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6">
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
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">File<span className="text-red-500">*</span></label>
              <input
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png,.dwg"
                onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder='Enter Description here'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
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