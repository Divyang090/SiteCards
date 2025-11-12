import React, { useState, useEffect } from "react";
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';

const EditDrawingModal = ({ drawing, spaceId, projectId, onClose, onUpdate, drawingId }) => {
  const { showMessage, showFailed } = useStatusMessage();
  const [formData, setFormData] = useState({
    name: '',
    file: null,
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
      return () => {
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
      };
    }, [imagePreview]);

      const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Initialize form with current drawing data
  useEffect(() => {
    if (drawing) {
      setFormData({
        name: drawing.drawing_name || drawing.name || '',
        file: null,
        description: drawing.description || ''
      });
    }
  }, [drawing]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsUploading(true);

  try {
    const drawingId = drawing.drawing_id || drawing.id;
    
    const uploadData = new FormData();
    
    uploadData.append('drawing_id', drawingId);
    uploadData.append('drawing_name', formData.name);
    uploadData.append('space_id', spaceId);
    uploadData.append('project_id', projectId);
    
    if (formData.file) {
      uploadData.append('uploads', formData.file);
    }
    
    if (formData.description) {
      uploadData.append('description', formData.description);
    }

    // DEBUG: Log FormData contents
    console.log('=== DRAWING UPDATE DATA ===');
    console.log('drawing_id:', drawingId);
    console.log('space_id:', spaceId);
    console.log('project_id:', projectId);
    for (let [key, value] of uploadData.entries()) {
      console.log(`${key}:`, value);
    }
        //${drawingId} update using drawingid
    const response = await fetch(`${BASE_URL}/drawings/update/${drawingId}`, {
      method: 'PUT',
      body: uploadData,
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const updatedDrawing = await response.json();
      console.log('Drawing updated:', updatedDrawing);
      onUpdate(updatedDrawing);
      showMessage('Drawing updated successfully!', 'success');
    } else {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Failed to update drawing: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error updating drawing:', error);
    showFailed('Failed to update drawing: ' + error.message);
  } finally {
    setIsUploading(false);
  }
};

  if (!drawing) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Edit Drawing</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Drawing Name</label>
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
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                File (Leave empty to keep current file)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.dwg"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current file: {drawing.filename || drawing.drawing_name}
              </p>
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
              {isUploading ? 'Updating...' : 'Update Drawing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDrawingModal;