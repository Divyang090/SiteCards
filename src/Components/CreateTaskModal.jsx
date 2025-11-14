import React, { useState, useRef, useEffect } from 'react';
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';

const CreateTaskModal = ({
  isOpen,
  onClose,
  onCreate,
  projectId,
  isInline = false,
  onCancel
}) => {
  const {showMessage, showConfirmation} = useStatusMessage();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    task_type: 'Simple Task',
    assignee: 'Unassigned',
    files: [],
    date: '',
    location: ''
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
    console.log('DEBUG - projectId:', projectId);
    if (!taskData.title.trim()) return;

    setUploading(true);
    try {
      const requestData = {
        task_name: taskData.title,
        description: taskData.description,
        task_type: taskData.task_type,
        project_id: String(projectId),
        status: 'pending',
        date: taskData.date || 'null',
        location: taskData.location || 'null'
      };

      if (!projectId) {
        throw new Error('Project ID is required for task creation');
      }

      if (taskData.assignee === 'TechCorp Inc.' || taskData.assignee === 'The Martinez Family') {
        requestData.assigned_vendor = taskData.assignee;
      } else if (taskData.assignee !== 'Unassigned') {
        requestData.assigned_team = taskData.assignee;
      }

      console.log('Sending request data:', requestData);

      const taskResponse = await fetch(`${BASE_URL}/tasks/tasks?project_id`, {
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

      const taskResult = await taskResponse.json();
      console.log('Task created successfully:', taskResult);

      if (taskData.files.length > 0) {
        console.log('Uploading files:', taskData.files);

        for (const file of taskData.files) {
          const fileFormData = new FormData();
          fileFormData.append('file', file);
          fileFormData.append('task_id', taskResult.id || taskResult.task_id);

          const fileResponse = await fetch(`${BASE_URL}/tasks/upload`, {
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

      setTaskData({
        title: '',
        description: '',
        task_type: 'Simple Task',
        assignee: 'Unassigned',
        files: [],
        date: '',
        location: ''
      });

      onCreate(taskResult, projectId);

      if (!isInline && onClose) {
        onClose();
      }

    } catch (error) {
      console.error('Error creating task:', error);
      showMessage(`Failed to create task: ${error.message}`,'success');
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
      task_type: type,
      date: type === 'Site Visits' || type === 'Meeting' ? taskData.date : '',
      location: type === 'Meeting' ? taskData.location : ''
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
      showMessage('Maximum 5 files allowed','error');
      return;
    }

    const oversizedFiles = selectedFiles.filter(file => file.size > 25 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showMessage('Some files exceed 25MB limit. Please select smaller files.','error');
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
    setTaskData({
      title: '',
      description: '',
      task_type: 'Simple Task',
      assignee: 'Unassigned',
      files: [],
      date: '',
      location: ''
    });

    if (isInline && onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  if (!isInline && !isOpen) return null;

  const formProps = {
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
  };

  if (!isInline) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-[1px]"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200 flex flex-col max-h-[80vh]">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold  theme-text-primary">Create New Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
            >
              ×
            </button>
          </div>
          <TaskForm {...formProps} />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 theme-bg-card rounded-lg border border-gray-200 p-4 shadow-sm">
      <TaskForm {...formProps} />
    </div>
  );
};

// Reusable form field components
const TextInput = ({ label, name, value, onChange, required, placeholder, isInline, autoFocus }) => (
  <div>
    <label className={`block text-sm font-medium ${isInline ? 'theme-text-secondary' : 'theme-text-primary'} mb-${isInline ? '1' : '2'}`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${isInline ? 'text-sm' : ''}`}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  </div>
);

const DropdownField = ({
  label,
  value,
  options,
  isOpen,
  dropdownRef,
  onToggle,
  onSelect,
  isInline
}) => (
  <div className="relative" ref={dropdownRef}>
    <label className={`block text-sm font-medium ${isInline ? 'theme-text-secondary' : 'text-gray-700'} mb-${isInline ? '1' : '2'}`}>
      {label}
    </label>
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-${isInline ? '2' : '3'} border border-gray-300 rounded-lg ${isInline ? 'theme-bg-card hover:bg-gray-50' : 'bg-white hover:bg-gray-50'} transition-colors duration-200 ${isInline ? 'text-sm' : ''}`}
    >
      <span className={isInline ? "text-gray-500 truncate" : "text-gray-700"}>{value}</span>
      <svg
        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {isOpen && (
      <div className={`absolute z-20 w-full mt-1 ${isInline ? 'theme-bg-card' : 'bg-white'} border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-hidden`}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`w-full text-left px-${isInline ? '3' : '4'} py-2 hover:bg-gray-500 transition-colors duration-200 text-sm ${value === option ? 'bg-blue-50 text-blue-600' : (isInline ? 'theme-text-primary' : 'text-gray-700')
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    )}
  </div>
);

const TextArea = ({ label, name, value, onChange, placeholder, isInline }) => (
  <div>
    <label className={`block text-sm font-medium ${isInline ? 'theme-text-secondary' : 'text-gray-700'} mb-${isInline ? '1' : '2'}`}>
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${isInline ? 'text-sm' : ''}`}
      placeholder={placeholder}
    />
  </div>
);

const FileUpload = ({ files, onFileChange, onRemoveFile, isInline }) => (
  <div>
    <label className={`block text-sm font-medium ${isInline ? 'theme-text-secondary' : 'text-gray-700'} mb-${isInline ? '1' : '2'}`}>
      Add Files (Max 5 files, 25MB each)
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
      <input
        type="file"
        multiple
        onChange={onFileChange}
        id="file-upload"
        accept="*/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="pointer-events-none">
        <p className="text-blue-600 font-medium text-sm">Click to upload files</p>
        <p className="text-xs text-gray-500 mt-1">Max 5 files, 25MB each</p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
              <span className="truncate flex-1">{file.name}</span>
              <span className="text-gray-500 ml-2">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
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
);

const ActionButtons = ({ uploading, onCancel, taskTitle, isInline }) => (
  <div className={`flex items-end mt-10 gap-2 ${!isInline ? 'p-4 border-t border-gray-100 bg-white flex justify-end space-x-3 mt-6' : ''}`}>
    <button
      type="button"
      onClick={onCancel}
      disabled={uploading}
      className={`px-${isInline ? '3' : '4'} py-2 text-gray-600 hover:text-gray-800 font-medium ${isInline ? 'border border-gray-300 rounded-lg hover:bg-gray-50' : ''} transition-colors duration-200 disabled:opacity-50 ${isInline ? 'flex-1' : ''}`}
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={uploading || !taskTitle.trim()}
      className={`px-${isInline ? '3' : '4'} py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isInline ? 'flex-1' : ''}`}
    >
      {uploading ? 'Creating...' : 'Add Task'}
    </button>
  </div>
);

// Conditional fields for selecting task type
const ConditionalFields = ({ taskType, taskData, handleChange, isInline }) => {
  if (taskType === 'Site Visits') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${isInline ? 'theme-text-secondary' : 'text-gray-700'} mb-${isInline ? '1' : '2'}`}>
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={taskData.date}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${isInline ? 'text-sm' : ''}`}
          />
        </div>
        {/* Empty div to maintain grid structure - location hidden for Site Visits */}
        <div></div>
      </div>
    );
  }

  if (taskType === 'Meeting') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${isInline ? 'theme-text-secondary' : 'text-gray-700'} mb-${isInline ? '1' : '2'}`}>
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={taskData.date}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${isInline ? 'text-sm' : ''}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isInline ? 'theme-text-secondary' : 'text-gray-700'} mb-${isInline ? '1' : '2'}`}>
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={taskData.location}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${isInline ? 'text-sm' : ''}`}
            placeholder="Enter meeting location"
          />
        </div>
      </div>
    );
  }

  return null;
};

// Main TaskForm component
const TaskForm = (props) => {
  const { isInline, taskData, uploading, showTaskTypeDropdown, showAssigneeDropdown } = props;

  return (
    <form onSubmit={props.handleSubmit} className={isInline ? "" : "p-6 overflow-y-auto scrollbar-hidden flex-1"}>
      {!isInline && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold theme-text-primary mb-4">Task Details</h3>
        </div>
      )}

      <div className="space-y-4">
        {!isInline ? (
          // Modal layout
          <>
            <TextInput
              label="Task title"
              name="title"
              value={taskData.title}
              onChange={props.handleChange}
              required={true}
              placeholder="Enter task title"
              isInline={false}
            />

            <DropdownField
              label="Task Type"
              value={taskData.task_type}
              options={props.taskTypeOptions}
              isOpen={showTaskTypeDropdown}
              dropdownRef={props.taskTypeDropdownRef}
              onToggle={props.toggleTaskTypeDropdown}
              onSelect={props.handleTaskTypeSelect}
              isInline={false}
            />

            <DropdownField
              label="Assigned to"
              value={taskData.assignee}
              options={props.assigneeOptions}
              isOpen={showAssigneeDropdown}
              dropdownRef={props.assigneeDropdownRef}
              onToggle={props.toggleAssigneeDropdown}
              onSelect={props.handleAssigneeSelect}
              isInline={false}
            />

            <TextArea
              label="Description"
              name="description"
              value={taskData.description}
              onChange={props.handleChange}
              placeholder="Enter task description"
              isInline={false}
            />
            {/* Conditional fields for task_type dropdown */}
            <ConditionalFields
              taskType={taskData.task_type}
              taskData={taskData}
              handleChange={props.handleChange}
              isInline={false}
            />

            <FileUpload
              files={taskData.files}
              onFileChange={props.handleFileChange}
              onRemoveFile={props.removeFile}
              isInline={false}
            />
          </>
        ) : (
          // Inline layout
          <>
            {/* Row 1: Title (2/4), Task Type (1/4), Assignee (1/4) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
              <div className="md:col-span-2">
                <TextInput
                  label="Task title"
                  name="title"
                  value={taskData.title}
                  onChange={props.handleChange}
                  required={true}
                  placeholder="Enter task title"
                  isInline={true}
                  autoFocus={true}
                />
              </div>

              <div className="md:col-span-1">
                <DropdownField
                  label="Task Type"
                  value={taskData.task_type}
                  options={props.taskTypeOptions}
                  isOpen={showTaskTypeDropdown}
                  dropdownRef={props.taskTypeDropdownRef}
                  onToggle={props.toggleTaskTypeDropdown}
                  onSelect={props.handleTaskTypeSelect}
                  isInline={true}
                />
              </div>

              <div className="md:col-span-1">
                <DropdownField
                  label="Assigned to"
                  value={taskData.assignee}
                  options={props.assigneeOptions}
                  isOpen={showAssigneeDropdown}
                  dropdownRef={props.assigneeDropdownRef}
                  onToggle={props.toggleAssigneeDropdown}
                  onSelect={props.handleAssigneeSelect}
                  isInline={true}
                />
              </div>
            </div>

            {/* Conditional Fields Row - Use the component instead of manual fields */}
            <ConditionalFields
              taskType={taskData.task_type}
              taskData={taskData}
              handleChange={props.handleChange}
              isInline={true}
            />

            {/* Description Row */}
            <div>
              <TextArea
                label="Description"
                name="description"
                value={taskData.description}
                onChange={props.handleChange}
                placeholder="Enter task description"
                isInline={true}
              />
            </div>

            {/* Files and Action Buttons Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              <FileUpload
                files={taskData.files}
                onFileChange={props.handleFileChange}
                onRemoveFile={props.removeFile}
                isInline={true}
              />

              <ActionButtons
                uploading={uploading}
                onCancel={props.handleCancel}
                taskTitle={taskData.title}
                isInline={true}
              />
            </div>
          </>
        )}
      </div>

      {!isInline && (
        <ActionButtons
          uploading={uploading}
          onCancel={props.handleCancel}
          taskTitle={taskData.title}
          isInline={false}
        />
      )}
    </form>
  );
};

export default CreateTaskModal;