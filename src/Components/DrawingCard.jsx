import React, { useContext } from 'react';
import { useStatusMessage } from '../Alerts/StatusMessage';
import StatusMessageProvider from '../Alerts/StatusMessage';
import { BASE_URL } from '../Configuration/Config';
import DrawingClickModal from './DrawingClickModal';

//Check Backend for files preview

const DrawingCard = ({ file, onEdit, onDelete, onClick }) => {
  const actualFile = file.files?.[0] || file;
  const { showConfirmation } = useStatusMessage();
  // console.log('showDelete function', showDelete);
  // console.log('=========Debug Drawing Data===============')
  // console.log('File data:', file);
  // console.log('File data(first file)', actualFile)
  // console.log('File type:', actualFile.file_type);
  // console.log('File URL:', actualFile.file_url || actualFile.url || actualFile.file_path);
  // console.log('files array', file.files)
  // console.log('==============================')
  const handleDelete = () => {
    // console.log('File object:', file);
    // console.log('Available file properties:', Object.keys(file));

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

  const getFileType = (fileObj) => {
    const actualFile = fileObj.files?.[0] || fileObj;

    // Check filename extension since file_type is undefined
    const filename = actualFile.filename || actualFile.drawing_name || '';
    const filePath = actualFile.file_path || actualFile.file_url || '';

    // Check both filename and file path for image extensions
    if (filename.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ||
      filePath.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
      return 'image';
    }

    if (filename.match(/\.pdf$/i) || filePath.match(/\.pdf$/i)) {
      return 'pdf';
    }

    return 'other';
  };

  // Fix the file URL - convert to proper URL and fix backslashes
  const getFileUrl = (fileObj) => {
    const actualFile = fileObj.files?.[0] || fileObj;
    const fileId = actualFile.file_id;
    const drawingId = fileObj.drawing_id;

    // Use the API endpoint to get the file
    if (fileId && drawingId) {
      return `${BASE_URL}/drawings/get?file_id=${fileId}&drawing_id=${drawingId}`;
    }

    return '#';
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    return '📎';
  };

  const formatFileSize = (fileObj) => {
    const actualFile = fileObj.files?.[0] || fileObj;
    const bytes = actualFile.file_size || actualFile.size;

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
    <div className="theme-border-light rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
      onClick={() => onClick && onClick(file)}
    >
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {getFileType(file) === 'image' ? (
          <img
            src={getFileUrl(file)}
            alt={file.drawing_name || file.name}
            onClick={() => window.open(getFileUrl(file), 'blank')}
            className="w-full h-full object-cover cursor-pointer"
            onError={(e) => {
              console.log('Image Failed to load', getFileUrl(file), 'blank')
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <span className="text-4xl">{getFileIcon(getFileType(file))}</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 
              2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
        <div className="flex justify-start gap-1 items-center text-xs text-gray-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className='mr-2'>{formatDate(file.uploaded_at)}</span>
          {file.description && (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M4 2h12l4 4v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm12 1.5V6h2.5L16 3.5zM4 4v16h14V8h-4V4H4z" />
              </svg>
              <span>Note</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawingCard;