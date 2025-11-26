import React from 'react';

const PinterestBoardModal = ({ board, posts, loadingBoard, boardError, onClose, onImageClick, fetchBoardPosts, selectedBoard }) => {
  if (!board) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="theme-bg-card shadow-2xl rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold theme-text-primary">{board.title || 'Pinterest Board'}</h2>
            <p className="theme-text-secondary mt-1">
              {loadingBoard ? 'Loading pins...' : `${posts.length} pins`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Posts Grid */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loadingBoard ? (
            // Skeleton loader / spinner
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg aspect-square animate-pulse"></div>
              ))}
            </div>
          ) : boardError ? (
            // Error state with retry
            <div className="text-center py-12">
              <p className="text-red-500 font-medium">{boardError}</p>
              <button
                onClick={() => fetchBoardPosts(selectedBoard)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <p className="theme-text-secondary">This board doesn't contain any pins.</p>
            </div>
          ) : (
            // Pins grid
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map((post, index) => (
                <div
                  key={post.id || index}
                  className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square"
                  onClick={() => onImageClick(post)}
                >
                  <img
                    src={post.imageUrl || post.url}
                    alt={post.description || `Pin ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                    <div className="w-full p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="bg-black bg-opacity-70 text-white p-2 rounded text-sm line-clamp-2">
                        {post.description || `Pin ${index + 1}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinterestBoardModal;