import React, { useEffect, useState } from 'react';

const InspirationPinClickModal = ({ pin, onClose, onDelete }) => {
  const [selectedImageSize, setSelectedImageSize] = useState('1200x');

  // Extract hashtags from description
  const extractHashtags = (description) => {
    if (!description) return [];
    const hashtags = description.match(/#[\w-]+/g) || [];
    return hashtags.slice(0, 10); // Limit to 10 hashtags
  };

  // Get available image sizes
  const getAvailableImageSizes = () => {
    if (!pin?.media?.images) return [];
    return Object.keys(pin.media.images).sort((a, b) => {
      const sizeOrder = { '1200x': 1, '600x': 2, '400x300': 3, '150x150': 4 };
      return (sizeOrder[a] || 5) - (sizeOrder[b] || 5);
    });
  };

  // Get image URL for selected size
  const getImageUrl = () => {
    if (!pin?.media?.images) return '';
    return pin.media.images[selectedImageSize]?.url || pin.media.images['1200x']?.url || '';
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!pin) return null;

  const hashtags = extractHashtags(pin.description);
  const imageSizes = getAvailableImageSizes();

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white text-gray-800 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Section - Pinterest Red Theme */}
        <div className="md:w-2/3 bg-gradient-to-br from-red-50 to-pink-50 p-6 flex items-center justify-center">
          <div className="relative max-w-3xl w-full">
            {/* Image with Pinterest frame */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={getImageUrl()}
                alt={pin.title || 'Pinterest Pin'}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              
              {/* Pinterest logo watermark */}
              <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
                </svg>
              </div>
            </div>

            {/* Image size selector */}
            {imageSizes.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {imageSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedImageSize(size)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedImageSize === size
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size === '1200x' ? 'Large' : 
                     size === '600x' ? 'Medium' : 
                     size === '400x300' ? 'Small' : size}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="md:w-1/3 p-6 md:p-8 overflow-y-auto">
          {/* Pinterest header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-500 p-2 rounded-full">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pinterest Pin</h2>
              <p className="text-sm text-gray-600">Detailed View</p>
            </div>
          </div>

          {/* Pin Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {pin.title || 'Untitled Pin'}
          </h1>

          {/* Pin Description */}
          {pin.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{pin.description}</p>
            </div>
          )}

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-red-100 text-red-800"
                  >
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Pin ID</h3>
                <p className="text-sm text-gray-600 truncate">{pin.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Board ID</h3>
                <p className="text-sm text-gray-600 truncate">{pin.board_id}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Created</h3>
              <p className="text-sm text-gray-600">
                {new Date(pin.created_at).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {pin.board_owner?.username && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Board Owner</h3>
                <p className="text-sm text-gray-600">{pin.board_owner.username}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <a
              href={pin.link || `https://pinterest.com/pin/${pin.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
              </svg>
              Open on Pinterest
            </a>

            {onDelete && (
              <button
                onClick={() => onDelete(pin.inspiration_id || pin.id)}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Remove from Inspirations
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspirationPinClickModal;