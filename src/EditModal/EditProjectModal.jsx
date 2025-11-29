import React, { useState, useEffect } from 'react'
import { BASE_URL } from '../Configuration/Config';
import { useAuth } from "../Components/AuthContext";

const EditProjectModal = ({ isOpen, onClose, project, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        assignee: '',
        location: '',
        description: '',
        dueDate: '',
        status: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { authFetch } = useAuth();

    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title || '',
                assignee: project.assignee || '',
                location: project.location || '',
                description: project.description || '',
                //setting it +1 day to not move 1 day earlier when editing the project 
                dueDate: project.docDate && project.docDate !== 'No date' ?
                    (() => {
                        const date = new Date(project.docDate);
                        date.setDate(date.getDate() + 1);
                        return date.toISOString().split('T')[0];
                    })() : '',
                status: project.status || '',
            });
            setError('');
        }
    }, [project, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.title.trim() || !formData.assignee.trim()) {
                throw new Error('Project title and client name are required');
            }

            const updateData = {
                project_name: formData.title,
                client_name: formData.assignee,
                location: formData.location,
                project_description: formData.description,
                due_date: formData.dueDate,
                status: formData.status
            };

            const response = await authFetch(`${BASE_URL}/projects/projects/${project.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to update project: ${response.status}`);
            }

            const updatedProject = await response.json();
            onSave(updatedProject);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !project) return null;

    return (
        <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]'>
            <div className='theme-bg-card rounded-lg max-w-md w-full p-6'>
                <h2 className='text-xl font-bold mb-4'>
                    Edit Project
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className='space-y-4'>
                        {/* Project Title */}
                        <div>
                            <label className="block text-sm font-medium theme-text-primary mb-1">
                                Project Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                required
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                                placeholder="Enter project title"
                            />
                        </div>

                        {/* Client Name */}
                        <div>
                            <label className="block text-sm font-medium theme-text-primary mb-1">
                                Client Name *
                            </label>
                            <input
                                type="text"
                                name="assignee"
                                value={formData.assignee}
                                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                                required
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                                placeholder="Enter client name"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium theme-text-primary mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                                placeholder="Enter location"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium theme-text-primary mb-1">
                                Status *
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                disabled={loading}
                                className="w-full px-3 py-2 theme-bg-secondary border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                            >
                                <option value="Planning">Planning</option>
                                <option value="progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium theme-text-primary mb-1">
                                Due Date *
                            </label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                required
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium theme-text-primary mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
                                placeholder="Enter project description"
                            />
                        </div>
                    </div>

                    {error && <div className='text-red-600 text-sm mt-2'>{error}</div>}
                    <div className='flex justify-end gap-3 mt-6'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='px-4 py-2 text-gray-400 hover:text-gray-600'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
                        >
                            {loading ? 'Updating...' : 'Update Project'}
                        </button>
                    </div>
                </form>

            </div >
        </div >
    );

};
export default EditProjectModal;