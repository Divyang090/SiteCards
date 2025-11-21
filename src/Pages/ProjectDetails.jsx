import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CreateTaskModal from '../Components/CreateTaskModal';
import SiteMapsSection from '../Components/SiteMapsSection';
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';
import EditTaskModal from '../EditModal/EditTaskModal';
import TaskFileModal from '../Components/TaskFileModal';

const ProjectDetails = ({ projects: propProjects = [] }) => {
  const { id, projectId, spaceId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem(`project-${id}-activeTab`);
    return savedTab || 'tasks';
  });
  const [selectedTaskFiles, setSelectedTaskFiles] = useState([]);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
  const [siteMapsCount, setSiteMapsCount] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: 'Task',
    assignee: 'Unassigned',
    location: '',
    date: '',
    files: []
  });

  const [editingTask, setEditingTask] = useState(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);

  const { showMessage, showConfirmation } = useStatusMessage();

  const handleToggleDescription = (taskId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  useEffect(() => {
    localStorage.setItem(`project-${id}-activeTab`, activeTab);
  }, [activeTab, id]);

  // Get project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);

        console.log('Loading project with ID:', id);
        //remove after testing
        // console.log('propProjects:', propProjects);
        // console.log('localStorage projects:', JSON.parse(localStorage.getItem('projects') || '[]'));
        if (Array.isArray(propProjects) && propProjects.length > 0) {
          const foundFromProps = propProjects.find(p => (p.id && p.id.toString() === id) || (p.project_id && p.project_id.toString() === id));
          if (foundFromProps) {
            console.log('Found project in parent propProjects:', foundFromProps);
            setProject(foundFromProps);
            setLoading(false);
            return;
          }
        }

        const localProject = getProjectFromLocalStorage(id);
        if (localProject) {
          console.log('Found project in localStorage:', localProject);
          setProject(localProject);
          setLoading(false);
          return;
        }

        console.log('Project not in localStorage, trying API...');
        let response = await fetch(`${BASE_URL}/projects/projects/${id}`);

        if (response.ok) {
          const projectData = await response.json();
          const transformedProject = transformProjectData(projectData);
          // console.log('Found project via API:', transformedProject);
          setProject(transformedProject);
        } else {
          const projectsResponse = await fetch(`${BASE_URL}/projects/projects`);
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            const projectsArray = extractProjectsArray(projectsData);
            const foundProject = projectsArray.find(proj =>
              (proj.id && proj.id.toString() === id) ||
              (proj.project_id && proj.project_id.toString() === id)
            );

            if (foundProject) {
              const transformedProject = transformProjectData(foundProject);
              console.log('Found project in projects list:', transformedProject);
              setProject(transformedProject);
            } else {
              throw new Error('Project not found in API');
            }
          } else {
            throw new Error('API not available');
          }
        }

      } catch (err) {
        console.error('Error loading project:', err);
        const defaultProject = createDefaultProject(id);
        setProject(defaultProject);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id, propProjects]);

  useEffect(() => {
    if (project && Array.isArray(project.siteMaps)) {
      setSiteMapsCount(project.siteMaps.length);
    } else {
      setSiteMapsCount(0);
    }
  }, [project]);


  // FETCH TASKS FROM API
  useEffect(() => {
    const fetchTasks = async () => {
      if (!id) return;

      try {
        setTaskLoading(true);
        const response = await fetch(`${BASE_URL}/tasks/tasks`);
        if (response.ok) {
          const tasksData = await response.json();
          console.log('Fetched ALL tasks from API:', tasksData);

          // Handle different response formats
          let tasksArray = tasksData;
          if (tasksData && Array.isArray(tasksData.data)) {
            tasksArray = tasksData.data;
          } else if (tasksData && Array.isArray(tasksData.tasks)) {
            tasksArray = tasksData.tasks;
          }

          // Filter tasks by project_id
          const filteredTasks = tasksArray.filter(task =>
            String(task.project_id) === String(id)
          );

          console.log(`Filtered tasks for project ${id}:`, filteredTasks);

          // Transform ONLY the filtered tasks - FIXED MAPPING
          const transformedTasks = filteredTasks.map(task => {
            // Format date from "Mon, 24 Dec 2012 00:00:00 GMT" to readable format
            let formattedDate = '';
            if (task.date) {
              try {
                const dateObj = new Date(task.date);
                formattedDate = dateObj.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              } catch (e) {
                console.error('Error formatting date:', e);
                formattedDate = task.date;
              }
            }

            return {
              id: task.id || task.task_id,
              title: task.task_name || task.title,
              description: task.description,
              location: task.location,
              visit_date: formattedDate,
              Date: formattedDate,
              taskType: task.task_type || 'Simple Task',
              assignee: task.assigned_to || task.assigned_team || task.assigned_vendor || 'Unassigned',
              assigned_to: task.assigned_to || task.assigned_team || task.assigned_vendor || 'Unassigned',
              status: task.status || 'pending',
              completed: task.status === 'completed',
              files: task.files || []
            };
          });

          setTasks(transformedTasks);
        } else {
          console.log('No tasks found in API');
          setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      } finally {
        setTaskLoading(false);
      }
    };

    if (id) {
      fetchTasks();
    }
  }, [id]);

  //Edit tasks Project details
  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
    }
  };

  // Helper functions
  const getProjectFromLocalStorage = (projectId) => {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const foundProject = projects.find(p => p.id && p.id.toString() === projectId);
      return foundProject || null;
    } catch (err) {
      console.error('Error reading from localStorage:', err);
      return null;
    }
  };

  const extractProjectsArray = (projectsData) => {
    if (Array.isArray(projectsData)) return projectsData;
    if (projectsData && Array.isArray(projectsData.data)) return projectsData.data;
    if (projectsData && Array.isArray(projectsData.projects)) return projectsData.projects;
    return [];
  };

  const transformProjectData = (projectData) => {
    console.log('projectData', projectData);
    console.log("✅ RAW projectData.something:", {
      site_maps: projectData.site_maps,
      siteMaps: projectData.siteMaps,
      sitemaps: projectData.sitemaps,
      site_map: projectData.site_map,
      siteMap: projectData.siteMap
    });

    return {


      id: projectData.id || projectData.project_id,
      title: projectData.project_name || projectData.title || 'Project',
      assignee: projectData.client_name || projectData.assignee || 'Unassigned',
      status: projectData.status || 'open',
      dueDate: projectData.end_date ? new Date(projectData.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
        projectData.due_date ? new Date(projectData.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date',
      location: projectData.location || 'No location',
      description: projectData.project_description || projectData.description || 'No description available',
      board: "Site Map",
      siteMaps:
        projectData.site_maps ||
        projectData.siteMaps ||
        projectData.sitemaps ||
        projectData.site_map ||
        projectData.siteMap ||
        projectData.maps ||
        projectData.files ||
        []
    };
  };

  const createDefaultProject = (projectId) => {
    return {
      id: projectId,
      title: 'Project',
      assignee: 'Unassigned',
      status: 'open',
      dueDate: 'No date',
      location: 'No location',
      description: 'Project details',
      board: "Site Map",
      siteMaps: []
    };
  };

  const handleCreateTask = async (newTaskData, projectId) => {
    try {
      console.log('Task creation callback received:', newTaskData, 'for project:', projectId);
      if (String(projectId) === String(id)) {
        // Format date for display
        let formattedDate = '';
        if (newTaskData.date) {
          try {
            const dateObj = new Date(newTaskData.date);
            formattedDate = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
          } catch (e) {
            console.error('Error formatting date:', e);
            formattedDate = newTaskData.date;
          }
        }

        const transformedTask = {
          id: newTaskData.id || newTaskData.task_id,
          title: newTaskData.task_name || newTaskData.title,
          description: newTaskData.description,
          taskType: newTaskData.task_type || 'Simple Task',
          assignee: newTaskData.assigned_to || newTaskData.assigned_vendor || newTaskData.assigned_team || 'Unassigned', // FIXED
          assigned_to: newTaskData.assigned_to || newTaskData.assigned_vendor || newTaskData.assigned_team || 'Unassigned', // Add this
          status: newTaskData.status || 'pending',
          completed: (newTaskData.status || 'pending') === 'completed',
          location: newTaskData.location, // Add location
          visit_date: formattedDate, // Add formatted date
          Date: formattedDate, // Add Date field
          createdAt: newTaskData.created_at ? new Date(newTaskData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
          files: newTaskData.files || []
        };

        setTasks(prev => [transformedTask, ...prev]);
      }

      // Refresh tasks from API to ensure consistency
      setTaskLoading(true);
      const response = await fetch(`${BASE_URL}/tasks/tasks`);
      if (response.ok) {
        const tasksData = await response.json();

        let tasksArray = tasksData;
        if (tasksData && Array.isArray(tasksData.data)) {
          tasksArray = tasksData.data;
        } else if (tasksData && Array.isArray(tasksData.tasks)) {
          tasksArray = tasksData.tasks;
        }

        const filteredTasks = tasksArray.filter(task =>
          String(task.project_id) === String(id)
        );

        const transformedTasks = filteredTasks.map(task => {
          let formattedDate = '';
          if (task.date) {
            try {
              const dateObj = new Date(task.date);
              formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
            } catch (e) {
              formattedDate = task.date;
            }
          }

          return {
            id: task.id || task.task_id,
            title: task.task_name || task.title,
            description: task.description,
            taskType: task.task_type || 'Simple Task',
            assignee: task.assigned_to || task.assigned_team || task.assigned_vendor || 'Unassigned',
            assigned_to: task.assigned_to || task.assigned_team || task.assigned_vendor || 'Unassigned',
            status: task.status || 'pending',
            completed: task.status === 'completed',
            location: task.location,
            visit_date: formattedDate,
            Date: formattedDate,
            createdAt: task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
            files: task.files || []
          };
        });

        setTasks(transformedTasks);
      }
    } catch (error) {
      console.error('Error in task creation callback:', error);
    } finally {
      setTaskLoading(false);
    }
  };

  // UPDATE TASK STATUS USING API
  const handleToggleStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

      const formData = new FormData();
      formData.append('status', newStatus);

      const response = await fetch(`${BASE_URL}/tasks/tasks/${taskId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTask = await response.json();

      // Update the task in your state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      showMessage(`Task marked as ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating task status:', error);
      showFailed('Failed to update task status');
    }
  };

  // DELETE TASK USING API
  const handleDeleteTask = async (taskId) => {
    showConfirmation(
      'Delete Task',
      `Are ypu sure ypu want to delete this task? This action cannot be undone`,
      async () => {
        try {
          const response = await fetch(`${BASE_URL}/tasks/tasks/${taskId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setTasks(tasks.filter(task => task.id !== taskId));
            showMessage('Task deleted Successfully', 'success')
          } else {
            throw new Error('Failed to delete task');
          }
        } catch (error) {
          console.error('Error deleting task:', error);
          showMessage('Failed to delete task', 'error');
        }
      }
    );
  }

  //TaskFileModal Handlers
  const handleOpenFilesModal = (taskFiles, taskTitle = '') => {
    setSelectedTaskFiles(taskFiles || []);
    setSelectedTaskTitle(taskTitle);
    setIsFilesModalOpen(true);
  };

  const handleCloseFilesModal = () => {
    setIsFilesModalOpen(false);
    setSelectedTaskFiles([]);
    setSelectedTaskTitle('');
  };

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0;
  });

  const remainingTasks = tasks.filter(task => !task.completed).length;
  const totalTasks = tasks.length;


  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="min-h-screen theme-bg-primary bg-[url('bgimage.png')] theme-text-primary">
      <div className="mx-auto px-6 py-8">
        {/* Back Button Skeleton */}
        <div className="w-24 h-4 theme-bg-primary rounded mb-6 animate-pulse"></div>

        {/* Project Header Skeleton */}
        <div className="mb-8">
          <div className="w-3/4 h-8 theme-bg-secondary rounded mb-4 animate-pulse"></div>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="w-20 h-6 theme-bg-secondary rounded animate-pulse"></div>
            <div className="w-16 h-6 theme-bg-secondary rounded animate-pulse"></div>
            <div className="w-24 h-6 theme-bg-secondary rounded animate-pulse"></div>
          </div>
          <div className="w-theme-bg-primary rounded animate-pulse"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="border-b theme-bg-primary mb-6">
          <div className="flex space-x-8">
            <div className="w-16 h-8 theme-bg-primary rounded animate-pulse"></div>
            <div className="w-20 h-8 theme-bg-primary rounded animate-pulse"></div>
          </div>
        </div>

        {/* Tasks Skeleton */}
        <div className="theme-bg-secondary rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="w-32 h-6 theme-bg-primary rounded mb-2 animate-pulse"></div>
              <div className="w-24 h-4 theme-bg-primary rounded animate-pulse"></div>
            </div>
            <div className="w-28 h-10 theme-bg-primary rounded animate-pulse"></div>
          </div>

          {/* Task Items Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="theme-bg-primary rounded-lg border border-gray-200 p-4 flex items-center gap-3 animate-pulse">
                <div className="w-5 h-5 theme-bg-card rounded"></div>
                <div className="flex-1">
                  <div className="w-3/4 h-4 theme-bg-card rounded mb-2"></div>
                  <div className="w-1/2 h-3 theme-bg-card rounded"></div>
                </div>
                <div className="w-16 h-4 theme-bg-card rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading || taskLoading) {
    return <SkeletonLoader />;
  }

  const displayProject = project;

  return (
    // <div className="min-h-screen bg-[url('bgimage.png')] theme-bg-primary theme-text-primary text-size">
    <div className="min-h-screen bg-[url('/bgimage.png')] bg-cover bg-center theme-bg-primary theme-text-primary text-size">
      <div className="mx-auto px-2 py-2 md:px-6 md:py-8 ">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-400 mb-6">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          <h1 className="md:text-3xl text-2xl font-bold theme-text-primary mb-4">{displayProject.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <span>• {displayProject.assignee}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {displayProject.status}
            </span>
            <span>• Due {displayProject.docDate}</span>
            <span>• {displayProject.location}</span>
          </div>

          <div className="border-t border-b border-gray-200 py-4 my-6">
            <p className="theme-text-secondary">{displayProject.description}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Tasks
              {/* ({totalTasks}) */}
            </button>
            <button
              onClick={() => setActiveTab('sitemaps')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'sitemaps'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Site Maps
              {/* ({siteMapsCount}) */}
            </button>
          </nav>
        </div>

        {/* Tasks Tab Content */}
        {activeTab === 'tasks' && (
          <div className="theme-bg-secondary rounded-lg md:p-6 p-2 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="md:text-2xl text-xl font-bold theme-text-primary">Tasks</h2>
                <p className="theme-text-secondary mt-1">{remainingTasks} of {totalTasks} remaining</p>
              </div>

              {!isCreatingTask && (
                <button
                  onClick={() => setIsCreatingTask(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Task
                </button>
              )}
            </div>

            {/* INLINE TASK CREATION FORM*/}
            {isCreatingTask && (
              <CreateTaskModal
                isInline={true}
                projectId={id}
                onCreate={handleCreateTask}
                onCancel={() => setIsCreatingTask(false)}
              />
            )}

            {/* Tasks List with Scroll */}
            <div className={`space-y-3 ${sortedTasks.length > 3 ? 'h-screen overflow-y-auto scrollbar-hidden' : ''}`}>
              {sortedTasks.length > 0 ? (
                sortedTasks.map((task) => (
                  editingTask?.id === task.id ? (
                    <EditTaskModal
                      key={task.id}
                      task={editingTask}
                      projectId={id}
                      isInline={true}
                      onClose={() => setEditingTask(null)}
                      onUpdate={(updatedTask) => {
                        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
                        setEditingTask(null);
                      }}
                    />
                  ) : (
                    <div
                      key={task.id}
                      className={`theme-bg-primary overflow-x-auto scrollbar-hidden whitespace-nowrap rounded-lg border border-gray-500 p-4 flex items-center justify-between group hover:shadow-md transition-all duration-200 ${task.completed ? 'opacity-60 scale-[0.98]' : ''
                        }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* Checkbox*/}
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${task.completed
                            ? 'bg-green-500 border-green-500 text-white shadow-sm'
                            : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                            }`}
                        >
                          {task.completed && (
                            <svg
                              className="w-3 h-3 transition-all duration-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        {/* Task content*/}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleToggleDescription(task.id)}
                        >
                          <div className="flex items-center">
                            <span className={`block font-medium theme-text-secondary transition-all duration-200 ${task.completed ? 'text-gray-400 line-through' : 'theme-text-primary'
                              }`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 ml-4">
                              <span className="theme-bg-secondary px-2 py-1 rounded text-xs">{task.taskType}</span>
                            </div>
                          </div>

                          {(task.assigned_to || task.location || task.Date) && (
                            <div className='flex items-center gap-3 mt-1'>

                              {/* task assigned to on task card */}
                              {task.assigned_to && task.assigned_to !== 'Unassigned' && (
                                <span className={`text-xs flex items-center gap-1 ${task.completed ? 'text-gray-400' : 'theme-text-secondary'} `}>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {task.assigned_to}
                                </span>
                              )}

                              {/* task location on task card */}
                              {task.location && (
                                <span className={`text-xs flex items-center gap-1 ${task.completed ? 'text-gray-400' : 'theme-text-secondary'}`}>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {task.location}
                                </span>
                              )}

                              {/* task date on task card  */}
                              {task.visit_date && (
                                <span className={`text-xs flex items-center gap-1 ${task.completed ? 'text-gray-400':'theme-text-secondary'}`}>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {task.visit_date}
                                </span>
                              )}
                            </div>
                          )}

                          {task.description && expandedDescriptions[task.id] && (
                            <p className={`text-sm theme-bg-secondary theme-text-secondary mt-2 transition-all duration-200 ${task.completed ? 'text-gray-400' : ''
                              }`}>
                              {task.description}
                            </p>
                          )}

                          {/* Files section */}
                          {task.files && task.files.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOpenFilesModal(task.files, task.title);
                              }}
                              className={`text-xs flex items-center gap-1 ${task.completed ? 'text-gray-400' : 'text-gray-500'} hover:text-blue-500 transition-colors duration-200`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {task.files.length}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Date and action buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`text-xs whitespace-nowrap transition-all duration-200 ${task.completed ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                          {task.createdAt}
                        </span>

                        {/* Edit Button*/}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditTask(task.id);
                          }}
                          className="text-gray-400 hover:text-blue-500 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="text-gray-400 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 opacitty-100 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                ))
              ) : !isCreatingTask ? (
                // Empty state
                <div className="text-center py-12 theme-bg-primary rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 mb-3">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium theme-text-primary mb-2">No tasks yet</h3>
                  <p className="text-gray-500 text-sm mb-4">Create your first task to get started</p>
                  <button
                    onClick={() => setIsCreatingTask(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    + Create your first task
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Site Maps Tab Content */}
        {activeTab === 'sitemaps' && (
          <SiteMapsSection
            projectId={id}
            siteMaps={(displayProject.siteMaps) || []}
          />
        )}

        {/* Files Modal */}
        <TaskFileModal
          isOpen={isFilesModalOpen}
          onClose={handleCloseFilesModal}
          files={selectedTaskFiles}
          taskTitle={selectedTaskTitle}
        />
      </div>
    </div>
  );
};

export default ProjectDetails;