import React from 'react';

const PinterestBoardModal = ({ board, posts, loading, onClose, onImageClick }) => {
    if (!board) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
            onClick={onClose}>
            <div className="theme-bg-card shadow-2xl rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold theme-text-primary">{board.title || 'Pinterest Board'}</h2>
                        <p className="theme-text-secondary mt-1">
                            {loading ? 'Loading pins...' : `${posts.length} pins`}
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
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="theme-text-secondary mt-4">Loading pins from Pinterest...</p>
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {posts.map((post, index) => (
                                <div
                                    key={post.id || index}
                                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                                    onClick={() => onImageClick(post)}
                                >
                                    <img
                                        src={post.imageUrl || post.url}
                                        alt={post.description || `Pin ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                                        <div className="w-full p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            <div className="bg-black bg-opacity-70 text-white p-2 rounded text-sm line-clamp-2">
                                                {post.description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium theme-text-secondary mb-2">No pins found</h3>
                            <p className="theme-text-secondary">This board doesn't contain any pins or we couldn't load them.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PinterestBoardModal;