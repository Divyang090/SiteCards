import React, { useState, useEffect, useRef } from "react";
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';

const EditTaskModal = ({ task, spaceId, projectId, onClose, onUpdate, isInline = false }) => {
  const { showMessage, showFailed } = useStatusMessage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'Simple Task',
    assigned_to: 'Unassigned',
    files: [],
    date: '',
    location: '',
    status: 'pending'
  });

  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const taskTypeDropdownRef = useRef(null);
  const assigneeDropdownRef = useRef(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || task.task_name || '',
        description: task.description || '',
        task_type: task.task_type || 'Simple Task',
        assigned_to: task.assignee || task.assigned_team || task.assigned_vendor || 'Unassigned',
        files: task.files || [],
        date: task.date || task.due_date || '',
        location: task.location || '',
        status: task.status || 'pending'
      });
    }
  }, [task]);

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
    'Mike Wilson',
    'Coci'
  ];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (formData.files.length + selectedFiles.length > 5) {
      showMessage('Maximum 5 files allowed', 'error');
      return;
    }

    const oversizedFiles = selectedFiles.filter(file => file.size > 25 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showMessage('Some files exceed 25MB limit. Please select smaller files.', 'error');
      return;
    }

    setFormData({
      ...formData,
      files: [...formData.files, ...selectedFiles]
    });
  };

  const removeFile = (index) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      files: newFiles
    });
  };

  const FileUpload = ({ files, onFileChange, onRemoveFile, isInline }) => (
    <div>
      <label className="block text-sm font-medium theme-text-secondary mb-1">
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
              <div key={index} className="flex items-center justify-between text-xs theme-bg-primary p-2 rounded-xl">
                <span className="truncate flex-1 theme-text-secondary">{file.name}</span>
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

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const taskId = task.id || task.task_id;

    // Basic validation
    if (!formData.title.trim()) {
      showMessage('Task title is required', 'error');
      setIsLoading(false);
      return;
    }

    const submitFormData = new FormData();

    // Append all fields as form data
    submitFormData.append('task_name', formData.title.trim());
    submitFormData.append('description', formData.description || '');
    submitFormData.append('task_type', formData.task_type.toLowerCase());
    submitFormData.append('project_id', String(projectId));
    submitFormData.append('status', formData.status);

    // Append conditional fields if they exist
    if (formData.date) {
      submitFormData.append('date', formData.date);
    }

    if (formData.location && formData.location.trim()) {
      submitFormData.append('location', formData.location.trim());
    }

    // Handle assignment
    if (formData.assigned_to && formData.assigned_to !== 'Unassigned') {
      submitFormData.append('assigned_to', formData.assigned_to);
    }

    // Handle files - separate new files from existing files
    const newFiles = [];
    const existingFiles = [];

    formData.files.forEach(file => {
      if (file instanceof File) {
        // This is a new file uploaded by user
        newFiles.push(file);
        submitFormData.append('files', file);
      } else {
        // This is an existing file from backend (object with file info)
        existingFiles.push(file);
      }
    });

    // If you need to track existing files for the backend, you might need to send them too
    // This depends on your backend API requirements
    submitFormData.append('existing_files', JSON.stringify(existingFiles));

    // Debug: Log FormData contents
    console.log('DEBUG - Edit FormData contents:');
    for (let [key, value] of submitFormData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, value.name, `(File: ${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    const response = await fetch(`${BASE_URL}/tasks/tasks/${taskId}`, {
      method: 'PUT',
      body: submitFormData,
    });

    console.log('DEBUG - Edit response status:', response.status);

    if (response.ok) {
      const updatedTask = await response.json();
      console.log('DEBUG - Task updated successfully:', updatedTask);
      onUpdate(updatedTask);
      showMessage('Task updated successfully!', 'success');
      onClose();
    } else {
      const errorText = await response.text();
      console.error('DEBUG - Edit error response:', errorText);
      throw new Error(`Failed to update task: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating task:', error);
    showFailed('Failed to update task: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTaskTypeSelect = (type) => {
    setFormData({
      ...formData,
      task_type: type,
      date: type === 'Site Visits' || type === 'Meeting' ? formData.date : '',
      location: type === 'Meeting' ? formData.location : ''
    });
    setShowTaskTypeDropdown(false);
  };

  const handleAssigneeSelect = (assigned_to) => {
    setFormData({
      ...formData,
      assigned_to: assigned_to
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

  if (!task) return null;

  // INLINE FORM RENDERING
  if (isInline) {
    return (
      <div className="mb-6 theme-bg-card rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="text-lg font-semibold theme-text-primary mb-4">Edit Task</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
            <div className="md:col-span-2">
              <TextInput
                name="title"
                value={formData.title}
                onChange={handleChange}
                required={true}
                placeholder="Enter task title"
                isInline={true}
                autoFocus={true}
              />
            </div>

            <div className="md:col-span-1">
              <DropdownField
                value={formData.task_type}
                options={taskTypeOptions}
                isOpen={showTaskTypeDropdown}
                dropdownRef={taskTypeDropdownRef}
                onToggle={toggleTaskTypeDropdown}
                onSelect={handleTaskTypeSelect}
                isInline={true}
              />
            </div>

            <div className="md:col-span-1">
              <DropdownField
                value={formData.assigned_to}
                options={assigneeOptions}
                isOpen={showAssigneeDropdown}
                dropdownRef={assigneeDropdownRef}
                onToggle={toggleAssigneeDropdown}
                onSelect={handleAssigneeSelect}
                isInline={true}
              />
            </div>
          </div>

          <ConditionalFields
            taskType={formData.task_type}
            formData={formData}
            handleChange={handleChange}
            isInline={true}
          />

          <div>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              isInline={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2  gap-3 items-start">
            <FileUpload
              files={formData.files}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
              isInline={true}
            />

            <div className="mt-9">
              <ActionButtons
                isLoading={isLoading}
                onCancel={onClose}
                taskTitle={formData.title}
                isInline={true}
                isEdit={true}
              />
            </div>
          </div>
        </form>
      </div>
    );
  }

  // MODAL RENDERING (fallback)
  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Edit Task</h2>
        <form onSubmit={handleSubmit}>
          {/* ... your existing modal form ... */}
        </form>
      </div>
    </div>
  );
};

// Reusable Components (same as CreateTaskModal)
const TextInput = ({ label, name, value, onChange, required, placeholder, isInline, autoFocus }) => (
  <div>
    <label className={`block text-sm font-medium theme-text-secondary mb-1`}>
      {label} {required && <span className="text-red-500"></span>}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  </div>
);

const DropdownField = ({ label, value, options, isOpen, dropdownRef, onToggle, onSelect, isInline }) => (
  <div className="relative" ref={dropdownRef}>
    <label className="block text-sm font-medium theme-text-secondary mb-1">
      {label}
    </label>
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg theme-bg-card hover:bg-gray-50 transition-colors duration-200 text-sm"
    >
      <span className="text-gray-500 truncate">{value}</span>
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
      <div className="absolute z-20 w-full mt-1 theme-bg-card border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-hidden">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`w-full text-left px-3 py-2 hover:bg-gray-500 transition-colors duration-200 text-sm ${value === option ? 'bg-blue-50 text-blue-600' : 'theme-text-primary'}`}
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
    <label className="block text-sm font-medium theme-text-secondary mb-1">
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      className="w-full h-9 mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
      placeholder={placeholder}
    />
  </div>
);

const ActionButtons = ({ isLoading, onCancel, taskTitle, isInline, isEdit }) => (
  <div className="flex items-end gap-2">
    <button
      type="button"
      onClick={onCancel}
      disabled={isLoading}
      className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 flex-1"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isLoading || !taskTitle.trim()}
      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
    >
      {isLoading ? 'Updating...' : 'Update Task'}
    </button>
  </div>
);

const ConditionalFields = ({ taskType, formData, handleChange, isInline }) => {
  // Convert date to datetime-local format if needed
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    // If it's already in datetime-local format, return as is
    if (dateString.includes('T')) {
      return dateString;
    }

    // Otherwise convert from backend format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Invalid date

    return date.toISOString().slice(0, 16);
  };

  if (taskType === 'Site Visits') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 mt-3 gap-3">
        <div>
          <input
            type="datetime-local"
            name="date"
            value={formatDateForInput(formData.date)}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
          />
        </div>
        <div></div>
      </div>
    );
  }

  if (taskType === 'Meeting') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div>
          <input
            type="datetime-local"
            name="date"
            value={formatDateForInput(formData.date)}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
          />
        </div>
        <div>
          <input
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
            placeholder="Enter meeting location"
          />
        </div>
      </div>
    );
  }

  return null;
};

export default EditTaskModal;