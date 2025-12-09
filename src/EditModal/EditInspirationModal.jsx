import React, { useState, useEffect } from "react";
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';
import { useAuth } from "../Components/AuthContext";

const EditInspirationModal = ({ inspiration, spaceId, projectId, onClose, onUpdate, onClick }) => {
  const { showMessage, showFailed } = useStatusMessage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    tags: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);
  const { authFetch } = useAuth();

  // Predefined tags from your screenshot
  const predefinedTags = [
    'contractor', 'supplier', 'service-provider', 'furniture',
    'paint', 'tiles', 'hardware', 'kitchen', 'sanitaryware',
    'lighting', 'glass', 'interior-design', 'plumbing',
    'electrical', 'carpentry'
  ];

  useEffect(() => {
    if (inspiration) {
      setFormData({
        title: inspiration.title || inspiration.name || '',
        description: inspiration.description || '',
        file: null,
        tags: inspiration.tags || []
      });
    }
  }, [inspiration]);

  const handleTagToggle = (tag) => {
    setFormData(prev => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tag)) {
        return {
          ...prev,
          tags: currentTags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          tags: [...currentTags, tag]
        };
      }
    });
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
      setShowCustomTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const uploadData = new FormData();

      const inspirationId = inspiration.inspiration_id || inspiration.isnpiration_id || inspiration.id;

      // console.log('🔍 === INSPIRATION UPDATE DEBUGGING ===');
      // console.log('📝 Inspiration object:', inspiration);
      // console.log('🆔 Inspiration ID found:', inspirationId);

      if (!inspirationId) {
        throw new Error('No inspiration ID found!');
      }

      uploadData.append('isnpiration_id', inspirationId);
      uploadData.append('title', formData.title);
      uploadData.append('space_id', spaceId);
      uploadData.append('project_id', projectId);
      uploadData.append('description', formData.description);
      uploadData.append('tags', formData.tags.join(','));

      if (formData.file) {
        uploadData.append('uploads', formData.file);
      }

      const url = `${BASE_URL}/inspiration/update_inspirations/${inspirationId}`;
      // console.log('🌐 Making PUT request to:', url);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        // console.log('⏰ Request timeout after 10 seconds');
        controller.abort();
      }, 10000);

      // console.log('🕐 Starting fetch request...');
      const startTime = Date.now();

      const response = await authFetch(url, {
        method: 'PUT',
        body: uploadData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const endTime = Date.now();
      // console.log(`🕐 Request completed in ${endTime - startTime}ms`);

      // console.log('📡 Response Status:', response.status);
      // console.log('📡 Response OK:', response.ok);

      // Get response as text first
      const responseText = await response.text();
      // console.log('📄 Raw Response Text:', responseText);
      // console.log('📄 Response Text Length:', responseText.length);

      if (response.ok) {
        // console.log('✅ Request was successful');

        let result;
        if (responseText && responseText.trim() !== '') {
          try {
            result = JSON.parse(responseText);
            // console.log('✅ Parsed Response JSON:', result);
          } catch (parseError) {
            // console.log('⚠️ Failed to parse JSON, using raw text:', responseText);
            result = { message: responseText };
          }
        } else {
          // console.log('ℹ️ Empty response from server');
          result = { message: 'Update successful' };
        }

        // Construct updated inspiration object
        const finalInspiration = {
          ...inspiration,
          inspiration_id: inspirationId,
          isnpiration_id: inspirationId,
          title: formData.title,
          description: formData.description,
          tags: formData.tags,
          updated_at: new Date().toISOString()
        };

        // console.log('🔄 Calling onUpdate with:', finalInspiration);

        // Update parent component
        onUpdate(finalInspiration);
        showMessage('Inspiration updated successfully!', 'success');
        onClose();

      } else {
        // console.log('❌ Request failed with status:', response.status);
        // console.log('❌ Error response:', responseText);
        throw new Error(`Server returned ${response.status}: ${responseText || 'No error message'}`);
      }

    } catch (error) {
      console.error('💥 Fetch error:', error);
      if (error.name === 'AbortError') {
        showFailed('Request timed out. Please try again.');
      } else if (error.name === 'TypeError') {
        showFailed('Network error. Please check your connection.');
      } else {
        showFailed(error.message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!inspiration) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className="theme-bg-secondary animate-fadeInUp shadow-2xl rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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

            {/* Tags Section - Updated with proper tag selection */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">Tags</label>

              {/* Selected Tags Display */}
              {formData.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 border border-blue-100 theme-bg-card theme-text-secondary px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Predefined Tags */}
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Select from predefined tags:</p>
                <div className="flex flex-wrap gap-2">
                  {predefinedTags.map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm border ${formData.tags.includes(tag)
                          ? 'theme-bg-card theme-text-secondary border-blue-500'
                          : 'theme-bg-card theme-text-secondary '
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Tag Input - Always Visible */}
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Add custom tag:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Enter custom tag..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="theme-bg-card theme-text-secondary border border-dashed px-4 py-2 rounded-lg hover:bg-green-600 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
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