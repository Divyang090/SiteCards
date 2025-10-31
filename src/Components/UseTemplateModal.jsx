import React, { useState } from 'react';

const UseTemplateModal = ({ template, onClose, onSave }) => {
  const [projectData, setProjectData] = useState({
    project_name: `${template.title} Project`,
    description: template.description,
    location: '',
    client_name: '',
    start_date: '',
    end_date: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Include template data for backend to create tasks/cards
      const saveData = {
        ...projectData,
        template_id: template.template_id || template.id,
        template_data: {
          includedCards: template.includedCards,
          files: template.files || []
        }
      };
      
      await onSave(saveData);
    } catch (error) {
      console.error('Error creating project from template:', error);
      alert('Failed to create project from template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative theme-bg-primary rounded-lg shadow-xl w-full max-w-2xl mx-4 border theme-border max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b theme-border">
          <h2 className="text-xl font-semibold theme-text-primary">Create Project from Template</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Template Preview */}
            <div className="theme-bg-secondary rounded-lg p-4 theme-border">
              <h3 className="font-semibold theme-text-primary mb-2">Template: {template.title}</h3>
              <p className="theme-text-secondary text-sm">{template.description}</p>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="project_name"
                  value={projectData.project_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 theme-border rounded-lg theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  name="client_name"
                  value={projectData.client_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 theme-border rounded-lg theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={projectData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 theme-border rounded-lg theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={projectData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 theme-border rounded-lg theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Project Description
              </label>
              <textarea
                name="description"
                value={projectData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 theme-border rounded-lg theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project description"
              />
            </div>

            {/* Included Cards Preview */}
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-3">
                Included Cards (will be created automatically)
              </label>
              <div className="theme-bg-secondary rounded-lg p-4 theme-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {template.includedCards.map((card, index) => (
                    <div key={index} className="theme-bg-primary rounded p-3 theme-border">
                      <div className="flex items-start space-x-2">
                        <span className="text-sm theme-text-secondary bg-blue-100 px-2 py-1 rounded capitalize">
                          {card.type}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-medium theme-text-primary text-sm">{card.title}</h4>
                          <p className="theme-text-secondary text-xs mt-1">{card.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Files Preview */}
            {template.files && template.files.length > 0 && (
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-3">
                  Template Files (will be included)
                </label>
                <div className="theme-bg-secondary rounded-lg p-4 theme-border">
                  <div className="space-y-2">
                    {template.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between theme-bg-primary rounded p-2 theme-border">
                        <span className="theme-text-primary text-sm truncate">
                          {typeof file === 'string' ? file : file.name}
                        </span>
                        <span className="theme-text-secondary text-xs">
                          {typeof file !== 'string' && file.size ? `(${(file.size / 1024 / 1024).toFixed(2)} MB)` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 theme-text-secondary hover:theme-text-primary font-medium transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UseTemplateModal;