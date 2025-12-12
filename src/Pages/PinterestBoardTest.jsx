import React, { useState, useEffect } from 'react';
import { useAuth } from "../Components/AuthContext";
import { BASE_URL } from '../Configuration/Config';

const PinterestBoardTest = () => {
  const { authFetch } = useAuth();
  const [boardId, setBoardId] = useState('974396138068771971');
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);

  const loadBoardPins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`${BASE_URL}/pinterest/boards/${boardId}/pins`);
      const data = await response.json();
      setPins(data.items || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading pins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportAll = async () => {
    setImporting(true);
    try {
      // This would be your actual import logic
      // For now, just simulate and show a message
      console.log('Importing pins:', pins);
      alert(`Would import ${pins.length} pins to inspiration section`);
      
      // In your actual app, you would call:
      // pins.forEach(pin => onAdd(pin));
      // onClose();
    } catch (err) {
      console.error('Error importing pins:', err);
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    // Load pins when component mounts
    loadBoardPins();
  }, []);

  return (
    <div className="min-h-screen theme-bg-primary theme-text-primary p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pinterest Board Imports</h1>
          <p className="text-gray-600 mb-4">
            Test page for previewing and importing Pinterest board pins
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Board ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-secondary"
                  placeholder="Enter Pinterest board ID"
                />
                <button
                  onClick={loadBoardPins}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load Pins'}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleImportAll}
              disabled={loading || pins.length === 0 || importing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
            >
              {importing ? 'Importing...' : `Import All (${pins.length})`}
            </button>
          </div>
        </div>

        {/* Stats */}
        {pins.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{pins.length}</div>
                <div className="text-sm text-blue-600">Total Pins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {pins.filter(p => p.media?.media_type === 'image').length}
                </div>
                <div className="text-sm text-green-600">Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {new Set(pins.map(p => p.board_id)).size}
                </div>
                <div className="text-sm text-purple-600">Unique Boards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-700">
                  {pins.filter(p => p.description).length}
                </div>
                <div className="text-sm text-orange-600">With Descriptions</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Error: {error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading pins from Pinterest...</span>
          </div>
        )}

        {/* Pins Grid */}
        {!loading && pins.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Pins Preview ({pins.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pins.map((pin) => {
                const imageUrl = pin.media?.images?.['400x300']?.url || 
                               pin.media?.images?.['150x150']?.url ||
                               pin.media?.images?.['600x']?.url;
                
                return (
                  <div 
                    key={pin.id} 
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow theme-bg-secondary"
                  >
                    {/* Pin Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={pin.title || 'Pinterest pin'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNFRUVFRUUiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                          <svg className="w-12 h-12 text-red-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017 0z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Pin
                      </div>
                    </div>

                    {/* Pin Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {pin.title || 'Untitled Pin'}
                      </h3>
                      
                      {pin.description && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                          {pin.description}
                        </p>
                      )}

                      {/* Pin Metadata */}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {pin.created_at && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(pin.created_at).toLocaleDateString()}
                          </div>
                        )}
                        
                        {pin.board_owner?.username && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {pin.board_owner.username}
                          </div>
                        )}
                      </div>

                      {/* Pin ID */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400 truncate">ID: {pin.id}</span>
                          <a
                            href={pin.link || `https://pinterest.com/pin/${pin.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Open ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && pins.length === 0 && !error && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No pins found</h3>
            <p className="text-gray-600 mb-6">Try loading a different board ID</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={loadBoardPins}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reload
              </button>
            </div>
          </div>
        )}

        {/* API Response Preview (Debug) */}
        {pins.length > 0 && (
          <div className="mt-8">
            <details className="border border-gray-200 rounded-lg overflow-hidden">
              <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium">
                View API Response (Debug)
              </summary>
              <div className="p-4 bg-gray-900 text-gray-100 text-sm overflow-auto max-h-64">
                <pre>{JSON.stringify(pins.slice(0, 2), null, 2)}</pre>
                {pins.length > 2 && (
                  <div className="mt-2 text-gray-400">
                    ... and {pins.length - 2} more pins
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinterestBoardTest;