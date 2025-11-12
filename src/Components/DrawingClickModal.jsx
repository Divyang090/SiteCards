import React from 'react';
import { BASE_URL } from '../Configuration/Config';

const DrawingClickModal = ({ drawing, onClose }) => {
  if (!drawing) return null;

  const getFileUrl = (fileObj) => {
    const actualFile = fileObj.files?.[0] || fileObj;
    let filePath = actualFile.file_path || actualFile.file_url || '';
    filePath = filePath.replace(/\\/g, '/');
    
    if (filePath && !filePath.startsWith('http')) {
      return `${BASE_URL}/${filePath}`;
    }
    return filePath;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fileUrl = getFileUrl(drawing);

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
    onClick={onClose}>
      <div className="theme-bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
      onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <h2 className="md:text-2xl text-xl font-bold">{drawing.drawing_name || drawing.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className='h-px bg-gray-500 w-full'></div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Image */}
          <div className="mb-6">
            <img 
              src={fileUrl} 
              alt={drawing.drawing_name || drawing.name}
              className="max-w-full max-h-96 object-contain mx-auto rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden text-center p-8 border border-dashed border-gray-500 rounded-lg">
              <span className="text-6xl">📎</span>
              <p className="mt-2 text-gray-600">File preview not available</p>
            </div>
          </div>

          {/* Description */}
          {drawing.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{drawing.description}</p>
            </div>
          )}

          {/* Date */}
          <div className="text-sm text-gray-500">
            <strong>Uploaded:</strong> {formatDate(drawing.created_at || drawing.uploaded_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingClickModal;