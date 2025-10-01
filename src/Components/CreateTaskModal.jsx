import React, { useState, useRef, useEffect } from 'react';

const CreateTaskModal = ({ isOpen, onClose, onCreate }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    taskType: 'Simple Task',
    assignee: 'Unassigned',
    files: []
  });

  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // ADDED: Refs for dropdown containers
  const taskTypeDropdownRef = useRef(null);
  const assigneeDropdownRef = useRef(null);

  // ADDED: Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close task type dropdown if clicked outside
      if (taskTypeDropdownRef.current && !taskTypeDropdownRef.current.contains(event.target)) {
        setShowTaskTypeDropdown(false);
      }
      
      // Close assignee dropdown if clicked outside
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target)) {
        setShowAssigneeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const taskTypeOptions = [
    'Simple Task',
    'Site Visits', 
    'Meeting',
    'Design Review',
    'Client Meeting',
    'Documentation'
  ];

  const assigneeOptions = [
    'Unassigned',
    'Sarah Johnson',
    'The Martinez Family', 
    'TechCorp Inc.',
    'John Doe',
    'Jane Smith',
    'Mike Wilson'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(taskData);
    setTaskData({
      title: '',
      description: '',
      taskType: 'Simple Task',
      assignee: 'Unassigned',
      files: []
    });
    setShowTaskTypeDropdown(false);
    setShowAssigneeDropdown(false);
  };

  const handleChange = (e) => {
    setTaskData({
      ...taskData,
      [e.target.name]: e.target.value
    });
  };

  // UPDATED: Close other dropdown when opening one
  const handleTaskTypeSelect = (type) => {
    setTaskData({
      ...taskData,
      taskType: type
    });
    setShowTaskTypeDropdown(false);
  };

  // UPDATED: Close other dropdown when opening one
  const handleAssigneeSelect = (assignee) => {
    setTaskData({
      ...taskData,
      assignee: assignee
    });
    setShowAssigneeDropdown(false);
  };

  // UPDATED: Close other dropdown when opening one
  const toggleTaskTypeDropdown = () => {
    setShowTaskTypeDropdown(!showTaskTypeDropdown);
    setShowAssigneeDropdown(false); // Close assignee dropdown
  };

  // UPDATED: Close other dropdown when opening one
  const toggleAssigneeDropdown = () => {
    setShowAssigneeDropdown(!showAssigneeDropdown);
    setShowTaskTypeDropdown(false); // Close task type dropdown
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (taskData.files.length + selectedFiles.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }
    setTaskData({
      ...taskData,
      files: [...taskData.files, ...selectedFiles]
    });
  };

  const removeFile = (index) => {
    const newFiles = taskData.files.filter((_, i) => i !== index);
    setTaskData({
      ...taskData,
      files: newFiles
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Subtle overlay */}
      <div 
        className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Task Title Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h3>
            
            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={taskData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter task title"
                />
              </div>

              {/* Task Type Dropdown */}
              <div className="relative" ref={taskTypeDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Type
                </label>
                <button
                  type="button"
                  onClick={toggleTaskTypeDropdown}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-gray-700">{taskData.taskType}</span>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showTaskTypeDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Task Type Dropdown Menu */}
                {showTaskTypeDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {taskTypeOptions.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTaskTypeSelect(type)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-200 ${
                          taskData.taskType === type ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignee Dropdown */}
              <div className="relative" ref={assigneeDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </label>
                <button
                  type="button"
                  onClick={toggleAssigneeDropdown}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-gray-700">{taskData.assignee}</span>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showAssigneeDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Assignee Dropdown Menu */}
                {showAssigneeDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {assigneeOptions.map((assignee) => (
                      <button
                        key={assignee}
                        type="button"
                        onClick={() => handleAssigneeSelect(assignee)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-200 ${
                          taskData.assignee === assignee ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {assignee}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-400 text-sm">(optional)</span>
            </label>
            <textarea
              name="description"
              value={taskData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="Enter task description"
            />
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Files
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="*/*"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Click to upload files
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Max 5 files, 25MB each
              </p>
              
              {/* File list */}
              {taskData.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {taskData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                      <span className="truncate flex-1">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              × Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;