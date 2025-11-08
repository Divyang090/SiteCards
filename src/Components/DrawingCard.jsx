import React, { useContext } from 'react';
import { useStatusMessage } from '../Alerts/StatusMessage';
import StatusMessageProvider from '../Alerts/StatusMessage';

const DrawingCard = ({ file, onEdit, onDelete }) => {

  const {showConfirmation} = useStatusMessage();
  // console.log('showDelete function', showDelete);

const handleDelete = () => {
  console.log('File object:', file);
  console.log('Available file properties:', Object.keys(file));
  
  // Try different possible ID properties
  const drawingId = file.drawing_id || file.id || file.file_id;
  console.log('Drawing ID to delete:', drawingId);
  const drawingName = file.drawing_name;

  if (!drawingId) {
    console.error('No valid ID found for deletion');
    return;
  }
  
  showConfirmation(
    'Delete Drawing',
    `Are you sure you want to delete "${drawingName}"? This action cannot be undone`,
    () => onDelete(drawingId)
  );
};

  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="theme-border-light rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {file.file_type?.includes('image') || file.type === 'image' ? (
          <img
            src={file.file_url || file.url || file.file_path}
            alt={file.drawing_name || file.name}
            onClick={() => window.open(file.file_url || file.url, 'blank')}
            className="w-full h-full object-cover cursor-pointer"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <span className="text-4xl">{getFileIcon(file.file_type || file.type)}</span>
          </div>
        )}
        
        {/* Hover Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(file);
            }}
            className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors duration-200"
            title="Edit"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700 transition-colors duration-200"
            title="Delete"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* File Info */}
      <div className="p-4">
        <h3 className="font-semibold theme-text-primary text-lg mb-1 truncate">
          {file.drawing_name || file.name || file.filename}
        </h3>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span>{formatFileSize(file.file_size || file.size)}</span>
          <span>{formatDate(file.created_at || file.date)}</span>
        </div>
        <button
          onClick={() => window.open(file.file_url || file.url || file.file_path, '_blank')}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default DrawingCard;