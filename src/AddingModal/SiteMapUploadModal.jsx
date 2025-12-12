import React, { useState } from 'react';
import { useStatusMessage } from '../Alerts/StatusMessage';
import { useAuth } from "../Components/AuthContext";
import { motion } from "framer-motion";

const SiteMapUploadModal = ({ onClose, onSubmit, isUploading }) => {
  const { showConfirmation, showMessage } = useStatusMessage();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    file: null
  });
  const [open, setOpen] = useState(false);

  const categories = [
    'Custom',
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
    if (!formData.name.trim() || !formData.category) {
      ('Please fill all fields and select a file');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute modal-enter modal-enter-active inset-0 bg-opacity-50 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>

      <div className="relative theme-bg-secondary rounded-lg w-full max-w-md mx-4 shadow-2xl animate-fadeInUp">
        <div className="flex justify-between items-center md:p-4 p-2 border-b border-gray-100">
          <h2 className="text-xl font-semibold theme-text-primary">Upload Site Map</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-2 md:p-4">
          <div className="space-y-4 pb-3">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Site Map Name
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
            <div className="w-[150px]">
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Category
              </label>

              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className=" w-full px-3 py-2 theme-bg-card theme-text-secondary  border border-gray-300 rounded-2xl cursor-pointer  flex justify-between items-center"
                >
                  {formData.category || "Category"}
                  <motion.svg
                    initial={{ rotate: 0 }}
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 theme-text-secondary"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </motion.svg>
                </button>

                {open && (
                  <div
                    className="absolute mt-2 w-full  theme-bg-card border border-gray-300  rounded-2xl shadow-lg z-50  max-h-40 overflow-y-auto scrollbar-hidden"
                  >
                    {categories.map(category => (
                      <div
                        key={category}
                        onClick={() => {
                          handleChange({ target: { name: "category", value: category } });
                          setOpen(false);
                        }}
                        className=" px-4 py-2 theme-text-secondary  hover:bg-gray-400 cursor-pointer  rounded-xl mx-1 my-1 transition"
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* <div>
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

            </div> */}

            {/* File Upload */}
            {/* <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                File
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, PDF (Max 10MB)
              </p>
            </div> */}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
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