import React, { useState, useEffect } from 'react';
import SiteMapUploadModal from './SiteMapUploadModal';

const SiteMapsSection = ({ projectId, siteMaps = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [siteMapsList, setSiteMapsList] = useState(siteMaps);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fetch API
  useEffect(() => {
const fetchSiteMaps = async () => {
  try {
    console.log('Fetching site maps for project:', projectId);
    const response = await fetch(`http://127.0.0.1:5000/api/spaces/get/spaces?project_id=${projectId}`);
    console.log('Fetch response status:', response.status);
    
    if (response.ok) {
      const siteMapsData = await response.json();
      console.log('Fetched site maps data:', siteMapsData);
      setSiteMapsList(siteMapsData);
    } else {
      console.error('Fetch failed with status:', response.status);
      try {
        const errorData = await response.json();
        console.error('Fetch error details:', errorData);
      } catch (e) {
        const errorText = await response.text();
        console.error('Fetch error text:', errorText);
      }
    }
  } catch (error) {
    console.error('Network error fetching site maps:', error);
  }
};

    if (projectId) {
      fetchSiteMaps();
    }
  }, [projectId]);

  const handleSiteMapSubmit = async (formData) => {
    setIsUploading(true);
    try {
      console.log('Starting upload with form data:', formData);
      
      const uploadData = new FormData();
      uploadData.append('space_name', formData.name);
      uploadData.append('category', formData.category);
      uploadData.append('project_id', projectId);
      uploadData.append('files', formData.file);

      // Debug FormData contents
      console.log('FormData entries:');
      for (let [key, value] of uploadData.entries()) {
        console.log(`${key}:`, value);
      }

      // Upload API
      console.log(' Sending POST request to upload endpoint');
      const response = await fetch('http://127.0.0.1:5000/api/spaces/post', {
        method: 'POST',
        body: uploadData,
      });

      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        const newSiteMap = await response.json();
        console.log('Upload successful, new site map:', newSiteMap);
        setSiteMapsList(prev => [newSiteMap, ...prev]);
        setIsUploadModalOpen(false);
        alert('Site map uploaded successfully!');
      } else {
        const errorText = await response.text();
        console.error(' Upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload site map: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSiteMap = async (siteMapId) => {
    if (!window.confirm('Are you sure you want to delete this site map?')) return;

    try {
      console.log('Attempting to delete site map:', siteMapId);
      
      const response = await fetch(`http://127.0.0.1:5000/api/spaces/delete/${siteMapId}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        console.log('Delete successful');
        setSiteMapsList(prev => prev.filter(sm => sm.id !== siteMapId));
        alert('Site map deleted successfully!');
      } else {
        const errorText = await response.text();
        console.error('Delete failed:', errorText);
        throw new Error(`Delete failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting site map:', error);
      alert('Failed to delete site map: ' + error.message);
    }
  };

  return (
    <div className="theme-bg-secondary rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">Site Maps</h2>
          <p className="theme-text-secondary mt-1">{siteMapsList.length} site maps</p>
        </div>
        
        {/* Upload Site Map Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          disabled={isUploading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Site Map
        </button>
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-1">Debug Info:</h3>
        <p className="text-xs text-yellow-700">Project ID: {projectId}</p>
        <p className="text-xs text-yellow-700">Site Maps Count: {siteMapsList.length}</p>
        <p className="text-xs text-yellow-700">Check browser console for detailed logs</p>
      </div>

      {/* Site Maps Grid */}
      {siteMapsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {siteMapsList.map((siteMap) => (
            <SiteMapCard 
              key={siteMap.id} 
              siteMap={siteMap} 
              onDelete={handleDeleteSiteMap}
            />
          ))}
        </div>
      ) : (
        <EmptySiteMapsState />
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <SiteMapUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleSiteMapSubmit}
          isUploading={isUploading}
        />
      )}
    </div>
  );
};

// Site Map Card Component
const SiteMapCard = ({ siteMap, onDelete }) => {
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
    <div className="theme-bg-card rounded-lg theme-border overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
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
        <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${siteMap.file_type?.includes('image') ? 'hidden' : 'flex'}`}>
          <span className="text-4xl">{getFileIcon(siteMap.file_type)}</span>
        </div>
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button 
              onClick={() => window.open(siteMap.file_url, '_blank')}
              className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-200"
              title="View Site Map"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button 
              onClick={() => onDelete(siteMap.id)}
              className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-200"
              title="Delete Site Map"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold theme-text-primary text-lg mb-1 truncate">
          {siteMap.space_name || siteMap.name || siteMap.title || 'Untitled Site Map'}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs theme-text-secondary bg-blue-100 px-2 py-1 rounded">
            {siteMap.category || 'Uncategorized'}
          </span>
        </div>
        <p className="theme-text-secondary text-sm mb-2 line-clamp-2">
          {siteMap.description || 'No description'}
        </p>
        <div className="flex justify-between items-center text-xs theme-text-muted">
          <div className="flex flex-col">
            <span>{formatFileSize(siteMap.file_size)}</span>
            <span>Uploaded {formatDate(siteMap.created_at)}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.open(siteMap.file_url, '_blank')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View
            </button>
            <button 
              onClick={() => siteMap.file_url && window.open(siteMap.file_url, '_blank')}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptySiteMapsState = () => (
  <div className="text-center py-12 theme-bg-card rounded-lg border-2 border-dashed theme-border">
    <div className="theme-text-muted mb-3">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium theme-text-primary mb-2">No site maps yet</h3>
    <p className="theme-text-secondary text-sm mb-4">Upload site maps to visualize your project</p>
    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
      + Upload your first site map
    </button>
  </div>
);

export default SiteMapsSection;