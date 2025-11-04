import React, { useState, useEffect } from 'react';
import SiteMapUploadModal from './SiteMapUploadModal';
import AddVendorModal from './AddVendorModal';
import AddInspirationModal from './AddInspirationModal';
import AddDrawingModal from './AddDrawingModal';
import AddTaskModal from './AddTaskModal';
import EditableVendorField from './EditablevendorField';
import SiteMapCard from './SiteMapCard';
import EmptySiteMapsState from './EmptySiteMapsState';
import DrawingCard from './DrawingCard';
import { use } from 'react';

const SiteMapsSection = ({ projectId, siteMaps = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [siteMapsList, setSiteMapsList] = useState(siteMaps);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSiteMap, setSelectedSiteMap] = useState(null);
  const [activeTab, setActiveTab] = useState('Drawings');

  const tabs = ['Drawings', 'Vendors', 'Inspiration', 'Tasks'];

  // SiteMaps Fetch API
  useEffect(() => {
    const fetchSiteMaps = async () => {
      try {
        console.log('Fetching ALL site maps');
        // Get ALL site maps without project_id filter
        const response = await fetch(`http://192.168.1.22:8087/api/spaces/get/spaces`);
        console.log('Fetch response status:', response.status);

        if (response.ok) {
          const allSiteMaps = await response.json();
          console.log('Fetched ALL site maps data:', allSiteMaps);

          //filtering based on projectId
          const filteredSiteMaps = allSiteMaps.filter(siteMap => {
            const siteMapProjectId = siteMap.project_id || siteMap.projectId;
            return siteMapProjectId?.toString() === projectId;
          });

          console.log('Filtered site maps for project:', projectId, filteredSiteMaps);
          setSiteMapsList(filteredSiteMaps);
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
      uploadData.append('files', formData.file);

      if (formData.description) {
        uploadData.append('description', formData.description);
      }

      console.log('FormData entries:');
      for (let [key, value] of uploadData.entries()) {
        console.log(`${key}:`, value);
      }
      // add site maps
      console.log('Sending POST request to upload endpoint');
      const response = await fetch('http://192.168.1.22:8087/api/spaces/post', {
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

  const handleDeleteSiteMap = async (siteMap) => {
    if (!window.confirm('Are you sure you want to delete this site map?'

    )) return;

    try {
      const spaceId = siteMap.space_id || siteMap.id;
      console.log('Attempting to delete site map. Space ID:', spaceId);

      const response = await fetch(`http://192.168.1.22:8087/api/spaces/delete/${spaceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        console.log('Delete successful');
        setSiteMapsList(prev => prev.filter(sm => sm.space_id !== spaceId));
        alert('Site map deleted successfully!');
      } else {
        // Read the response only once
        const errorText = await response.text();
        let errorMessage = `Delete failed: ${response.status}`;

        try {
          // Try to parse as JSON if it's JSON
          const errorData = JSON.parse(errorText);
          errorMessage += ` - ${JSON.stringify(errorData)}`;
          console.error('Delete error details:', errorData);
        } catch {
          // If not JSON, use the text directly
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
            {selectedSiteMap ? 'Site Map Details' : `${siteMapsList?.length || 0} site maps`}</p>        </div>

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
      {/* delete here */}
      {!selectedSiteMap ? (
        siteMapsList?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteMapsList.map((siteMap) => (
              <SiteMapCard
                key={siteMap.space_id || siteMap.id || `sitemap-${siteMap.name}`}
                siteMap={siteMap}
                onDelete={handleDeleteSiteMap}
                onClick={handleSiteMapClick}
              />
            ))}
          </div>
        ) : (
          <EmptySiteMapsState onUpload={() => setIsUploadModalOpen(true)} />
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

const SiteMapDetailSection = ({ siteMap, onClose, tabs, activeTab, onTabChange }) => {
  console.log('siteMapDetailSection rendering with', { siteMap, activeTab });
  const [drawings, setDrawings] = useState([]);
  // State for vendors and tasks from API
  const [vendors, setVendors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState({ vendors: false, tasks: false, drawings: false, inspiration: false });
  const [isAddDrawingOpen, setIsAddDrawingOpen] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isAddInspirationOpen, setIsAddInspirationOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [refreshDrawings, setRefreshDrawings] = useState(0);
  const [inspiration, setInspiration] = useState([]);
  const [refreshInspiration, setRefreshInspiration] = useState(0);

  // All Handlers
  // Task handlers
const handleEditTask = (task) => {
  console.log('Edit task:', task);
  alert(`Edit task: ${task.title}\nWe'll implement the edit modal soon!`);
};

const handleDeleteTask = async (taskId) => {
  if (!window.confirm('Are you sure you want to delete this task?')) return;

  try {
    const response = await fetch(`http://192.168.1.22:8087/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      alert('Task deleted successfully!');
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to delete task: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('Failed to delete task: ' + error.message);
  }
};

// Drawing handlers
const handleEditDrawing = (drawing) => {
  console.log('Edit drawing:', drawing);
  alert(`Edit drawing: ${drawing.name}\nWe'll implement the edit modal soon!`);
};

const handleDeleteDrawing = async (drawingId) => {
  if (!window.confirm('Are you sure you want to delete this drawing?')) return;

  try {
    const response = await fetch(`http://192.168.1.22:8087/api/drawings/${drawingId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setDrawings(prev => prev.filter(d => d.id !== drawingId));
      alert('Drawing deleted successfully!');
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to delete drawing: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting drawing:', error);
    alert('Failed to delete drawing: ' + error.message);
  }
};

// Vendor handlers
const handleEditVendor = (vendor) => {
  console.log('Edit vendor:', vendor);
  alert(`Edit vendor: ${vendor.name}\nWe'll implement the edit modal soon!`);
};

const handleDeleteVendor = async (vendorId) => {
  if (!window.confirm('Are you sure you want to delete this vendor?')) return;

  try {
    const response = await fetch(`http://192.168.1.22:8087/api/vendors/${vendorId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setVendors(prev => prev.filter(v => v.id !== vendorId));
      alert('Vendor deleted successfully!');
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to delete vendor: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting vendor:', error);
    alert('Failed to delete vendor: ' + error.message);
  }
};

// Inspiration handlers
const handleEditInspiration = (inspiration) => {
  console.log('Edit inspiration:', inspiration);
  alert(`Edit inspiration: ${inspiration.name}\nWe'll implement the edit modal soon!`);
};

const handleDeleteInspiration = async (inspirationId) => {
  if (!window.confirm('Are you sure you want to delete this inspiration?')) return;

  try {
    const response = await fetch(`http://192.168.1.22:8087/api/inspiration/${inspirationId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setInspiration(prev => prev.filter(item => item.id !== inspirationId));
      alert('Inspiration deleted successfully!');
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to delete inspiration: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting inspiration:', error);
    alert('Failed to delete inspiration: ' + error.message);
  }
};

  const spaceId = siteMap.space_id || siteMap.id;

  // Fetch vendors data
  useEffect(() => {
    const fetchVendors = async () => {
      if (activeTab === 'Vendors') {
        setLoading(prev => ({ ...prev, vendors: true }));
        try {
          console.log('Fetching ALL vendors');

          const response = await fetch(`http://192.168.1.22:8087/api/vendors/vendors`);
          console.log('Vendors fetch response status:', response.status);

          if (response && response.ok) {
            const allVendors = await response.json();
            console.log('Fetched ALL vendors data:', allVendors);

            // Filter vendors by space_id on the frontend
            const spaceId = siteMap.id || siteMap.space_id;
            console.log('Filtering vendors for spaceId:', spaceId);

            let filteredVendors = [];

            if (Array.isArray(allVendors)) {
              filteredVendors = allVendors.filter(vendor => {
                // Check different possible space_id properties in vendor object
                const vendorSpaceId = vendor.space_id || vendor.spaceId;
                console.log(`Vendor ${vendor.id}: vendorSpaceId = ${vendorSpaceId}, target spaceId = ${spaceId}`);
                return vendorSpaceId?.toString() === spaceId?.toString();
              });
            } else if (allVendors && Array.isArray(allVendors.data)) {
              filteredVendors = allVendors.data.filter(vendor => {
                const vendorSpaceId = vendor.space_id || vendor.spaceId;
                return vendorSpaceId?.toString() === spaceId?.toString();
              });
            } else if (allVendors && Array.isArray(allVendors.vendors)) {
              filteredVendors = allVendors.vendors.filter(vendor => {
                const vendorSpaceId = vendor.space_id || vendor.spaceId;
                return vendorSpaceId?.toString() === spaceId?.toString();
              });
            }

            console.log('Filtered vendors for this space:', filteredVendors);

            // Map the filtered vendors to the required format
            const mappedVendors = filteredVendors.map(vendor => ({
              id: vendor.vendor_id || vendor.id,
              name: vendor.company_name || vendor.name || 'Unnamed Vendor',
              category: vendor.vendor_category || vendor.category || 'General',
              contact: vendor.vendor_email || 'No contact',
              phone: vendor.contact_number || 'No phone',
              space_id: vendor.space_id
            }));

            setVendors(mappedVendors);
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
  }, [activeTab, siteMap.id, siteMap.space_id]);

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
            response = await fetch(`http://192.168.1.22:8087/api/tasks/tasks?project_id=${siteMap.id || siteMap.space_id}`);
          } else if (projectId) {
            response = await fetch(`http://192.168.1.22:8087/api/tasks?space_id=${projectId}`);
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

  //Drawings fetch API
  useEffect(() => {
    const fetchDrawings = async () => {
      if (activeTab === 'Drawings' && spaceId) {
        setLoading(prev => ({ ...prev, drawings: true }));
        try {
          console.log('Fetching drawings for space:', spaceId);
          const response = await fetch(`http://192.168.1.22:8087/api/drawings/get?space_id=${spaceId}`);

          console.log('Drawings fetch response status:', response.status);

          if (response.ok) {
            const drawingsData = await response.json();
            console.log('Fetched drawings data:', drawingsData);

            // Handle different response formats
            if (Array.isArray(drawingsData)) {
              setDrawings(drawingsData);
            } else if (drawingsData && Array.isArray(drawingsData.data)) {
              setDrawings(drawingsData.data);
            } else if (drawingsData && Array.isArray(drawingsData.drawings)) {
              setDrawings(drawingsData.drawings);
            } else {
              console.log('Unexpected drawings response format:', drawingsData);
              setDrawings([]);
            }
          } else {
            console.log('Drawings fetch failed with status:', response.status);
            setDrawings([]);
          }
        } catch (error) {
          console.error('Error fetching drawings:', error);
          setDrawings([]);
        } finally {
          setLoading(prev => ({ ...prev, drawings: false }));
        }
      }
    };
    if (activeTab === 'Drawings') {
      fetchDrawings();
    }

  }, [activeTab, spaceId, refreshDrawings]);

  // Inspiration fetch API
  useEffect(() => {
    const fetchInspiration = async () => {
      console.log('=== INSPIRATION FETCH TRIGGERED ===', {
        activeTab,
        spaceId,
        shouldFetch: activeTab === 'Inspiration' && spaceId
      });
      if (activeTab === 'Inspiration' && spaceId) {
        setLoading(prev => ({ ...prev, inspiration: true }));
        try {
          console.log('Fetching inspiration for space:', spaceId);
          const response = await fetch(`http://192.168.1.22:8087/api/inspiration/get?space_id=${spaceId}`);

          console.log('Inspiration fetch response status:', response.status);

          if (response.ok) {
            const inspirationData = await response.json();
            console.log('Fetched inspiration data:', inspirationData);

            let inspirationArray = [];
            if (Array.isArray(inspirationData)) {
              inspirationArray = inspirationData;
            } else if (inspirationData && Array.isArray(inspirationData.data)) {
              inspirationArray = inspirationData.data;
            } else if (inspirationData && Array.isArray(inspirationData.inspiration)) {
              inspirationArray = inspirationData.inspiration;
            } else {
              console.log('Unexpected inspiration response format:', inspirationData);
              inspirationArray = [];
            }

            setInspiration(inspirationArray);
          } else {
            console.log('Inspiration fetch failed with status:', response.status);
            setInspiration([]);
          }
        } catch (error) {
          console.error('Error fetching inspiration:', error);
          setInspiration([]);
        } finally {
          setLoading(prev => ({ ...prev, inspiration: false }));
        }
      }
    };

    if (activeTab === 'Inspiration') {
      fetchInspiration();
    }
  }, [activeTab, spaceId, refreshInspiration]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Toggle task completion
const handleToggleTask = async (taskId) => {
  console.log('Toggle task clicked for ID:', taskId);

  try {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    // Update local state immediately
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    // Try API call with CORS handling
    try {
      const response = await fetch(`http://192.168.1.22:8087/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        console.log('Task status updated successfully in API');
      } else {
        console.error('API update failed with status:', response.status);
      }
    } catch (apiError) {
      console.log('API call failed due to CORS, but UI updated:', apiError);
    }
  } catch (error) {
    console.error('Error updating task:', error);
  }
};
  //1/11 Vendor Edit
  // Update Vendor Function
  const handleUpdateVendor = async (vendorId, updates) => {
    try {
      const response = await fetch(`http://192.168.1.22:8087/api/vendors/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        // Update local state
        setVendors(prev => prev.map(vendor =>
          vendor.id === vendorId ? { ...vendor, ...updates } : vendor
        ));
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
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
          Add {activeTab.slice()}
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {/* Drawings Tab*/}
        {activeTab === 'Drawings' && (
          <div>
            {loading.drawings ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading drawings...</p>
              </div>
            ) : drawings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drawings.map((file) => (
                  <DrawingCard
                    key={file.drawing_id || file.id}
                    file={file}
                  // Check it
                  // onEdit={handleEditDrawing}
                  // onDelete={handleDeleteDrawing}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-400 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium theme-text-secondary mb-2">No drawings yet</h3>
                <p className="text-gray-500 text-sm">Add your first drawing to get started</p>
              </div>
            )}
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
                  <div key={vendor.id} className="border theme-bg-primary rounded-lg p-4 hover:shadow-md transition-shadow duration-200 group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold theme-text-primary text-lg mb-1">{vendor.name}</h3>
                        <p className="text-sm theme-text-secondary mb-1">Category: {vendor.category}</p>
                        <p className="text-sm theme-text-secondary mb-1">Contact: {vendor.contact}</p>
                        {vendor.phone && (
                          <p className="text-sm theme-text-primary">Phone: {vendor.phone}</p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEditVendor(vendor)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors duration-200"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendor.id)}
                          className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors duration-200"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
            {console.log('=== INSPIRATION TAB DEBUG ===', {
              activeTab,
              loading: loading.inspiration,
              inspirationData: inspiration,
              inspirationCount: inspiration.length,
              spaceId: spaceId,
              hasHandleEdit: !!handleEditInspiration,
              hasHandleDelete: !!handleDeleteInspiration
            })}
            {loading.inspiration ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading inspiration...</p>
              </div>
            ) : inspiration.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inspiration.map((item) => (
                  <div key={item.inspiration_id || item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <img
                        src={item.file_url || item.url || item.image_url}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => window.open(item.file_url || item.url, '_blank')}
                      />
                      {/* Hover Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditInspiration(item);
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
                            handleDeleteInspiration(item.inspiration_id || item.id);
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
                    <div className="p-4">
                      <h3 className="font-semibold theme-text-primary text-lg mb-2">
                        {item.title || item.name || 'Untitled Inspiration'}
                      </h3>
                      {item.description && (
                        <p className="text-sm theme-text-secondary mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{formatDate(item.created_at || item.upload_date)}</span>
                        <button
                          onClick={() => window.open(item.file_url || item.url, '_blank')}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Full Size
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-400 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium theme-text-secondary mb-2">No inspiration yet</h3>
                <p className="text-gray-500 text-sm">Add your first inspiration image to get started</p>
              </div>
            )}
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
                  <div key={task.id} className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 flex items-start gap-3 group ${task.status === 'completed' ? 'theme-bg-secondary opacity-50' : ''
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

                    {/* Hover-only action buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors duration-200"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors duration-200"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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

      {/* Add Drawing Modal */}
      {isAddDrawingOpen && (
        <AddDrawingModal
          spaceId={siteMap.id || siteMap.space_id}
          projectId={siteMap.project_id}
          onClose={() => setIsAddDrawingOpen(false)}
          onAdd={() => {
            setIsAddDrawingOpen(false);
            setRefreshDrawings(prev => prev + 1);
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
            setInspiration(prev => [...prev, newInspiration]);
            setRefreshInspiration(prev => prev + 1);
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

export default SiteMapsSection;