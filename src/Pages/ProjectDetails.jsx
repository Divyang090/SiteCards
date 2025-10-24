import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThemeProvider } from '../Components/Theme';

const ProjectDetails = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'sitemaps'
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    taskType: 'Simple Task',
    assignee: 'Unassigned',
    files: []
  });
  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const projects = {
    1: {
      title: "Modern Downtown Loft",
      assignee: "Sarah Johnson",
      status: "Progress",
      dueDate: "Jan 15, 2024",
      location: "Downtown, NYC",
      description: "Complete renovation of a 2-bedroom loft with modern finishes and smart home integration.",
      board: "Site Map",
      siteMaps: [
        {
          id: 1,
          title: "Floor Plan",
          image: "/api/placeholder/400/300",
          date: "Jan 10, 2024",
          description: "Initial floor plan layout"
        },
        {
          id: 2,
          title: "Electrical Layout",
          image: "/api/placeholder/400/300",
          date: "Jan 12, 2024",
          description: "Electrical wiring and outlet placement"
        },
        {
          id: 3,
          title: "Plumbing Diagram",
          image: "/api/placeholder/400/300",
          date: "Jan 14, 2024",
          description: "Plumbing and fixture locations"
        },
        {
          id: 4,
          title: "3D Render",
          image: "/api/placeholder/400/300",
          date: "Jan 16, 2024",
          description: "3D visualization of the space"
        },
        {
          id: 5,
          title: "Material Board",
          image: "/api/placeholder/400/300",
          date: "Jan 18, 2024",
          description: "Selected materials and finishes"
        },
        {
          id: 6,
          title: "Lighting Plan",
          image: "/api/placeholder/400/300",
          date: "Jan 20, 2024",
          description: "Lighting fixture placement"
        }
      ]
    },
    2: {
      title: "Suburban Family Home",
      assignee: "The Martinez Family",
      status: "Progress",
      dueDate: "Feb 28, 2024",
      location: "Westchester, NY",
      description: "Family home renovation with focus on functionality and comfort.",
      board: "Site Plan",
      siteMaps: []
    },
    3: {
      title: "Corporate Office Redesign",
      assignee: "TechCorp Inc.",
      status: "Progress",
      dueDate: "Jan 20, 2024",
      location: "Midtown, NYC",
      description: "Modern office space redesign to promote collaboration.",
      board: "Floor Plan",
      siteMaps: []
    }
  };

  const project = projects[id];

  // Task type and assignee options
  const taskTypeOptions = ['Simple Task', 'Site Visits', 'Meeting', 'Design Review', 'Client Meeting', 'Documentation'];
  const assigneeOptions = ['Unassigned', 'Sarah Johnson', 'The Martinez Family', 'TechCorp Inc.', 'John Doe', 'Jane Smith', 'Mike Wilson'];

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (taskData.title.trim()) {
      const newTask = {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description,
        taskType: taskData.taskType,
        assignee: taskData.assignee,
        files: taskData.files,
        completed: false,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      setTasks([...tasks, newTask]);
      setTaskData({
        title: '',
        description: '',
        taskType: 'Simple Task',
        assignee: 'Unassigned',
        files: []
      });
      setIsCreatingTask(false);
    }
  };

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleChange = (e) => {
    setTaskData({
      ...taskData,
      [e.target.name]: e.target.value
    });
  };

  const handleTaskTypeSelect = (type) => {
    setTaskData({
      ...taskData,
      taskType: type
    });
    setShowTaskTypeDropdown(false);
  };

  const handleAssigneeSelect = (assignee) => {
    setTaskData({
      ...taskData,
      assignee: assignee
    });
    setShowAssigneeDropdown(false);
  };

  const toggleTaskTypeDropdown = () => {
    setShowTaskTypeDropdown(!showTaskTypeDropdown);
    setShowAssigneeDropdown(false);
  };

  const toggleAssigneeDropdown = () => {
    setShowAssigneeDropdown(!showAssigneeDropdown);
    setShowTaskTypeDropdown(false);
  };

  const remainingTasks = tasks.filter(task => !task.completed).length;
  const totalTasks = tasks.length;

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project Not Found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <span>• {project.assignee}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {project.status}
            </span>
            <span>• Due {project.dueDate}</span>
            <span>• {project.location}</span>
          </div>

          <div className="border-t border-b border-gray-200 py-4 my-6">
            <p className="text-gray-700">{project.description}</p>
          </div>

          {/* <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-500">Board</span>
              <p className="text-gray-900 font-semibold">{project.board}</p>
            </div>
          </div> */}
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
              Site Maps({project.siteMaps?.length || 0})
            </button>
          </nav>
        </div>

        {/* Tasks Tab Content */}
        {activeTab === 'tasks' && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
                <p className="text-gray-600 mt-1">{remainingTasks} of {totalTasks} remaining</p>
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

            {/* Compact Task Creation Form */}
            {isCreatingTask && (
              <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Task Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={taskData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter task title"
                        autoFocus
                      />
                    </div>

                    {/* Task Type Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Type
                      </label>
                      <button
                        type="button"
                        onClick={toggleTaskTypeDropdown}
                        className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm"
                      >
                        <span className="text-gray-700 truncate">{taskData.taskType}</span>
                        <svg 
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showTaskTypeDropdown ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showTaskTypeDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {taskTypeOptions.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleTaskTypeSelect(type)}
                              className={`w-full text-left px-3 py-2 hover:bg-gray-100 text-sm ${
                                taskData.taskType === type ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assignee Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignee
                      </label>
                      <button
                        type="button"
                        onClick={toggleAssigneeDropdown}
                        className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm"
                      >
                        <span className="text-gray-700 truncate">{taskData.assignee}</span>
                        <svg 
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showAssigneeDropdown ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showAssigneeDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {assigneeOptions.map((assignee) => (
                            <button
                              key={assignee}
                              type="button"
                              onClick={() => handleAssigneeSelect(assignee)}
                              className={`w-full text-left px-3 py-2 hover:bg-gray-100 text-sm ${
                                taskData.assignee === assignee ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              {assignee}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <textarea
                      name="description"
                      value={taskData.description}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter task description"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCreatingTask(false)}
                        className="flex-1 px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                      >
                        Add Task
                      </button>
                    </div>
                </form>
              </div>
            )}

            {/* Tasks List with Scroll */}
            <div className={`space-y-3 ${tasks.length > 3 ? 'max-h-96 overflow-y-auto' : ''}`}>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between group hover:shadow-md transition-shadow duration-200">
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
                          <span className="bg-gray-100 px-2 py-1 rounded">{task.taskType}</span>
                          {task.assignee !== 'Unassigned' && (
                            <span>Assigned to: {task.assignee}</span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
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
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 mb-3">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
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
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Site Maps</h2>
                <p className="text-gray-600 mt-1">{project.siteMaps?.length || 0} site maps</p>
              </div>
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Site Map
              </button>
            </div>

            {/* Site Maps Grid - 3 per row */}
            {project.siteMaps && project.siteMaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.siteMaps.map((siteMap) => (
                  <div key={siteMap.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                    {/* Image Container */}
                    <div className="aspect-video bg-gray-200 relative overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white bg-opacity-90 rounded-full p-3 shadow-lg">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{siteMap.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{siteMap.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Uploaded {siteMap.date}</span>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">View</button>
                          <button className="text-gray-400 hover:text-gray-600">Download</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-gray-400 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No site maps yet</h3>
                <p className="text-gray-500 text-sm mb-4">Upload site map to get started</p>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  + Upload your site map
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;