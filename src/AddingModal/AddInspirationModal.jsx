import React, { useState, useEffect } from "react";
import { BASE_URL } from '../Configuration/Config';
import StatusMessageProvider from "../Alerts/StatusMessage";
import { useStatusMessage } from "../Alerts/StatusMessage";
import { useAuth } from "../Components/AuthContext";

const AddInspirationModal = ({ spaceId, projectId, onClose, onAdd }) => {
  const { showMessage } = useStatusMessage();
  const { authFetch } = useAuth();
  const [formData, setFormData] = useState({ title: '', file: null, description: '', pinterestUrl: '', tags: [] });
  const [isUploading, setIsUploading] = useState(false);
  const [importOption, setImportOption] = useState('');
  const [pinterestOption, setPinterestOption] = useState(''); // 'pin' or 'board'
  const [customTag, setCustomTag] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [boardPins, setBoardPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(false);
  const [selectedPins, setSelectedPins] = useState([]);
  const [importStep, setImportStep] = useState('selectBoard');

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Load Pinterest boards when board option is selected
  useEffect(() => {
    if (pinterestOption === 'board') {
      loadPinterestBoards();
    }
  }, [pinterestOption]);

  const loadPinterestBoards = async () => {
    setLoadingBoards(true);
    try {
      const response = await authFetch(`${BASE_URL}/pinterest/boards`);
      const data = await response.json();

      if (Array.isArray(data.items)) {
        setBoards(data.items);
      } else {
        setBoards([]);
      }
    } catch (err) {
      console.error("Error loading boards:", err);
      showMessage('Failed to load Pinterest boards', 'failed');
      setBoards([]);
    } finally {
      setLoadingBoards(false);
    }
  };

  //Load Pins from boards
  const loadBoardPins = async (boardId) => {
    setLoadingPins(true);
    try {
      const response = await authFetch(`${BASE_URL}/pinterest/boards/${boardId}/pins`);
      const data = await response.json();

      if (Array.isArray(data.items)) {
        setBoardPins(data.items);
      } else {
        setBoardPins([]);
        showMessage('No pins found in this board', 'info');
      }
    } catch (err) {
      console.error("Error loading board pins:", err);
      showMessage('Failed to load board pins', 'failed');
      setBoardPins([]);
    } finally {
      setLoadingPins(false);
    }
  };

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

    if (importOption === 'pinterest' && pinterestOption === 'pin' && !formData.pinterestUrl) {
      showMessage('Please enter a Pinterest URL', 'failed');
      return;
    }

    setIsUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('space_id', spaceId);
      uploadData.append('title', formData.title || 'Untitled Inspiration');

      if (importOption === 'upload') {
        uploadData.append('uploads', formData.file);
      } else if (importOption === 'pinterest' && pinterestOption === 'pin') {
        // Extract board ID
        const boardId = extractBoardIdFromUrl(formData.pinterestUrl);

        // Append Pinterest data
        uploadData.append('url', formData.pinterestUrl);
        uploadData.append('board_id', boardId);
        uploadData.append('isBoard', isPinterestBoardUrl(formData.pinterestUrl));
      }

      if (formData.description) {
        uploadData.append('description', formData.description);
      }

      if (formData.tags.length > 0) {
        uploadData.append('tags', formData.tags.join(','));
      }

      const response = await authFetch(`${BASE_URL}/inspiration/post`, {
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

  // Handle board selection
  const handleBoardSelect = async (board) => {
    setSelectedBoard(board);
    setImportStep('selectPins');
    await loadBoardPins(board.id);
  };

  // Render Pinterest options selection
  if (importOption === '' && !pinterestOption) {
    return (
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
        onClick={onClose}
      >
        <div className="shadow-2xl animate-fadeInUp theme-bg-secondary rounded-lg max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-2">Add Inspiration Images</h2>
          <p className="theme-text-secondary mb-6">
            Upload images or import from Pinterest to build your inspiration board
          </p>

          <div className="space-y-4">
            {/* Upload from Device */}
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

            {/* Import from Pinterest */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => setImportOption('pinterest')}
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
              </svg>
              <div className="text-sm font-medium mb-1">Import from Pinterest</div>
              <p className="text-xs text-gray-500">Import pins or entire boards</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Pinterest options (pin or board)
  if (importOption === 'pinterest' && !pinterestOption) {
    return (
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
        onClick={onClose}
      >
        <div className="shadow-2xl animate-fadeInUp theme-bg-secondary rounded-lg max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setImportOption('')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-xl font-bold mb-2">Import from Pinterest</h2>
          <p className="theme-text-secondary mb-6">
            Choose what you want to import from Pinterest
          </p>

          <div className="space-y-4">
            {/* Import Individual Pins */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => setPinterestOption('pin')}
            >
              <div className="flex justify-center items-center mb-2">
                <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4 12l8 10 8-10L12 2zm0 15a3 3 0 110-6 3 3 0 010 6z" />
                </svg>
              </div>
              <div className="text-sm font-semibold mb-1">Import Individual Pins</div>
              <p className="text-xs theme-text-secondary">Import single pins using URLs</p>
            </div>

            {/* Import Boards */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => setPinterestOption('board')}
            >
              <div className="flex justify-center items-center mb-2">
                <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h7v7H4zm0 9h7v7H4zm9 0h7v7h-7zm0-9h7v7h-7z" />
                </svg>
              </div>
              <div className="text-sm font-semibold mb-1">Import Boards</div>
              <p className="text-xs theme-text-secondary">Import entire Pinterest boards</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render board grid view
  if (pinterestOption === 'board') {
    return (
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px] overflow-auto"
        onClick={onClose}
      >
        <div className="theme-bg-secondary rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl scrollbar-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                type="button"
                onClick={() => setPinterestOption('')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="text-xl font-bold mt-2">Select a Pinterest Board</h2>
              <p className="theme-text-secondary text-sm">Choose a board to import</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loadingBoards ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Loading boards...</span>
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-12">
              <p className="theme-text-secondary">No Pinterest boards found</p>
              <button
                onClick={loadPinterestBoards}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer theme-bg-primary"
                  onClick={() => handleBoardSelect(board)}
                >
                  {board.image_cover_url ? (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={board.image_cover_url}
                        alt={board.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-red-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{board.name}</h3>
                    {board.description && (
                      <p className="text-sm theme-text-secondary truncate mt-1">{board.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {board.pin_count || 0} pins
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        Import
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render the form (for upload or individual pin)
  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              type="button"
              onClick={() => {
                if (importOption === 'pinterest') {
                  setPinterestOption('');
                } else {
                  setImportOption('');
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-sm font-bold mt-2">
              {importOption === 'upload' ? 'Upload from Device' : 'Import Individual Pin'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
            {importOption === 'pinterest' && pinterestOption === 'pin' && (
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
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-gray-600 hover:text-gray-500 disabled:opacity-50"
            >
              Cancel
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