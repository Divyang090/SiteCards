import React, { useState, useRef, useEffect } from 'react';

const CreateTaskModal = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  projectId,
  isInline = false,
  onCancel 
}) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    task_type: 'Simple Task',
    assignee: 'Unassigned',
    files: []
  });

  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);

  const taskTypeDropdownRef = useRef(null);
  const assigneeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (taskTypeDropdownRef.current && !taskTypeDropdownRef.current.contains(event.target)) {
        setShowTaskTypeDropdown(false);
      }
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

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('🔍 DEBUG - projectId:', projectId);
  if (!taskData.title.trim()) return;

  setUploading(true);
  try {
    // Create main task data
    const requestData = {
      task_name: taskData.title,
      description: taskData.description,
      task_type: taskData.task_type,
      project_id: String(projectId), // Ensure project_id is a string
      status: 'pending'
    };
    
    // Validate project_id is present
    if (!projectId) {
      throw new Error('Project ID is required for task creation');
    }

    // Handle assignment
    if (taskData.assignee === 'TechCorp Inc.' || taskData.assignee === 'The Martinez Family') {
      requestData.assigned_vendor = taskData.assignee;
    } else if (taskData.assignee !== 'Unassigned') {
      requestData.assigned_team = taskData.assignee;
    }

    console.log('Sending request data:', requestData);

    // Step 1: Create the task first
    const taskResponse = await fetch('http://127.0.0.1:5000/api/tasks/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData),
    });

    console.log('Task response status:', taskResponse.status);

    if (!taskResponse.ok) {
      const errorData = await taskResponse.json();
      console.error('Task creation error:', errorData);
      throw new Error(errorData.error || `Failed to create task: ${taskResponse.status}`);
    }
    
    // Parse the response data only once
    const taskResult = await taskResponse.json();
    console.log('Task created successfully:', taskResult);

    // Step 2: Upload files if any
    if (taskData.files.length > 0) {
      console.log('Uploading files:', taskData.files);
      
      for (const file of taskData.files) {
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        fileFormData.append('task_id', taskResult.id || taskResult.task_id);
        
        const fileResponse = await fetch('http://127.0.0.1:5000/api/tasks/upload', {
          method: 'POST',
          body: fileFormData,
        });

        if (!fileResponse.ok) {
          console.warn('Failed to upload file:', file.name);
        } else {
          console.log('File uploaded successfully:', file.name);
        }
      }
    }

    // Reset form
    setTaskData({
      title: '',
      description: '',
      task_type: 'Simple Task',
      assignee: 'Unassigned',
      files: []
    });
    
    onCreate(taskResult);
    
    if (!isInline && onClose) {
      onClose();
    }
    
  } catch (error) {
    console.error('Error creating task:', error);
    alert(`Failed to create task: ${error.message}`);
  } finally {
    setUploading(false);
  }
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
      task_type: type
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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (taskData.files.length + selectedFiles.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }
    
    const oversizedFiles = selectedFiles.filter(file => file.size > 25 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Some files exceed 25MB limit. Please select smaller files.');
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

  const handleCancel = () => {
    // Reset form
    setTaskData({
      title: '',
      description: '',
      task_type: 'Simple Task',
      assignee: 'Unassigned',
      files: []
    });
    
    if (isInline && onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  // If it's a modal and not open, return null
  if (!isInline && !isOpen) return null;

  // Modal wrapper
  if (!isInline) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-[1px]"
          onClick={onClose}
        ></div>
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200 flex flex-col max-h-[80vh]">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
            >
              ×
            </button>
          </div>

          {/* TASK FORM - Reusable component */}
          <TaskForm 
            taskData={taskData}
            uploading={uploading}
            showTaskTypeDropdown={showTaskTypeDropdown}
            showAssigneeDropdown={showAssigneeDropdown}
            taskTypeDropdownRef={taskTypeDropdownRef}
            assigneeDropdownRef={assigneeDropdownRef}
            taskTypeOptions={taskTypeOptions}
            assigneeOptions={assigneeOptions}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleTaskTypeSelect={handleTaskTypeSelect}
            handleAssigneeSelect={handleAssigneeSelect}
            toggleTaskTypeDropdown={toggleTaskTypeDropdown}
            toggleAssigneeDropdown={toggleAssigneeDropdown}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
            handleCancel={handleCancel}
            isInline={isInline}
          />
        </div>
      </div>
    );
  }

  // Inline form version
  return (
    <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <TaskForm 
        taskData={taskData}
        uploading={uploading}
        showTaskTypeDropdown={showTaskTypeDropdown}
        showAssigneeDropdown={showAssigneeDropdown}
        taskTypeDropdownRef={taskTypeDropdownRef}
        assigneeDropdownRef={assigneeDropdownRef}
        taskTypeOptions={taskTypeOptions}
        assigneeOptions={assigneeOptions}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleTaskTypeSelect={handleTaskTypeSelect}
        handleAssigneeSelect={handleAssigneeSelect}
        toggleTaskTypeDropdown={toggleTaskTypeDropdown}
        toggleAssigneeDropdown={toggleAssigneeDropdown}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
        handleCancel={handleCancel}
        isInline={isInline}
      />
    </div>
  );
};

