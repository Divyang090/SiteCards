import React, { useState } from 'react';

const SiteMapUploadModal = ({ onClose, onSubmit, isUploading }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    file: null
  });

  const categories = [
    'Floor Plan',
    'Electrical',
    'Plumbing',
    'Structural',
    'Landscape'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category || !formData.file) {
      alert('Please fill all fields and select a file');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-opacity-50 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>

      <div className="relative theme-bg-secondary rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold theme-text-primary">Upload Site Map</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Site Map Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter site map name"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 theme-bg-card theme-text-secondary border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-500 transition-colors duration-200"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category} className="theme-bg-card theme-text-secondary">
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium theme-text-secondary mb-2'>
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Description here"
              />

            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, PDF (Max 10MB)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteMapUploadModal;