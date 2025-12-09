import React, { useState, useEffect } from "react";
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';
import { useAuth } from "../Components/AuthContext";

const EditSiteMapModal = ({ siteMap, projectId, onClose, onUpdate }) => {
  const { showMessage, showFailed } = useStatusMessage();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const { authFetch } = useAuth();

  useEffect(() => {
    if (siteMap) {
      setFormData({
        name: siteMap.space_name || siteMap.name || siteMap.title || '',
        category: siteMap.category || 'general',
        description: siteMap.description || '',
        file: siteMap.file || siteMap.uploads || null
      });
    }
  }, [siteMap]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const uploadData = new FormData();
      const spaceId = siteMap.space_id || siteMap.id;
      
      uploadData.append('space_id', spaceId);
      uploadData.append('space_name', formData.name);
      uploadData.append('category', formData.category);
      uploadData.append('project_id', projectId);
      
      if (formData.file) {
        uploadData.append('files', formData.file);
      }
      
      if (formData.description) {
        uploadData.append('description', formData.description);
      }

      // DEBUG LOGS
      // console.log('=== SITE MAP UPDATE DATA ===');
      // console.log('space_id:', spaceId);
      // console.log('space_name:', formData.name);
      // console.log('category:', formData.category);
      // console.log('project_id:', projectId);
      // for (let [key, value] of uploadData.entries()) {
      //   console.log(`${key}:`, value);
      // }

      const response = await authFetch(`${BASE_URL}/spaces/update/${spaceId}`, {
        method: 'PUT',
        body: uploadData,
      });

      // console.log('Response status:', response.status);
      
      if (response.ok) {
        const updatedSiteMap = await response.json();
        // console.log('Site map updated:', updatedSiteMap);
        onUpdate(updatedSiteMap);
        showMessage('Site map updated successfully!', 'success');
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to update site map: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating site map:', error);
      showFailed('Failed to update site map: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!siteMap) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Edit Site Map</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Site Map Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder='Enter site map name...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="floor-plan">Floor Plan</option>
                <option value="elevation">Elevation</option>
                <option value="section">Section</option>
                <option value="site-plan">Site Plan</option>
                <option value="mechanical">Mechanical</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                File (Leave empty to keep current file)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.dwg"
                onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current file: {siteMap.files?.[0]?.filename || 'No file'}
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
              {isUploading ? 'Updating...' : 'Update Site Map'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSiteMapModal;