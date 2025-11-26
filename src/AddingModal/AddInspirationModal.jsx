import React, { useState, useEffect } from "react";
import { BASE_URL } from '../Configuration/Config';
import StatusMessageProvider from "../Alerts/StatusMessage";
import { useStatusMessage } from "../Alerts/StatusMessage";

const AddInspirationModal = ({ spaceId, projectId, onClose, onAdd }) => {
  const { showMessage } = useStatusMessage();
  const [formData, setFormData] = useState({
    title: '',
    file: null,
    description: '',
    pinterestUrl: '',
    tags: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [importOption, setImportOption] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  //Detects if it is a board
  const isPinterestBoardUrl = (url) => {
    return url.includes('pinterest.com/') &&
      (url.includes('/board/') ||
        url.match(/pinterest\.com\/[^/]+\/[^/]+\/?$/));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Helper to extract board ID from Pinterest URL
  const extractBoardIdFromUrl = (url) => {
    if (!url) return null;

    // Pattern: pinterest.com/username/board-name/
    const match = url.match(/pinterest\.com\/([^/]+\/[^/]+)/);
    return match ? match[1] : url; // fallback to full URL if pattern doesn't match
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  if (importOption === 'upload' && !formData.file) {
    showMessage('Please select an image to upload', 'failed');
    return;
  }

  setIsUploading(true);

  try {
    const uploadData = new FormData(); // declare first

    uploadData.append('space_id', spaceId);
    uploadData.append('title', formData.title || 'Untitled Inspiration');

    if (importOption === 'upload') {
      uploadData.append('uploads', formData.file);
    } else if (importOption === 'pinterest') {
      // Extract board ID
      const boardId = extractBoardIdFromUrl(formData.pinterestUrl);

      // Append Pinterest data
      uploadData.append('url', formData.pinterestUrl);
      uploadData.append('board_id', boardId); // send boardId to backend
      uploadData.append('isBoard', isPinterestBoardUrl(formData.pinterestUrl));
    }

    if (formData.description) {
      uploadData.append('description', formData.description);
    }

    if (formData.tags.length > 0) {
      uploadData.append('tags', formData.tags.join(','));
    }

    const response = await fetch(`${BASE_URL}/inspiration/post`, {
      method: 'POST',
      body: uploadData,
    });

    if (response.ok) {
      const newInspiration = await response.json();
      if (importOption === 'pinterest') {
        newInspiration.pinterestUrl = formData.pinterestUrl;
      }
      onAdd(newInspiration);
      showMessage('Inspiration added successfully!', 'success');
      onClose();
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to add inspiration: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error adding inspiration:', error);
    showMessage('Failed to add image: ' + error.message, 'failed');
  } finally {
    setIsUploading(false);
  }
};


  const handleAddCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!importOption) {
    return (
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
        onClick={onClose}
      >
        <div className="shadow-2xl theme-bg-secondary rounded-lg max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-2">Add Inspiration Images</h2>
          <p className="theme-text-secondary mb-6">
            Upload images or import from Pinterest to build your inspiration board
          </p>

          <div className="space-y-4">
            {/*Upload from Device */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => setImportOption('upload')}
            >
              <svg className="w-6 h-6 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-sm font-semibold mb-2">Upload from Device</div>
              <p className="text-xs theme-text-secondary">Choose images from your device or storage</p>
            </div>

            {/*Import from Pinterest */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => setImportOption('pinterest')}
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
              </svg>
              <div className="text-sm font-medium mb-1">Import from Pinterest</div>
              <p className="text-xs text-gray-500">Paste a Pinterest pin URL</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If an option is selected, show the respective form
  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-bold mb-2">Add Inspiration Images</h2>
        <p className="theme-text-secondary mb-6">
          Upload images or import from Pinterest to build your inspiration board
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* File Upload Section */}
            {importOption === 'upload' && (
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors relative">
                  <input
                    type="file"
                    required
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img src={imagePreview} alt="Preview" className="max-h-48 max-w-full rounded-lg mb-2" />
                      <p className="text-xs text-gray-500">Click to change image</p>
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm theme-text-secondary">Click to upload image</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Pinterest Import Section */}
            {importOption === 'pinterest' && (
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">Pinterest URL</label>
                <input
                  type="url"
                  required
                  value={formData.pinterestUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, pinterestUrl: e.target.value }))}
                  placeholder="https://pinterest.com/pin/..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}

            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                Title <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Modern Kitchen Design"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tags Field */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Tags</label>

              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs theme-bg-blue theme-text-blue border border-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-secondary theme-text-primary text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 theme-bg-secondary theme-text-primary text-sm"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                Notes <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add any notes about this image..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setImportOption('')}
              disabled={isUploading}
              className="px-4 py-2 text-gray-600 hover:text-gray-500 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Adding...' : 'Add Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInspirationModal;