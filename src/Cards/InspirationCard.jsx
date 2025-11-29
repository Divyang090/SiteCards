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

  const handleCardClick = () => {
    if (onClick) {
      onClick(item);
    } else {
      window.open(item.file_url || item.url, '_blank');
    }
  };

  return (
    <div
      className="rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer bg-white"
      onClick={() => onClick && onClick(item)}
    >
      <div className="aspect-video bg-gradient-to-br from-blue-200 to-purple-200 relative overflow-hidden">
        {/* Tags*/}
        {item.tags && item.tags.length > 0 && (
          <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1 max-w-[70%]">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-500 bg-opacity-70 text-white px-2 py-1 rounded-2xl text-xs font-medium backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="bg-gray-500 bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Image with zoom effect */}
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={item.files?.[0]?.file_path ? `${BASE_URL}/${item.files[0].file_path}` : item.file_url || item.pinterestUrl}
            alt={item.title || item.name}
            className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-110"
          />


          {/* Hover Overlay with Title & Description */}
          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end">
            <div className="w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className=" bg-opacity-70 theme-text-secondary p-3 rounded-lg backdrop-blur-sm">
                <h3 className="text-gray-700 text-lg line-clamp-1">
                  {item.title || item.name || 'Untitled Inspiration'}
                </h3>
                {item.description && (
                  <p className="text-gray-700 text-sm opacity-90 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hover Actions*/}
        <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200 flex gap-1 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(item);
            }}
            className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors duration-200"
            title="Edit"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(item.inspiration_id || item.isnpiration_id || item.id);
            }}
            className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700 transition-colors duration-200"
            title="Delete"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* <div className="p-2">
      {/* Footer if needed */}
      {/* </div> */}
    </div>
  );
};

export default InspirationCard;