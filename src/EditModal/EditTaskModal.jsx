import React, { useState, useEffect, useRef } from "react";
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';

const EditTaskModal = ({ task, spaceId, projectId, onClose, onUpdate, isInline = false }) => {
  const { showMessage, showFailed } = useStatusMessage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'Simple Task',
    assignee: 'Unassigned',
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
        assignee: task.assignee || task.assigned_team || task.assigned_vendor || 'Unassigned',
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
    'Mike Wilson'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const taskId = task.id || task.task_id;
      const requestData = {
        task_name: formData.title,
        description: formData.description,
        task_type: formData.task_type,
        project_id: String(projectId),
        status: formData.status,
        date: formData.date || 'null',
        location: formData.location || 'null'
      };

      if (formData.assignee === 'TechCorp Inc.' || formData.assignee === 'The Martinez Family') {
        requestData.assigned_vendor = formData.assignee;
      } else if (formData.assignee !== 'Unassigned') {
        requestData.assigned_team = formData.assignee;
      }

      const response = await fetch(`${BASE_URL}/tasks/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        onUpdate(updatedTask);
        showMessage('Task updated successfully!', 'success');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to update task: ${response.status} - ${errorText}`);
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

  const handleAssigneeSelect = (assignee) => {
    setFormData({
      ...formData,
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
                label="Task title"
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
                label="Task Type"
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
                label="Assigned to"
                value={formData.assignee}
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
              label="Description"
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
      {label} {required && <span className="text-red-500">*</span>}
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
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
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
  if (taskType === 'Site Visits') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium theme-text-secondary mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium theme-text-secondary mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium theme-text-secondary mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
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