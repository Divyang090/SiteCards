import React from 'react';
import { BASE_URL } from '../Configuration/Config';

const InspirationCard = ({ item, onEdit, onDelete, onClick }) => {

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if it's a Pinterest pin
  const isPinterestPin = item.media?.images || item.board_id || item.link?.includes('pinterest');

  // Get image URL for Pinterest pins
  const getPinterestImageUrl = () => {
    if (item.media?.images?.['400x300']?.url) return item.media.images['400x300'].url;
    if (item.media?.images?.['150x150']?.url) return item.media.images['150x150'].url;
    if (item.media?.images?.['600x']?.url) return item.media.images['600x'].url;
    return null;
  };

  const getPinterestTitle = () => {
    return item.title || item.name || 'Untitled Pin';
  };

  const getPinterestUrl = () => {
    return item.link || item.pinterestUrl || `https://pinterest.com/pin/${item.id}`;
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <div
      className="rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer bg-white border border-gray-200"
      onClick={handleCardClick}
    >
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50">
        {/* Pinterest Badge */}
        {isPinterestPin && (
          <div className="absolute top-2 left-2 z-20">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
              </svg>
              <span>Pinterest</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className={`absolute ${isPinterestPin ? 'top-12' : 'top-2'} left-2 z-10 flex flex-wrap gap-1 max-w-[70%]`}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-800 bg-opacity-80 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="bg-gray-800 bg-opacity-80 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Image with zoom effect */}
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={isPinterestPin 
              ? getPinterestImageUrl()
              : item.files?.[0]?.file_path 
                ? `${BASE_URL}/${item.files[0].file_path}` 
                : item.file_url}
            alt={getPinterestTitle()}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNFRUVFRUUiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
            }}
          />

          {/* Full height hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
            <div className="w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-white/50 font-semibold text-2xl line-clamp-2 mb-1">
                  {getPinterestTitle()}
                </h3>
                
                {/* Pinterest pin metadata */}
                {isPinterestPin && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    {item.created_at && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(item.created_at)}
                      </span>
                    )}
                    {item.board_owner?.username && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {item.board_owner.username}
                      </span>
                    )}
                    <span className="text-xs text-blue-600 font-medium">
                      Click to view →
                    </span>
                  </div>
                )}
                
                {/* Regular inspiration description (brief) */}
                {!isPinterestPin && item.description && (
                  <p className="text-white/40 text-lg opacity-90 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hover Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-20">
          {!isPinterestPin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(item);
              }}
              className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              title="Edit"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(item.inspiration_id || item.isnpiration_id || item.id);
            }}
            className={`${isPinterestPin ? 'bg-red-500' : 'bg-red-600'} text-white p-1.5 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md`}
            title="Delete"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspirationCard;