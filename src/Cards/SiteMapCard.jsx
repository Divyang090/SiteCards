import React, { useState } from "react";
import { BASE_URL } from "../Configuration/Config";

const SiteMapCard = ({ siteMap, onDelete, onClick, onEdit }) => {
  const [showActions, setShowActions] = useState(false);

  const getCategoryIcon = (category) => {
    const icons = {
      'Custom': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      'Floor Plan': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      'Electrical': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      'Plumbing': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v4m0 4v4m0 4v4m8-12h-4m4 4h-4m4 4h-4M4 6h4m-4 4h4m-4 4h4" />
          <circle cx="12" cy="2" r="1" fill="currentColor" />
        </svg>
      ),
      'Structural': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      'Landscape': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18m-8-6l4-4 4 4m8 0l-4-4 4 4M7 8l5-5 5 5M7 16l5 5 5-5" />
        </svg>
      )
    };

    return icons[category] || icons['Custom'];
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
      className="theme-bg-card rounded-lg theme-border overflow-hidden md:hover:shadow-lg shadow-lg transition-shadow duration-300 group cursor-pointer relative"
      onClick={() => onClick(siteMap)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Preview Container with Category Icon */}
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden flex items-center justify-center">
        <div className="text-gray-600">
          {getCategoryIcon(siteMap.category)}
        </div>

        {/* Hover Actions Overlay */}
        <div className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-200 ${showActions ? 'md:opacity-100' : 'md:opacity-0 opacity-100'}`}>
          {/* Edit Button */}
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) {
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
          </button> */}

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

        {/* Bottom info */}
      </div>
    </div>
  );
};

export default SiteMapCard;