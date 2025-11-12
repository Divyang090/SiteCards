import React, { useState, useEffect } from 'react';
import SiteMapUploadModal from './SiteMapUploadModal';
import AddVendorModal from '../AddingModal/AddVendorModal';
import AddInspirationModal from '../AddingModal/AddInspirationModal';
import AddDrawingModal from '../AddingModal/AddDrawingModal';
import AddTaskModal from '../AddingModal/AddTaskModal';
import SiteMapCard from './SiteMapCard';
import EmptySiteMapsState from './EmptySiteMapsState';
import DrawingCard from './DrawingCard';
import { use } from 'react';
import { BASE_URL } from '../Configuration/Config';
import StatusMessageProvider, { useStatusMessage } from '../Alerts/StatusMessage';
import EditDrawingModal from '../EditModal/EditDrawingModal';
import EditInspirationModal from '../EditModal/EditInspirationModal';
import EditTaskModal from '../EditModal/EditTaskModal';
import EditVendorModal from '../EditModal/EditVendorModal';
import DrawingClickModal from './DrawingClickModal';


const SiteMapsSection = ({ projectId, siteMaps = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [siteMapsList, setSiteMapsList] = useState(siteMaps);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSiteMap, setSelectedSiteMap] = useState(null);
  const [activeTab, setActiveTab] = useState('Drawings');
  const [isEditingSiteMap, setIsEditingSiteMap] = useState();

  const { showConfirmation, showMessage, showFailed } = useStatusMessage();


  const tabs = ['Drawings', 'Vendors', 'Inspiration', 'Tasks'];

  // SiteMaps Fetch API
  useEffect(() => {
    const fetchSiteMaps = async () => {
      try {
        console.log('Fetching ALL site maps');
        // Get ALL site maps without project_id filter
        const response = await fetch(`${BASE_URL}/spaces/get/spaces`);
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
      const response = await fetch(`${BASE_URL}/spaces/post`, {
        method: 'POST',
        body: uploadData,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const newSiteMap = await response.json();
        console.log('Upload successful, new site map:', newSiteMap);
        setSiteMapsList(prev => [newSiteMap, ...prev]);
        setIsUploadModalOpen(false);
        showMessage('Site map uploaded successfully!', 'success');

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
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSiteMap = async (siteMap) => {

    showConfirmation(
      'Delete Site Map',
      'Are you sure you want to delete site map? This action cannot be undone.',
      async () => {
        try {
          const spaceId = siteMap.space_id || siteMap.id;
          console.log('Attempting to delete site map. Space ID:', spaceId);

          const response = await fetch(`${BASE_URL}/spaces/delete/${spaceId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }
          );

          console.log('Delete response status:', response.status);

          if (response.ok) {
            console.log('Delete successful');
            setSiteMapsList(prev => prev.filter(sm => sm.space_id !== spaceId));
            showMessage('Site map deleted successfully!', 'success');
          } else {
            const errorText = await response.text();
            let errorMessage = `Delete failed: ${response.status}`;

            try {
              const errorData = JSON.parse(errorText);
              errorMessage += ` - ${JSON.stringify(errorData)}`;
              console.error('Delete error details:', errorData);
            } catch {
              errorMessage += ` - ${errorText}`;
              console.error('Delete error text:', errorText);
            }

            throw new Error(errorMessage);
          }
        } catch (error) {
          console.error('Error deleting site map:', error);
          showFailed('Failed to delete site map: ' + error.message);
        }
      }
    );
  };

  const handleEditSiteMap = (siteMap) => {
    console.log('Edit site map:', siteMap);
    isEditingSiteMap('siteMap')
  };

  const handleCloseModal = () => {
    setSelectedSiteMap(null);
    setActiveTab('Drawings');
  };

  return (
    <div className="theme-bg-secondary rounded-lg md:p-6 p-2 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="md:text-2xl text-xl font-bold theme-text-primary">Site Maps</h2>
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
      {!selectedSiteMap ? (
        siteMapsList?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteMapsList.map((siteMap) => (
              <SiteMapCard
                key={siteMap.space_id || siteMap.id || `sitemap-${siteMap.name}`}
                siteMap={siteMap}
                onDelete={handleDeleteSiteMap}
                onEdit={handleEditSiteMap}
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
            projectId={projectId}
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
  const [editingDrawing, setEditingDrawing] = useState();
  const [editingVendor, setEditingVendor] = useState();
  const [editingInspiration, setEditingInspiration] = useState();
  const [editingTask, setEditingTask] = useState();
  const [selectedDrawing, setSelectedDrawing] = useState(null);

  const { showConfirmation, showMessage, showFailed } = useStatusMessage();

  // All Handlers


  // Click Drawing
  const handleDrawingClick = (file) => {
    setSelectedDrawing(file);
  };
  //Close Drawing Click Modal
  const handleCloseDrawingClickModal = () => {
    setSelectedDrawing(null);
  }
  // Task handlers
  const handleEditTask = (task) => {
    console.log('Edit task:', task);
    setEditingTask(task);
  };

  const handleDeleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const taskName = task?.task_name || task?.task_title || task?.title || task?.name || 'this task';

    showConfirmation(
      'Delete Task',
      `Are you sure you want to delete "${taskName}"? This action cannot be undone.`,
      async () => {
        try {
          const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            showMessage(`Task "${taskName}" deleted successfully!`, 'success');
          } else {
            const errorText = await response.text();
            throw new Error(`Failed to delete task: ${errorText}`);
          }
        } catch (error) {
          console.error('Error deleting task:', error);
          showMessage('Failed to delete task: ' + error.message, 'error');
        }
      }
    );
  };

  // Drawing handlers
  const handleEditDrawing = (drawing) => {
    console.log('Edit drawing:', drawing);
    setEditingDrawing(drawing);
  };
  //Delete Drawing
  const handleDeleteDrawing = async (drawingId) => {
    try {
      const response = await fetch(`${BASE_URL}/drawings/${drawingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDrawings(prev => prev.filter(d => d.drawing_id !== drawingId)); // Use drawing_id here
        showMessage('Drawing deleted successfully!', 'success');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to delete drawing: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting drawing:', error);
      showFailed('Failed to delete drawing: ' + error.message);
    }
  };

  // Vendor handlers
  const handleEditVendor = (vendor) => {
    console.log('Edit vendor:', vendor);
    setEditingVendor(vendor)
  };
  //Delete Vendor
  const handleDeleteVendor = async (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    // console.log('Vendor object:', vendor);
    // console.log('Vendor properties:', Object.keys(vendor || {}));
    const vendorname = vendor?.vendor_name || vendor?.vendorname || vendor?.company_name || vendor?.name || 'Fallback';
    // console.log('selected vendor name', vendorname)
    showConfirmation(
      'Delete Vendor',
      `Are you sure you want to delete "${vendorname}"? This action cannot be undone`,
      async () => {
        try {
          const response = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            setVendors(prev => prev.filter(v => v.id !== vendorId));
            showMessage('Vendor deleted successfully!', 'success');
          } else {
            const errorText = await response.text();
            throw new Error(`Failed to delete vendor: ${errorText}`);
          }
        } catch (error) {
          console.error('Error deleting vendor:', error);
          showFailed('Failed to delete vendor: ' + error.message);
        }
      }
    );
  };

  // Inspiration handlers
  const handleEditInspiration = (inspiration) => {
    console.log('Edit inspiration:', inspiration);
    setEditingInspiration(inspiration)
  };
  //deleteinspiration
  const handleDeleteInspiration = async (inspirationId, inspiration) => {
    console.log('Inspiration object:', inspiration);
    console.log('Available properties:', Object.keys(inspiration || {}));
    const inspirationName = inspiration?.title || inspiration?.name || inspiration?.filename || 'this inspiration';

    showConfirmation(
      'Delete Inspiration',
      `Are you sure you want to delete "${inspirationName}"? This action cannot be undone`,
      async () => {
        try {
          const response = await fetch(`${BASE_URL}/inspiration/${inspirationId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setInspiration(prev => prev.filter(item => item.id !== inspirationId));
            showMessage(`Inspiration "${inspirationName}" deleted successfully!`, 'success');
          } else {
            const errorText = await response.text();
            throw new Error(`Failed to delete inspiration: ${errorText}`);
          }
        } catch (error) {
          console.error('Error deleting inspiration:', error);
          showFailed('Failed to delete inspiration: ' + error.message);
        }
      }
    );
  };

  const spaceId = siteMap.space_id || siteMap.id;

  // Fetch vendors data
  useEffect(() => {
    const fetchVendors = async () => {
      if (activeTab === 'Vendors') {
        setLoading(prev => ({ ...prev, vendors: true }));
        try {
          console.log('🔄 FETCHING ALL VENDORS');

          const response = await fetch(`${BASE_URL}/vendors/vendors`);
          console.log('📡 Vendors API response status:', response.status);

          if (response && response.ok) {
            const responseData = await response.json();
            console.log('📦 RAW vendors response from backend:', responseData);

            // Handle different response formats
            let allVendors = [];

            if (Array.isArray(responseData)) {
              allVendors = responseData;
            } else if (responseData && Array.isArray(responseData.data)) {
              allVendors = responseData.data;
            } else if (responseData && Array.isArray(responseData.vendors)) {
              allVendors = responseData.vendors;
            } else if (responseData && typeof responseData === 'object') {
              allVendors = Object.values(responseData);
            } else {
              console.log('❌ Unknown response format:', responseData);
              allVendors = [];
            }

            console.log('📋 All vendors to display:', allVendors);

            const mappedVendors = allVendors.map(vendor => ({
              id: vendor.vendor_id || vendor.id,
              name: vendor.company_name || 'Unnamed Vendor',
              category: vendor.trade || 'General',
              contact: vendor.vendor_email || 'No contact',
              phone: vendor.contact_number || 'No phone',
              space_id: vendor.space_id
            }));

            console.log('🎯 Final vendors to display:', mappedVendors);
            setVendors(mappedVendors);
          } else {
            console.error('❌ Vendors API failed with status:', response.status);
            setVendors([]);
          }
        } catch (error) {
          console.error('❌ Error fetching vendors:', error);
          setVendors([]);
        } finally {
          setLoading(prev => ({ ...prev, vendors: false }));
        }
      }
    };

    fetchVendors();
  }, [activeTab, spaceId]);

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
            response = await fetch(`${BASE_URL}/tasks/tasks?project_id=${siteMap.id || siteMap.space_id}`);
          } else if (projectId) {
            response = await fetch(`${BASE_URL}/tasks?space_id=${projectId}`);
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

    fetchTasks();
  }, [activeTab, siteMap.id, siteMap.space_id, siteMap.project_id]);

  // Fetch drawing
  useEffect(() => {
    const fetchDrawings = async () => {
      if (activeTab === 'Drawings' && spaceId) {
        setLoading(prev => ({ ...prev, drawings: true }));
        try {
          console.log('Fetching drawings for space:', spaceId);
          const response = await fetch(`${BASE_URL}/drawings/get?space_id=${spaceId}`);

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
          const response = await fetch(`${BASE_URL}/inspiration/get?space_id=${spaceId}`);

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
        const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
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
      const response = await fetch(`${BASE_URL}/vendors/vendors/${vendorId}`, {
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
    <div className="theme-bg-secondary text-sm md:text-l rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h2 className="text-md md:text-2xl font-bold theme-text-primary">
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
        <div className="flex space-x-8 overflow-x-auto whitespace-nowrap scrollbar-hidden">
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
          <div className="h-[600px] overflow-y-auto whitespace-nowrap scrollbar-hidden"> {/* Adjust height as needed */}
            {loading.drawings ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading drawings...</p>
              </div>
            ) : drawings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-4"> {/* Added padding for scrollbar */}
                {drawings.map((file) => (
                  <DrawingCard
                    key={file.drawing_id || file.id}
                    drawings={drawings}
                    file={file}
                    onEdit={handleEditDrawing}
                    onDelete={handleDeleteDrawing}
                    onClick={handleDrawingClick}
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

        {/* Drawing Click */}
        {selectedDrawing && (
          <DrawingClickModal
            drawing={selectedDrawing}
            onClose={handleCloseDrawingClickModal}
          />
        )}

        {/* Vendors Tab*/}
        {activeTab === 'Vendors' && (
          <div className='h-[600px] overflow-y-auto whitespace-nowrap scrollbar-hidden'>
            {loading.vendors ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading vendors...</p>
              </div>
            ) : vendors.length > 0 ? (
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="border theme-bg-primary rounded-lg p-4 hover:shadow-md transition-shadow duration-200 group overflow-x-auto whitespace-nowrap scrollbar-hidden">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold theme-text-primary text-lg mb-1">{vendor.name}</h3>
                        <p className="text-sm theme-text-secondary mb-1">{vendor.category}</p>
                        <div className='flex gap-2 grid-cols-2 justify-start'>
                          <p className="text-sm theme-text-secondary mb-1">✉ {vendor.contact}</p>
                          {vendor.phone && (
                            <p className="text-sm theme-text-primary">☎{vendor.phone}</p>
                          )}
                        </div>
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
          <div className='h-[600px] overflow-y-auto whitespace-nowrap scrollbar-hidden'>
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
          <div className='h-[600px] overflow-y-auto whitespace-nowrap scrollbar-hidden'>
            {loading.tasks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading tasks...</p>
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-3">
                {sortedTask.map((task) => (
                  <div key={task.id} className={` overflow-x-auto whitespace-nowrap scrollbar-hidden border rounded-lg p-4 hover:shadow-md transition-all duration-200 flex items-start gap-3 group ${task.status === 'completed' ? 'theme-bg-secondary opacity-50' : ''
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

      {/* Editing Section */}
      {/* Edit Drawing */}
      {editingDrawing && (
        <EditDrawingModal
          drawing={editingDrawing}
          spaceId={siteMap?.space_id || siteMap?.id}
          projectId={siteMap?.project_id}
          onClose={() => setEditingDrawing(null)}
          onUpdate={(updatedDrawing) => {
            setDrawings(prev => prev.map(d =>
              d.drawing_id === updatedDrawing.drawing_id ? updatedDrawing : d
            ));
            setEditingDrawing(null);
          }}
        />
      )}

      {/* Edit Vendors */}
      {editingVendor && (
        <EditVendorModal
          vendor={editingVendor}
          spaceId={siteMap?.space_id || siteMap?.id}
          projectId={siteMap?.project_id}
          onClose={() => setEditingVendor(null)}
          onUpdate={(updatedVendor) => {
            setVendors(prev => prev.map(v =>
              v.vendor_id === updatedVendor.vendor_id ? updatedVendor : v
            ));
            setEditingVendor(null)
          }}
        />
      )}
      {/*Edit Inspirations*/}
      {editingInspiration && (
        <EditInspirationModal
          inspiration={editingInspiration}
          spaceId={siteMap?.space_id || space.id}
          projectId={siteMap?.project_id}
          onClose={() => setEditingInspiration(null)}
          onUpdate={(updatedInspiration) => {
            setInspiration(prev => prev.map(i =>
              i.inspiration_id === updatedInspiration.inspiration_id ? updatedInspiration : i
            ));
            setEditingInspiration(null)
          }}
        />
      )}

      {/* edit tasks in space */}
      {/* Edit Tasks */}
      {editingTask && (
        <editingtaskModal
          task={editingTask}
          spaceId={siteMap?.space_id || spaace.id}
          projectId={siteMap?.project_id}
          onClose={() => setEditingTask(null)}
          onUpdate={(updatedTask) => {
            setTasks(prev => prev.map(t => t.task_id === updatedTask.task_id ? updatedTask : t));
            setEditingTask(null)
          }}
          setEditingTask
        />
      )}
    </div>
  );
};

export default SiteMapsSection;