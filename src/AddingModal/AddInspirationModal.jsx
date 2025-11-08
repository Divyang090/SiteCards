import React, { useState } from 'react';
import { BASE_URL } from '../Configuration/Config';

const AddInspirationModal = ({ spaceId, projectId, onClose, onAdd }) => {
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
      uploadData.append('title', formData.name);
      uploadData.append('space_id', formData.spaceId);
      uploadData.append('project_id', formData.projectId);
      // uploadData.append('tags','inspiration');
      uploadData.append('uploads', formData.file);
      
      if (formData.description) {
        uploadData.append('description', formData.description);
      }

      // DEBUG: Log FormData contents
      console.log('=== INSPIRATION UPLOAD DATA ===');
      console.log('space_id:', spaceId);
      console.log('project_id:', projectId);
      for (let [key, value] of uploadData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch(`${BASE_URL}/inspiration/post`, {
        method: 'POST',
        body: uploadData,
      });

      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        const newInspiration = await response.json();
        console.log('New inspiration created:', newInspiration);
        
        // Transform the response to match frontend format
        const transformedInspiration = {
          id: newInspiration.inspiration_id || newInspiration.id,
          title: newInspiration.title || newInspiration.name,
          description: newInspiration.description,
          file_url: newInspiration.file_url || newInspiration.url,
          created_at: newInspiration.created_at
        };
        
        onAdd(transformedInspiration);
        alert('Inspiration added successfully!');
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        
        let errorMessage = `Failed to add inspiration: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch {
          errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding inspiration:', error);
      alert('Failed to add inspiration: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add New Inspiration</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Inspiration Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder='Enter Inspiration Name here...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Image *</label>
              <input
                type="file"
                required
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder='Write Description here...'
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
              {isUploading ? 'Uploading...' : 'Add Inspiration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInspirationModal;