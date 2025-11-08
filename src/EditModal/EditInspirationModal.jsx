import React, { useState, useEffect } from "react";
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';

const EditInspirationModal = ({ inspiration, spaceId, projectId, onClose, onUpdate }) => {
  const { showMessage, showFailed } = useStatusMessage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (inspiration) {
      setFormData({
        title: inspiration.title || inspiration.name || '',
        description: inspiration.description || '',
        file: null
      });
    }
  }, [inspiration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const uploadData = new FormData();
      const inspirationId = inspiration.inspiration_id || inspiration.id;
      
      uploadData.append('inspiration_id', inspirationId);
      uploadData.append('title', formData.title);
      uploadData.append('space_id', spaceId);
      uploadData.append('project_id', projectId);
      
      if (formData.file) {
        uploadData.append('uploads', formData.file);
      }
      
      if (formData.description) {
        uploadData.append('description', formData.description);
      }

      const response = await fetch(`${BASE_URL}/inspiration/update/${inspirationId}`, {
        method: 'PUT',
        body: uploadData,
      });

      if (response.ok) {
        const updatedInspiration = await response.json();
        onUpdate(updatedInspiration);
        showMessage('Inspiration updated successfully!', 'success');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to update inspiration: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating inspiration:', error);
      showFailed('Failed to update inspiration: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!inspiration) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Edit Inspiration</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder='Enter inspiration title...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                Image (Leave empty to keep current image)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current file: {inspiration.filename || inspiration.title}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder='Enter description...'
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
              {isUploading ? 'Updating...' : 'Update Inspiration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInspirationModal;