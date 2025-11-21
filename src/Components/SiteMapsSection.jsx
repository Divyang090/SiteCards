import React, { useState, useEffect, useRef } from 'react';
import SiteMapUploadModal from '../AddingModal/SiteMapUploadModal';
import AddVendorModal from '../AddingModal/AddVendorModal';
import AddInspirationModal from '../AddingModal/AddInspirationModal';
import AddDrawingModal from '../AddingModal/AddDrawingModal';
import AddTaskModal from '../AddingModal/AddTaskModal';
import SiteMapCard from '../Cards/SiteMapCard';
import EmptySiteMapsState from './EmptySiteMapsState';
import DrawingCard from '../Cards/DrawingCard';
import { BASE_URL } from '../Configuration/Config';
import StatusMessageProvider, { useStatusMessage } from '../Alerts/StatusMessage';
import EditDrawingModal from '../EditModal/EditDrawingModal';
import EditInspirationModal from '../EditModal/EditInspirationModal';
import EditTaskModal from '../EditModal/EditTaskModal';
import EditVendorModal from '../EditModal/EditVendorModal';
import DrawingClickModal from './DrawingClickModal';
import InspirationCard from '../Cards/InspirationCard';
import VendorCard from '../Cards/VendorCard';
import SiteTaskCard from '../Cards/SiteTaskCard';
import InspirationClickModal from './InspirationClickModal';
import BulkPresetModal from '../AddingModal/BulkPresetModal';


const SiteMapsSection = ({ projectId, siteMaps = [] }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [siteMapsList, setSiteMapsList] = useState(siteMaps);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSiteMap, setSelectedSiteMap] = useState(null);
  const [activeTab, setActiveTab] = useState('Drawings');
  const [isEditingSiteMap, setIsEditingSiteMap] = useState();
  const [isBulkPresetModalOpen, setIsBulkPresetModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState();

  const menuRef = useRef(null);

  const { showConfirmation, showMessage, showFailed } = useStatusMessage();


  const tabs = ['Drawings', 'Vendors', 'Inspiration', 'Tasks'];

  // SiteMaps Fetch API
  useEffect(() => {
    const fetchSiteMaps = async () => {
      try {
        console.log('Fetching ALL site maps');
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

  // click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    setLoading(true);
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
      setLoading(false);
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

  // Bulk Preset 
  const handleSiteMapsCreated = (newSiteMaps) => {
    setSiteMapsList(prev => [...prev, ...newSiteMaps]);
  };

  return (
    <div className="theme-bg-secondary rounded-lg md:p-6 p-2 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="md:text-2xl text-xl font-semibold theme-text-primary">Site Maps</h2>
          <p className='theme-text-secondary mt-1'>
            {selectedSiteMap ? 'Site Map Details' : `${siteMapsList?.length || 0} site maps`}
          </p>
        </div>

        {!selectedSiteMap && (
          <div ref={menuRef} className="relative">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg theme-border theme-text-primary theme-bg-secondary border hover:opacity-80 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-12 mt-2 w-48 rounded-lg theme-border theme-bg-card border theme-shadow z-50">
                <div className="p-2">
                  {/* Bulk Preset Button */}
                  <button
                    onClick={() => {
                      setIsBulkPresetModalOpen(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-md text-left flex items-center gap-3 theme-text-primary hover:theme-bg-hover transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Bulk Preset
                  </button>

                  {/* Upload Site Map Button */}
                  <button
                    onClick={() => {
                      setIsUploadModalOpen(true);
                      setShowMenu(false);
                    }}
                    disabled={isUploading}
                    className="w-full px-3 py-2 rounded-md text-left flex items-center gap-3 theme-text-primary hover:theme-bg-hover transition-all duration-200 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Site Map
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Site Maps Grid */}
      {!selectedSiteMap ? (
        siteMapsList?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="theme-bg-card rounded-lg border theme-border p-3 md:p-6">
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

      {/* Bulk Preset Modal */}
      {isBulkPresetModalOpen && (
        <BulkPresetModal
          isOpen={isBulkPresetModalOpen}
          onClose={() => setIsBulkPresetModalOpen(false)}
          onSiteMapsCreated={handleSiteMapsCreated}
          projectId={projectId}
        />
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
  // console.log('siteMapDetailSection rendering with', { siteMap, activeTab });
  const [drawings, setDrawings] = useState([]);
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
  const [selectedInspiration, setSelectedInspiration] = useState(null);

  const { showConfirmation, showMessage, showFailed } = useStatusMessage();

  // All Handlers

  // Click handler for inspiration cards
  const handleInspirationClick = (item) => {
    setSelectedInspiration(item);
  };

  const handleCloseInspirationModal = () => {
    setSelectedInspiration(null);
  };

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
      const response = await fetch(`${BASE_URL}/drawings/delete/${drawingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDrawings(prev => prev.filter(d => d.drawing_id !== drawingId));
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

  //update vendor not working
  const handleUpdateVendor = (updatedVendor) => {
    console.log('🔄 PARENT: handleUpdateVendor called with:', updatedVendor);
    console.log('🔄 PARENT: Current vendors before update:', vendors);

    setVendors(prevVendors => {
      const newVendors = prevVendors.map(vendor =>
        vendor.id === updatedVendor.id ? updatedVendor : vendor
      );
      console.log('🔄 PARENT: Vendors after update:', newVendors);
      return newVendors;
    });

    setEditingVendor(null);
    console.log('✅ PARENT: Modal closed and state updated');
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
          const response = await fetch(`${BASE_URL}/vendors/del_vendors/${vendorId}`, {
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
          const response = await fetch(`${BASE_URL}/inspiration/del_inspirations/${inspirationId}`, {
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
    // console.log('🔄 useEffect triggered - Debug Info:');
    // console.log('  📍 activeTab:', activeTab);
    // console.log('  📍 spaceId:', spaceId);
    // console.log('  📍 spaceId type:', typeof spaceId);
    // console.log('  📍 spaceId is undefined:', spaceId === undefined);
    // console.log('  📍 spaceId is null:', spaceId === null);
    // console.log('  📍 spaceId is empty string:', spaceId === '');
    // console.log('  📍 Should fetch vendors:', activeTab === 'Vendors' && spaceId);

    const fetchVendors = async (spaceId) => {
      console.log('🚀 fetchVendors called with spaceId:', spaceId);

      if (activeTab === 'Vendors') {
        // Check if spaceId is valid before making API call
        if (!spaceId) {
          console.error('❌ BLOCKED: spaceId is invalid');
          setVendors([]);
          setLoading(prev => ({ ...prev, vendors: false }));
          return;
        }

        setLoading(prev => ({ ...prev, vendors: true }));
        try {
          const apiUrl = `${BASE_URL}/vendors/vendors/space/${spaceId}`;
          console.log('🌐 Fetching vendors from:', apiUrl);

          const response = await fetch(apiUrl);

          if (response && response.ok) {
            const responseData = await response.json();

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
              allVendors = [];
            }

            console.log('📋 Vendors found:', allVendors.length);

            // ✅ UPDATED: Remove category and use tags instead
            const mappedVendors = allVendors.map(vendor => ({
              id: vendor.vendor_id || vendor.id,
              vendor_id: vendor.vendor_id || vendor.id,
              name: vendor.company_name || 'Unnamed Vendor',
              contact: vendor.vendor_email || 'No contact',
              phone: vendor.contact_number || 'No phone',
              space_id: vendor.space_id,
              tags: vendor.tags || []
            }));

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

    console.log('🔧 Calling fetchVendors function...');
    fetchVendors(spaceId);
  }, [activeTab, spaceId]);

  // Add this additional useEffect to track when spaceId becomes available
  useEffect(() => {
    console.log('🔍 SpaceId Monitor - Current spaceId:', spaceId);
    console.log('🔍 SpaceId Monitor - spaceId available:', !!spaceId);
  }, [spaceId]);

  // Add this to see component props/state
  // console.log('📝 Component render - spaceId:', spaceId, 'activeTab:', activeTab);

  // Fetch tasks data
  useEffect(() => {
    const fetchTasks = async () => {
      if (activeTab === 'Tasks') {
        setLoading(prev => ({ ...prev, tasks: true }));
        try {
          // console.log('Fetching tasks for site map:', siteMap);

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
            // console.log('Fetched tasks data:', tasksData);

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
      if (activeTab === 'Drawings') {
        setLoading(prev => ({ ...prev, drawings: true }));
        try {
          console.log('Fetching all drawings...');
          const response = await fetch(`${BASE_URL}/drawings/get`);

          console.log('Drawings fetch response status:', response.status);

          if (response.ok) {
            const drawingsData = await response.json();
            // console.log('Fetched all drawings data:', drawingsData);

            // Handle different response formats and filter by space_id
            let allDrawings = [];
            if (Array.isArray(drawingsData)) {
              allDrawings = drawingsData;
            } else if (drawingsData && Array.isArray(drawingsData.data)) {
              allDrawings = drawingsData.data;
            } else if (drawingsData && Array.isArray(drawingsData.drawings)) {
              allDrawings = drawingsData.drawings;
            } else {
              console.log('Unexpected drawings response format:', drawingsData);
              allDrawings = [];
            }

            // Filter drawings by space_id
            const filteredDrawings = allDrawings.filter(drawing =>
              drawing.space_id === spaceId
            );

            console.log(`Filtered drawings for space ${spaceId}:`, filteredDrawings);
            setDrawings(filteredDrawings);
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
          const response = await fetch(`${BASE_URL}/inspiration/get`);

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

            const filteredInspiration = inspirationArray.filter(inspiration =>
              inspiration.space_id === spaceId
            );

            setInspiration(filteredInspiration);
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

  // Toggle task completion REMOVE CORS HANDLING
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
        const response = await fetch(`${BASE_URL}/tasks/tasks/${taskId}`, {
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
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <button
                  onClick={setIsAddDrawingOpen}
                  className='text-blue-600 hover:text-blue-700 text-sm mb-4'>
                  + Add your first Drawing to get started
                </button>
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
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onEdit={handleEditVendor}
                    onDelete={handleDeleteVendor}
                  />
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
                <button className='text-blue-600 hover:text-blue-700 text-md'
                  onClick={setIsAddVendorOpen}
                >
                  + Add your first vendor to get started
                </button>
              </div>
            )}
          </div>
        )}

        {/* Inspiration Tab*/}
        {activeTab === 'Inspiration' && (
          <div className='h-[600px] overflow-y-auto whitespace-nowrap scrollbar-hidden'>
            {/* {console.log('=== INSPIRATION TAB DEBUG ===', {
              activeTab,
              loading: loading.inspiration,
              inspirationData: inspiration,
              inspirationCount: inspiration.length,
              spaceId: spaceId,
              hasHandleEdit: !!handleEditInspiration,
              hasHandleDelete: !!handleDeleteInspiration
            })} */}
            {loading.inspiration ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading inspiration...</p>
              </div>
            ) : inspiration.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inspiration.map((item) => (
                  <InspirationCard
                    key={item.inspiration_id || item.id}
                    item={item}
                    onEdit={handleEditInspiration}
                    onDelete={handleDeleteInspiration}
                    onClick={handleInspirationClick}
                  />
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
                <button className='text-blue-600 hover:text-blue-700 text-md'
                  onClick={setIsAddInspirationOpen}
                >
                  + Add your first inspiration image to get started
                </button>
              </div>
            )}
          </div>
        )}

        {/* Inspiration Click */}
        {selectedInspiration && (
          <InspirationClickModal
            inspiration={selectedInspiration}
            onClose={handleCloseInspirationModal}
          />
        )}

        {/* Check Tasks All */}
        {/* Change Tasks */}
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
                  <SiteTaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
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
         
      {/* task Change */}
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
        <>
          {/* Debug what's being passed to the modal */}
          {console.log('=== PARENT COMPONENT DEBUG ===')}
          {console.log('Editing Drawing:', editingDrawing)}
          {console.log('Drawing ID to pass:', editingDrawing.drawing_id)}
          {console.log('Space ID to pass:', editingDrawing.space_id)}
          {console.log('SiteMap space_id:', siteMap?.space_id)}
          {console.log('SiteMap id:', siteMap?.id)}

          <EditDrawingModal
            drawing={editingDrawing}
            spaceId={editingDrawing?.space_id}  // Added optional chaining
            projectId={siteMap?.project_id}
            onClose={() => setEditingDrawing(null)}
            onUpdate={(updatedDrawing) => {
              console.log('🔄 Parent: Received updated drawing:', updatedDrawing);
              console.log('🔄 Parent: Current drawings before update:', drawings);

              setDrawings(prev => {
                const updated = prev.map(d =>
                  d.drawing_id === updatedDrawing.drawing_id ? updatedDrawing : d
                );
                console.log('🔄 Parent: Drawings after update:', updated);
                return updated;
              });
              setEditingDrawing(null);
            }}
          />
        </>
      )}

      {/* Edit Vendors */}
      {editingVendor && (
        <EditVendorModal
          vendor={editingVendor}
          spaceId={siteMap?.space_id || siteMap?.id}
          projectId={siteMap?.project_id}
          onClose={() => setEditingVendor(null)}
          onUpdate={handleUpdateVendor}
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