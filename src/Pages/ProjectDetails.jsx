import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CreateTaskModal from '../Components/CreateTaskModal';
import SiteMapsSection from '../Components/SiteMapsSection';

const ProjectDetails = ({ projects: propProjects = [] }) => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');

  // Get project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        
        console.log('Loading project with ID:', id);
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
        let response = await fetch(`http://127.0.0.1:5000/api/projects/projects/${id}`);
        
        if (response.ok) {
          const projectData = await response.json();
          const transformedProject = transformProjectData(projectData);
          console.log('Found project via API:', transformedProject);
          setProject(transformedProject);
        } else {
          const projectsResponse = await fetch('http://127.0.0.1:5000/api/projects/projects');
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
  }, [id]);

  // FETCH TASKS FROM API
  useEffect(() => {
    const fetchTasks = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/tasks/tasks?project_id=${id}`);
        if (response.ok) {
          const tasksData = await response.json();
          console.log('Fetched tasks from API:', tasksData);
          
          // Handle different response formats
          let tasksArray = tasksData;
          if (tasksData && Array.isArray(tasksData.data)) {
            tasksArray = tasksData.data;
          } else if (tasksData && Array.isArray(tasksData.tasks)) {
            tasksArray = tasksData.tasks;
          }
          
          // Transform API data to match frontend structure
          const transformedTasks = tasksArray.map(task => ({
            id: task.id || task.task_id,
            title: task.title,
            description: task.description,
            taskType: task.task_type || 'Simple Task',
            assignee: task.assignee || 'Unassigned',
            status: task.status || 'pending',
            completed: task.status === 'completed',
            createdAt: task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
            files: task.files || []
          }));
          
          setTasks(transformedTasks);
        } else {
          console.log('No tasks found in API');
          setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      }
    };

    if (id) {
      fetchTasks();
    }
  }, [id]);

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
      siteMaps: [
        {
        id: 1,
        title: 'Floor Plan',
        description: 'Main floor layout',
        file_url: '/sample-floorplan.jpg',
        file_type: 'image/jpeg',
        file_size: 2048576,
        created_at: new Date().toISOString()
      },
      {
        id: 2, 
        title: 'Electrical Layout',
        description: 'Wiring and outlets plan',
        file_url: '/sample-electrical.pdf',
        file_type: 'application/pdf',
        file_size: 1048576,
        created_at: new Date().toISOString()
      }
      ]
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

  // Handle task creation success
const handleCreateTask = async (newTaskData) => {
  try {
    console.log('Task creation callback received:', newTaskData);
    
    // Add the new task to the local state immediately for better UX
    if (newTaskData && (newTaskData.id || newTaskData.task_id)) {
      const transformedTask = {
        id: newTaskData.id || newTaskData.task_id,
        title: newTaskData.task_name || newTaskData.title,
        description: newTaskData.description,
        taskType: newTaskData.task_type || 'Simple Task',
        assignee: newTaskData.assigned_vendor || newTaskData.assigned_team || newTaskData.assigned_to || newTaskData.assignee || 'Unassigned',
        // status: newTaskData.status || 'pending',
        // completed: newTaskData.status === 'completed',
        // createdAt: newTaskData.created_at ? new Date(newTaskData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
        files: newTaskData.files || []
      };
      
      setTasks(prev => [transformedTask, ...prev]);
    }
    
    // Also refresh from API to ensure consistency
    const response = await fetch(`http://127.0.0.1:5000/api/tasks/tasks?project_id=${id}`);
    if (response.ok) {
      const tasksData = await response.json();
      console.log('Refreshed tasks from API:', tasksData);
      // ... your existing transformation logic
    }
  } catch (error) {
    console.error('Error in task creation callback:', error);
  }
};

  // UPDATE TASK STATUS USING API
  const handleToggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      const response = await fetch(`http://127.0.0.1:5000/api/tasks/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (response.ok) {
        // Update local state
        setTasks(tasks.map(task => 
          task.id === taskId ? { 
            ...task, 
            status: newStatus,
            completed: newStatus === 'completed'
          } : task
        ));
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task status');
    }
  };

  // DELETE TASK USING API
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/tasks/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  // Sort tasks: completed tasks at the bottom
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0;
  });

  const remainingTasks = tasks.filter(task => !task.completed).length;
  const totalTasks = tasks.length;

  // Skeleton loading component (keep your existing skeleton code)
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-white">
      {/* Your existing skeleton code remains the same */}
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  const displayProject = project;

console.log('Project Data:', displayProject);
console.log('Site Maps:', displayProject.siteMaps);
console.log('Project ID:', id);

  return (
    <div className="min-h-screen theme-bg-primary theme-text-primary">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-500 mb-6">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold theme-text-primary mb-4">{displayProject.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <span>• {displayProject.assignee}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {displayProject.status}
            </span>
            <span>• Due {displayProject.dueDate}</span>
            <span>• {displayProject.location}</span>
          </div>

          <div className="border-t border-b border-gray-200 py-4 my-6">
            <p className="text-gray-700">{displayProject.description}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks ({totalTasks})
            </button>
            <button
              onClick={() => setActiveTab('sitemaps')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'sitemaps'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Site Maps ({displayProject.siteMaps?.length || 0})
            </button>
          </nav>
        </div>

        {/* Tasks Tab Content */}
        {activeTab === 'tasks' && (
          <div className="theme-bg-secondary rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold theme-text-primary">Tasks</h2>
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

            {/* INLINE TASK CREATION FORM - Using CreateTaskModal component */}
            {isCreatingTask && (
              <CreateTaskModal
                isInline={true}
                projectId={id}
                onCreate={handleCreateTask}
                onCancel={() => setIsCreatingTask(false)}
              />
            )}

            {/* Tasks List with Scroll */}
            <div className={`space-y-3 ${sortedTasks.length > 3 ? 'max-h-96 overflow-y-auto' : ''}`}>
              {sortedTasks.length > 0 ? (
                sortedTasks.map((task) => (
                  <div key={task.id} className={`theme-bg-primary rounded-lg border border-gray-500 p-4 flex items-center justify-between group hover:shadow-md transition-shadow duration-200 ${
                    task.completed ? 'opacity-60' : ''
                  }`}>
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                          task.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`block font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="theme-bg-secondary px-2 py-1 rounded">{task.taskType}</span>
                          {task.assignee !== 'Unassigned' && (
                            <span>Assigned to: {task.assignee}</span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm theme-text-primary mt-1">{task.description}</p>
                        )}
                        {task.files && task.files.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {task.files.map((file, index) => (
                              <span key={index} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                          {/* 📎 */}
                                Null {typeof file === 'string' ? file : file.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{task.createdAt}</span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : !isCreatingTask ? (
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
      </div>
    </div>
  );
};

export default ProjectDetails;