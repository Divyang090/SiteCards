import React, { useState, useEffect } from "react";
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';

const EditDrawingModal = ({ drawing, spaceId, projectId, onClose, onUpdate, drawingId, onClick }) => {
  console.log('=== EDIT MODAL PROPS ===');
  console.log('drawing:', drawing);
  console.log('spaceId prop:', spaceId);
  console.log('projectId prop:', projectId);
  console.log('drawingId prop:', drawingId);
  const { showMessage, showFailed } = useStatusMessage();
  const [Loading, setLoading] = useState();
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
        name: drawing.drawing_name || '',
        file: null,
        description: drawing.description || ''
      });
    }
  }, [drawing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setLoading(true);

    try {
      const currentDrawingId = drawing.drawing_id;

      const uploadData = new FormData();
      uploadData.append('drawing_id', currentDrawingId);
      uploadData.append('drawing_name', formData.name);
      uploadData.append('space_id', spaceId);
      uploadData.append('project_id', projectId);

      if (formData.file) {
        uploadData.append('uploads', formData.file);
      }

      if (formData.description) {
        uploadData.append('description', formData.description);
      }

      // EXTREME DEBUGGING - Log EVERYTHING
      console.log('🔍 === EXTREME DEBUGGING ===');
      console.log('📝 Drawing object:', drawing);
      console.log('🆔 Current Drawing ID:', currentDrawingId);
      console.log('🏠 Space ID being sent:', spaceId);
      console.log('📋 Project ID being sent:', projectId);
      console.log('🌐 Full URL:', `${BASE_URL}drawings/update/drawing/${currentDrawingId}`);

      console.log('📦 FormData contents:');
      for (let [key, value] of uploadData.entries()) {
        console.log(`   ${key}:`, value, `(type: ${typeof value})`);
      }

      const response = await fetch(`${BASE_URL}/drawings/update/drawing/${currentDrawingId}`, {
        method: 'PUT',
        body: uploadData,
      });

      console.log('📡 Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Backend Error Response:', errorText);
        throw new Error(`Failed to update drawing: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Update result:', result);

      // MANUAL CONSTRUCTION: Create updated drawing object from form data
      const updatedDrawing = {
        // Keep all existing drawing properties
        ...drawing,

        drawing_name: formData.name,
        description: formData.description,

        // Handle file update - if a new file was selected
        ...(formData.file && {
          files: [
            {
              filename: formData.file.name,
              file_path: formData.file.name,
              file_size: formData.file.size,
              file_type: formData.file.type,
              uploaded_at: new Date().toISOString(),
            }
          ]
        }),

        // Update timestamps if needed
        updated_at: new Date().toISOString(),

        // Include any additional fields from the update result
        ...(result.new_revision && { revision: result.new_revision })
      };

      console.log('📥 Constructed updated drawing:', updatedDrawing);
      console.log('🔄 Sending to parent onUpdate...');

      // Pass the complete updated drawing data to onUpdate
      onUpdate(updatedDrawing);
      showMessage('Drawing updated successfully!', 'success');
      onClose();

    } catch (error) {
      console.error('💥 Error updating drawing:', error);
      showFailed('Failed to update drawing: ' + error.message);
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  if (!drawing) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className="theme-bg-secondary shadow-2xl rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
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
                Current file: {drawing.files?.[0]?.filename || drawing.drawing_name}
              </p>
              {drawing.files?.[0]?.file_path && (
                <p className="text-xs text-gray-500">
                  File path: {drawing.files[0].file_path}
                </p>
              )}
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