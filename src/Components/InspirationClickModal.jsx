import React from 'react';
import { BASE_URL } from '../Configuration/Config';

const InspirationClickModal = ({ inspiration, onClose }) => {
    if (!inspiration) return null;

const getFileUrl = (item) => {
    console.log('🔍 Inspiration item:', item);
    console.log('🔍 Files array:', item.files);
    
    // For uploaded files - use the files array from backend response
    if (item.files && item.files.length > 0 && item.files[0].file_path) {
        let filePath = item.files[0].file_path;
        console.log('🔍 File path:', filePath);
        
        // Remove /api from BASE_URL for file paths
        const fileBaseUrl = BASE_URL;
        
        // Construct full URL
        const fullUrl = `${fileBaseUrl}/${filePath}`;
        console.log('🔍 Full image URL:', fullUrl);
        return fullUrl;
    }
    
    // For Pinterest URLs
    if (item.pinterest_url || item.url) {
        console.log('🔍 Pinterest URL:', item.pinterest_url || item.url);
        return item.pinterest_url || item.url;
    }
    
    console.log('🔍 No valid image source found');
    return '';
};

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isPinterest = inspiration.source === 'pinterest' ||
        inspiration.pinterest_url ||
        (inspiration.url && inspiration.url.includes('pinterest'));

    const fileUrl = getFileUrl(inspiration);

    const handlePinterestClick = () => {
        if (isPinterest) {
            const pinterestUrl = inspiration.pinterest_url || inspiration.url;
            window.open(pinterestUrl, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
            onClick={onClose}>
            <div className="theme-bg-card shadow-2xl rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Image/Content */}
                    <div className="mb-6 relative">
                        <img
                            src={fileUrl}
                            alt={inspiration.title || inspiration.name}
                            className="max-w-full max-h-96 object-contain mx-auto rounded-lg"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div className="hidden text-center p-8 bg-gray-100 rounded-lg">
                            <span className="text-6xl">🖼️</span>
                            <p className="mt-2 text-gray-600">Image not available</p>
                        </div>

                        {/* Pinterest Badge */}
                        {isPinterest && (
                            <div className="absolute bottom-4 right-4">
                                <button
                                    onClick={handlePinterestClick}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors duration-200 shadow-lg"
                                    title="Open on Pinterest"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
                                    </svg>
                                    <span className="font-medium">View on Pinterest</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <h2 className="text-md theme-text-primary">{inspiration.title || inspiration.name || 'Untitled Inspiration'}</h2>


                    {/* Description */}
                    {inspiration.description && (
                        <div className="mb-2">
                            <p className="theme-text-secondary whitespace-pre-wrap">{inspiration.description}</p>
                        </div>
                    )}

                    {/* Tags */}
                    {inspiration.tags && inspiration.tags.length > 0 && (
                        <div className="">
                            <div className="flex flex-wrap gap-2">
                                {inspiration.tags.map((tag, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date and Source */}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        {isPinterest && (
                            <div className="text-red-600 font-medium">
                                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
                                </svg>
                                From Pinterest
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspirationClickModal;