import React, { useState } from "react";

const SiteMapCard = ({ siteMap, onDelete, onClick }) => {
  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className="theme-bg-card rounded-lg theme-border overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
      onClick={() => onClick(siteMap)}
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
        <div className="flex justify-between items-center text-xs theme-text-secondary">
          <div className="flex flex-col">
            <span>{formatFileSize(siteMap.file_size)}</span>
            <span>Uploaded {formatDate(siteMap.created_at)}</span>
          </div>
          <button

            //  delete onClick here
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete clicked for site map:', siteMap);
              console.log('Space ID:', siteMap.space_id);
              console.log('ID:', siteMap.id);
              // Pass the entire siteMap object, not just the ID
              onDelete(siteMap);
            }}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteMapCard;