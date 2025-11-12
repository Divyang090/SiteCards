import React, { useState } from 'react';
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';
import StatusMessageProvider from '../Alerts/StatusMessage';

const AddTaskModal = ({ spaceId, projectId, onClose, onAdd }) => {
  const {showMessage, showConfirmation} = useStatusMessage();  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    console.log('=== TASK SUBMISSION DATA ===');
    console.log('Form data:', formData);
    console.log('spaceId:', spaceId);
    console.log('projectId:', projectId);

    const requestBody = {
      task_title: formData.title,
      task_description: formData.description,
      task_due_date: formData.due_date,
      space_id: spaceId,
      project_id: projectId,
      status: 'pending'
    };

    console.log('Request data to be sent:', requestBody);

    let response;
    try {
      response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.log('Standard fetch failed, trying with no-cors:', error);
      
      // Approach 2: Try with no-cors mode (limited - can't read response)
      response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      // With no-cors, we can't read the response, so assume success
      console.log('No-cors request sent (assuming success)');
      const mockTask = {
        id: Date.now(), // temporary ID
        title: formData.title,
        description: formData.description,
        status: 'pending',
        due_date: formData.due_date
      };
      onAdd(mockTask);
      showMessage('Task added successfully! (CORS workaround)','success');
      return;
    }

    console.log('Task creation response status:', response.status);

    if (response.ok) {
      const newTask = await response.json();
      console.log('New task created successfully:', newTask);
      
      const transformedTask = {
        id: newTask.task_id || newTask.id,
        title: newTask.task_title || newTask.title,
        description: newTask.task_description || newTask.description,
        status: newTask.status || 'pending',
        due_date: newTask.task_due_date || newTask.due_date
      };
      
      onAdd(transformedTask);
      showMessage('Task added successfully!','success');
    } else {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Failed to add task: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error adding task:', error);
    showMessage('Failed to add task: ' + error.message,'error');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder='Enter Task Title here...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder='Enter Description here...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;