// Extract the form into a separate reusable component
const TaskForm = ({
  taskData,
  uploading,
  showTaskTypeDropdown,
  showAssigneeDropdown,
  taskTypeDropdownRef,
  assigneeDropdownRef,
  taskTypeOptions,
  assigneeOptions,
  handleChange,
  handleSubmit,
  handleTaskTypeSelect,
  handleAssigneeSelect,
  toggleTaskTypeDropdown,
  toggleAssigneeDropdown,
  handleFileChange,
  removeFile,
  handleCancel,
  isInline
}) => {
return (
  <form onSubmit={handleSubmit} className={isInline ? "" : "p-6 overflow-y-auto flex-1"}>
    {!isInline && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h3>
      </div>
    )}
    
    <div className="space-y-4">
      {!isInline && (
        <>
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
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
              <span className="text-gray-700">{taskData.task_type}</span>
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
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {taskTypeOptions.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTaskTypeSelect(type)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-200 ${
                      taskData.task_type === type ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Files (Max 5 files, 25MB each)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                id="file-upload"
                accept="*/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="pointer-events-none">
                <p className="text-blue-600 font-medium text-sm">Click to upload files</p>
                <p className="text-xs text-gray-500 mt-1">Max 5 files, 25MB each</p>
              </div>

              {taskData.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {taskData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                      <span className="truncate flex-1">{file.name}</span>
                      <span className="text-gray-500 ml-2">
                        ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
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
        </>
      )}

      {/* INLINE FORM LAYOUT */}
      {isInline && (
        <>
          {/* Row 1: Task Title and Task Type side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            {/* Task Title */}
            <div>
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
            <div className="relative" ref={taskTypeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Type
              </label>
              <button
                type="button"
                onClick={toggleTaskTypeDropdown}
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm"
              >
                <span className="text-gray-700 truncate">{taskData.task_type}</span>
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
                        taskData.task_type === type ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Assignee and Description side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            {/* Assignee Dropdown */}
            <div className="relative" ref={assigneeDropdownRef}>
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <textarea
                name="description"
                value={taskData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter task description"
              />
            </div>
          </div>

          {/* Row 3: Files and Action Buttons side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Files (Max 5 files, 25MB each)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  id="file-upload"
                  accept="*/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="pointer-events-none">
                  <p className="text-blue-600 font-medium text-sm">Click to upload files</p>
                  <p className="text-xs text-gray-500 mt-1">Max 5 files, 25MB each</p>
                </div>

                {/* File list */}
                {taskData.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {taskData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="text-gray-500 ml-2">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
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
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 px-3 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !taskData.title.trim()}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Creating...' : 'Add Task'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>

    {/* Action Buttons for Modal version */}
    {!isInline && (
      <div className="p-4 border-t border-gray-100 bg-white flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={handleCancel}
          disabled={uploading}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading || !taskData.title.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Creating...' : 'Add Task'}
        </button>
      </div>
    )}
  </form>
);
};

export default CreateTaskModal;