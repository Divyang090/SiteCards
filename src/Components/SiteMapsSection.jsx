import React, { useState, useEffect } from 'react';
import SiteMapUploadModal from './SiteMapUploadModal';

const SiteMapsSection = ({ projectId, siteMaps = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [siteMapsList, setSiteMapsList] = useState(siteMaps);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSiteMap, setSelectedSiteMap] = useState(null);
  const [activeTab, setActiveTab] = useState('Drawings');

  const tabs = ['Drawings', 'Vendors', 'Inspiration', 'Tasks'];

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

  const handleSiteMapClick = (siteMap) => {
    setSelectedSiteMap(siteMap);
    setActiveTab('Drawings');
  };

  const handleCloseDetail = () => {
    setSelectedSiteMap(null);
    setActiveTab('Drawings');
  };


  const handleSiteMapSubmit = async (formData) => {
    setIsUploading(true);
    try {
      console.log('Starting upload with form data:', formData);

      const uploadData = new FormData();
      uploadData.append('space_name', formData.name || formData.space_name || 'Untitled Space');
      uploadData.append('category', formData.category || 'general');
      uploadData.append('project_id', projectId);
      uploadData.append('file', formData.file);

      if (formData.description) {
        uploadData.append('description', formData.description);
      }

      console.log('FormData entries:');
      for (let [key, value] of uploadData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log('Sending POST request to upload endpoint');
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
        let errorMessage = `Upload failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
          console.error('Upload error details:', errorData);
        } catch (e) {
          const errorText = await response.text();
          errorMessage += ` - ${errorText}`;
          console.error('Upload error text:', errorText);
        }
        throw new Error(errorMessage);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: projectId })
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        console.log('Delete successful');
        setSiteMapsList(prev => prev.filter(sm => sm.id !== siteMapId));
        alert('Site map deleted successfully!');
      } else {
        let errorMessage = `Delete failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
          console.error('Delete error details:', errorData);
        } catch (e) {
          const errorText = await response.text();
          errorMessage += ` - ${errorText}`;
          console.error('Delete error text:', errorText);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting site map:', error);
      alert('Failed to delete site map: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setSelectedSiteMap(null);
    setActiveTab('Drawings');
  };

  return (
    <div className="theme-bg-secondary rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">Site Maps</h2>
          <p className='theme-text-secondary mt-1'>
            {selectedSiteMap ? 'Site Map Details' : `${siteMapsList.length} site maps`}</p>        </div>

        {!selectedSiteMap && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Site Map
          </button>)}
      </div>

      {/* Site Maps Grid */}
      {!selectedSiteMap ? (
        siteMapsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteMapsList.map((siteMap) => (
              <SiteMapCard
                key={siteMap.id || siteMap.space_id || `sitemap-${siteMap.name}`}
                siteMap={siteMap}
                onDelete={handleDeleteSiteMap}
                onClick={handleSiteMapClick} />
            ))}
          </div>
        ) : (
          <EmptySiteMapsState />
        )
      ) : (
        // Show detail view
        <div className="theme-bg-card rounded-lg border theme-border p-6">
          <SiteMapDetailSection
            siteMap={selectedSiteMap}
            onClose={handleCloseDetail}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
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
        <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${siteMap.file_type?.includes('image') ? 'hidden' : 'flex'}`}>
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
            onClick={(e) => {
              e.stopPropagation();
              onDelete(siteMap.id);
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
const SiteMapDetailSection = ({ siteMap, onClose, tabs, activeTab, onTabChange }) => {
  console.log('siteMapDetailSection rendering with',{ siteMap, activeTab });
  const [drawings, setDrawings] = useState([
    { id: 1, name: 'Floor Plan 1', type: 'image', url: siteMap.file_url, date: '2024-01-15', size: '2.4 MB' },
    { id: 2, name: 'Electrical Layout', type: 'pdf', url: '/sample.pdf', date: '2024-01-10', size: '1.8 MB' },
    { id: 3, name: 'Plumbing Diagram', type: 'image', url: '/sample2.jpg', date: '2024-01-08', size: '3.2 MB' },
  ]);
  // State for vendors and tasks from API
  const [vendors, setVendors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState({ vendors: false, tasks: false });
  const [isAddDrawingOpen, setIsAddDrawingOpen] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isAddInspirationOpen, setIsAddInspirationOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);



  // Fetch vendors data
  useEffect(() => {
    const fetchVendors = async () => {
      if (activeTab === 'Vendors') {
        setLoading(prev => ({ ...prev, vendors: true }));
        try {
          console.log('Fetching vendors for site map:', siteMap);

          // Try different possible ID properties
          const spaceId = siteMap.id || siteMap.space_id;
          const projectId = siteMap.project_id;

          console.log('Using spaceId:', spaceId, 'projectId:', projectId);

          let response;
          if (spaceId) {
            response = await fetch(`http://127.0.0.1:5000/api/vendors/vendors/?space_id=${spaceId}`);
          } else {
            throw new Error('No valid IDs found for API call');
          }

          if (response && response.ok) {
            const vendorsData = await response.json();
            console.log('Fetched vendors data:', vendorsData);

            // Handle different response formats
            if (Array.isArray(vendorsData)) {
              setVendors(vendorsData);
            } else if (vendorsData && Array.isArray(vendorsData.data)) {
              setVendors(vendorsData.data);
            } else if (vendorsData && Array.isArray(vendorsData.vendors)) {
              setVendors(vendorsData.vendors);
            } else {
              console.log('Unexpected vendors response format, using sample data');
              setVendors(getSampleVendors());
            }
          } else {
            console.log('Vendors API failed, using sample data');
            setVendors(getSampleVendors());
          }
        } catch (error) {
          console.error('Error fetching vendors:', error);
          setVendors(getSampleVendors());
        } finally {
          setLoading(prev => ({ ...prev, vendors: false }));
        }
      }
    };

    // Helper function for sample data
    const getSampleVendors = () => [
      { id: 1, name: 'Construction Co.', category: 'General Contractor', contact: 'john@example.com', phone: '+1-555-0101' },
      { id: 2, name: 'Electrical Works', category: 'Electrical', contact: 'mike@example.com', phone: '+1-555-0102' },
      { id: 3, name: 'Plumbing Pros', category: 'Plumbing', contact: 'sarah@example.com', phone: '+1-555-0103' },
    ];

    fetchVendors();
  }, [activeTab, siteMap.id, siteMap.space_id, siteMap.project_id]);

  // Fetch tasks data
  useEffect(() => {
    const fetchTasks = async () => {
      if (activeTab === 'Tasks') {
        setLoading(prev => ({ ...prev, tasks: true }));
        try {
          console.log('Fetching tasks for site map:', siteMap);

          // Try different possible ID properties
          const spaceId = siteMap.id || siteMap.space_id;
          const projectId = siteMap.project_id;

          console.log('Using spaceId:', spaceId, 'projectId:', projectId);

          let response;
          if (spaceId) {
            response = await fetch(`http://127.0.0.1:5000/api/tasks?space_id=${spaceId}`);
          } else if (projectId) {
            response = await fetch(`http://127.0.0.1:5000/api/tasks?space_id=${projectId}`);
          } else {
            throw new Error('No valid IDs found for API call');
          }

          if (response && response.ok) {
            const tasksData = await response.json();
            console.log('Fetched tasks data:', tasksData);

            // Handle different response formats
            let tasksArray = [];
            if (Array.isArray(tasksData)) {
              tasksArray = tasksData;
            } else if (tasksData && Array.isArray(tasksData.data)) {
              tasksArray = tasksData.data;
            } else if (tasksData && Array.isArray(tasksData.tasks)) {
              tasksArray = tasksData.tasks;
            }

            // Transform tasks to ensure they have required fields
            const transformedTasks = tasksArray.map(task => ({
              id: task.id || task.task_id,
              title: task.title || task.task_name || 'Untitled Task',
              description: task.description || '',
              status: task.status || 'pending',
              due_date: task.due_date || task.dueDate || task.created_at
            }));

            setTasks(transformedTasks);
          } else {
            console.log('Tasks API failed, using sample data');
            setTasks(getSampleTasks());
          }
        } catch (error) {
          console.error('Error fetching tasks:', error);
          setTasks(getSampleTasks());
        } finally {
          setLoading(prev => ({ ...prev, tasks: false }));
        }
      }
    };

    // Helper function for sample data
    const getSampleTasks = () => [
      { id: 1, title: 'Site Inspection', description: 'Initial site assessment and measurements', status: 'completed', due_date: '2024-01-20' },
      { id: 2, title: 'Material Order', description: 'Order construction materials from suppliers', status: 'pending', due_date: '2024-01-25' },
      { id: 3, title: 'Permit Application', description: 'Submit building permits to local authorities', status: 'pending', due_date: '2024-01-30' },
    ];

    fetchTasks();
  }, [activeTab, siteMap.id, siteMap.space_id, siteMap.project_id]);

  // Toggle task completion
  const handleToggleTask = async (taskId) => {
    console.log('Toggle task clicked for ID:', taskId);
    console.log('Current tasks:', tasks);

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }

      // Immediately update UI for better UX (optimistic update)
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      console.log('Updating task:', taskId, 'from', task.status, 'to', newStatus);

      // Update local state immediately
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );

      // Then make API call
      const response = await fetch(`http://127.0.0.1:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (response.ok) {
        console.log('Task status updated successfully in API');
      } else {
        console.error('API update failed, but UI was updated');
        // If API fails, we could revert here, but keeping optimistic update for better UX
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Keep the optimistic update for better UX
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    return '📎';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const sortedTask = [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return 0;
  });


  return (
    <div className="theme-bg-secondary rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">
            {siteMap.space_name || siteMap.name || siteMap.title || 'Untitled Site Map'}
          </h2>
          <p className="theme-text-secondary mt-1">{siteMap.category || 'Uncategorized'}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Add Button for each tab */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => {
            if (activeTab === 'Drawings') setIsAddDrawingOpen(true);
            if (activeTab === 'Vendors') setIsAddVendorOpen(true);
            if (activeTab === 'Inspiration') setIsAddInspirationOpen(true);
            if (activeTab === 'Tasks') setIsAddTaskOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {/* Drawings Tab*/}
        {activeTab === 'Drawings' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drawings.map((file) => (
                <div key={file.id} className="theme-border-light rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                        <span className="text-4xl">{getFileIcon(file.type)}</span>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="p-4">
                    <h3 className="font-semibold theme-text-primary text-lg mb-1 truncate">
                      {file.name}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                      <span>{file.size}</span>
                      <span>{formatDate(file.date)}</span>
                    </div>
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="w-full theme-bg-primary hover:bg-gray-500 theme-text-primary px-3 py-2 rounded text-sm font-medium transition-colors duration-200"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vendors Tab - List format */}
        {activeTab === 'Vendors' && (
          <div>
            {loading.vendors ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading vendors...</p>
              </div>
            ) : vendors.length > 0 ? (
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="border theme-bg-primary rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold theme-text-primary text-lg mb-1">{vendor.name}</h3>
                        <p className="text-sm theme-text-secondary mb-1">Category: {vendor.category}</p>
                        <p className="text-sm theme-text-secondary mb-1">Contact: {vendor.contact}</p>
                        {vendor.phone && (
                          <p className="text-sm theme-text-primary">Phone: {vendor.phone}</p>
                        )}
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-400 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium theme-text-secondary mb-2">No vendors yet</h3>
                <p className="text-gray-500 text-sm">Add your first vendor to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Inspiration Tab*/}
        {activeTab === 'Inspiration' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 1, name: 'Modern Kitchen Design', type: 'image', url: '' },
                { id: 2, name: 'Living Room Inspiration', type: 'image', url: '' },
                { id: 3, name: 'Bathroom Layout', type: 'image', url: '' },
                { id: 4, name: 'Office Space', type: 'image', url: '' },
                { id: 6, name: 'Outdoor Area', type: 'image', url: '' },
              ].map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold theme-text-primary text-lg">{item.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Tasks Tab*/}
        {activeTab === 'Tasks' && (
          <div>
            {loading.tasks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading tasks...</p>
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-3">
                {sortedTask.map((task) => (
                  <div key={task.id} className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 flex items-start gap-3 ${task.status === 'completed' ? 'theme-bg-secondary opacity-50' : ''
                    }`}>
                    {/* Check button */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 mt-1 ${task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                        }`}
                    >
                      {task.status === 'completed' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1">
                      <h3 className={`font-semibold theme-text-primary text-lg mb-1 ${task.status === 'completed' ? 'line-through text-gray-500' : ''
                        }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                      )}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {task.status}
                        </span>
                        <span>Due: {formatDate(task.due_date)}</span>
                      </div>
                    </div>

                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-400 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No tasks yet</h3>
                <p className="text-gray-500 text-sm">Add your first task to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-6 border-t mt-6">
        <div className="text-sm text-gray-600">
          Uploaded on {new Date(siteMap.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Add Drawing Modal */}
      {isAddDrawingOpen && (
        <AddDrawingModal
          spaceId={siteMap.id || siteMap.space_id}
          projectId={siteMap.project_id}
          onClose={() => setIsAddDrawingOpen(false)}
          onAdd={(newDrawing) => {
            setDrawings(prev => [...prev, newDrawing]);
            setIsAddDrawingOpen(false);
          }}
        />
      )}

      {/* Add Vendor Modal */}
      {isAddVendorOpen && (
        <AddVendorModal
          spaceId={siteMap.id || siteMap.space_id}
          projectId={siteMap.project_id}
          onClose={() => setIsAddVendorOpen(false)}
          onAdd={(newVendor) => {
            setVendors(prev => [...prev, newVendor]);
            setIsAddVendorOpen(false);
          }}
        />
      )}

      {/* Add Inspiration Modal */}
      {isAddInspirationOpen && (
        <AddInspirationModal
          spaceId={siteMap.id || siteMap.space_id}
          projectId={siteMap.project_id}
          onClose={() => setIsAddInspirationOpen(false)}
          onAdd={(newInspiration) => {
            console.log('New inspiration added:', newInspiration);
            setIsAddInspirationOpen(false);
          }}
        />
      )}

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <AddTaskModal
          spaceId={siteMap.id || siteMap.space_id}
          projectId={siteMap.project_id}
          onClose={() => setIsAddTaskOpen(false)}
          onAdd={(newTask) => {
            setTasks(prev => [...prev, newTask]);
            setIsAddTaskOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Add Drawing Modal Component
const AddDrawingModal = ({ spaceId, projectId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    file: null,
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('name', formData.name);
      uploadData.append('space_id', spaceId);
      uploadData.append('project_id', projectId);
      uploadData.append('file', formData.file);
      if (formData.description) {
        uploadData.append('description', formData.description);
      }

      const response = await fetch('http://127.0.0.1:5000/api/drawings', {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        const newDrawing = await response.json();
        onAdd(newDrawing);
      } else {
        throw new Error('Failed to add drawing');
      }
    } catch (error) {
      console.error('Error adding drawing:', error);
      alert('Failed to add drawing');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add New Drawing</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <input
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png,.dwg"
                onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Add Drawing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Vendor Modal Component
const AddVendorModal = ({ spaceId, projectId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contact: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/vendors/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          space_id: spaceId,
          project_id: projectId
        }),
      });

      if (response.ok) {
        const newVendor = await response.json();
        onAdd(newVendor);
      } else {
        throw new Error('Failed to add vendor');
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
      alert('Failed to add vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add New Vendor</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Task Modal Component
const AddTaskModal = ({ spaceId, projectId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          space_id: spaceId,
          project_id: projectId,
          status: 'pending'
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        onAdd(newTask);
      } else {
        throw new Error('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Inspiration Modal Component
const AddInspirationModal = ({ spaceId, projectId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    file: null,
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('name', formData.name);
      uploadData.append('space_id', spaceId);
      uploadData.append('project_id', projectId);
      uploadData.append('file', formData.file);
      if (formData.description) {
        uploadData.append('description', formData.description);
      }

      const response = await fetch('http://127.0.0.1:5000/api/inspiration', {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        const newInspiration = await response.json();
        onAdd(newInspiration);
      } else {
        throw new Error('Failed to add inspiration');
      }
    } catch (error) {
      console.error('Error adding inspiration:', error);
      alert('Failed to add inspiration');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add New Inspiration</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspiration Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                type="file"
                required
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Add Inspiration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteMapsSection;