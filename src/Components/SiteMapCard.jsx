import React, { useState } from "react";
import { BASE_URL } from "../Configuration/Config";

const SiteMapCard = ({ siteMap, onDelete, onClick, onEdit }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showActions, setShowActions] =useState(false);

const mainFile = siteMap?.files?.[0] || null;
const imageUrl = mainFile?.file_path 
  ? `${BASE_URL}/${mainFile.file_path.replace(/\\/g, '/')}`
  : null;
const isImage = mainFile?.filename?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
const hasFiles = siteMap?.files && siteMap.files.length > 0;

const getFileIcon = () => {
  if (!hasFiles) return '📁'; // Folder icon for no files
  if (isImage) return '🖼️'; // Image icon
  return '📎'; // File icon for other types
};

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const bytesNum = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
    if (bytesNum === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytesNum) / Math.log(k));
    return parseFloat((bytesNum / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImageError = (e) => {
    console.log('Image failed to load:', imageUrl);
    setImageError(true);
    setImageLoading(false);
    e.target.style.display = 'none';
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  console.log('SiteMap file debug:', {
    files: siteMap.files,
    mainFile: mainFile,
    imageUrl: imageUrl,
    isImage: isImage
  });

  return (
    <div
      className="theme-bg-card rounded-lg theme-border overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer relative"
      onClick={() => onClick(siteMap)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Preview Container */}
      <div className="aspect-video bg-gray-200 relative overflow-hidden">
        {siteMap.file_type?.includes('image') ? (
          <img
            src={siteMap.file_url}
            alt={siteMap.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : null}
        <div className={`w-full h-full bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center ${siteMap.file_type?.includes('image') ? 'hidden' : 'flex'}`}>
  <span className="text-4xl">{getFileIcon(siteMap.file_type)}</span>
</div>

        {/* Hover Actions Overlay */}
        <div className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if(onEdit){
                onEdit(siteMap);
              } else {
                console.warn('Edit functionality not available for sitemaps')
              }
            }}
            className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors duration-200"
            title="Edit"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(siteMap);
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

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold theme-text-primary text-lg mb-1 truncate">
          {siteMap.space_name || siteMap.name || siteMap.title || 'Untitled Site Map'}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs theme-text-secondary theme-bg-primary px-2 py-1 rounded">
            {siteMap.category || 'Uncategorized'}
          </span>
        </div>
        <p className="theme-text-secondary text-sm mb-2 line-clamp-2">
          {siteMap.description || 'No description'}
        </p>

        {/* Bottom actions - always visible but subtle */}
        <div className="flex justify-between items-center text-xs theme-text-secondary mt-2">
          <div className="flex-1">
            {/* Empty space - you can add other info here if needed */}
          </div>
          <div className={`flex gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-30'}`}>    
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteMapCard;