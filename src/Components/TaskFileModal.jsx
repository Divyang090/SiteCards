import React from 'react';
import { BASE_URL } from '../Configuration/Config';

const TaskFileModal = ({
  isOpen,
  onClose,
  files = [],
  taskTitle = ''
}) => {
  if (!isOpen) return null;

  //Download handler
  const handleDownload = (file) => {
    if (file.file_path && file.filename) {
      const downloadUrl = `${file.file_path}`;
      window.open(downloadUrl, '_blank');
      return;
    }

    // Original logic for other file types
    if (typeof file === 'string') {
      window.open(file, '_blank');
      return;
    }

    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // View handler
  const handleView = (file) => {
    // Handle backend file objects
    if (file.file_path && file.filename) {
      const viewUrl = `${file.file_path}`; // You might need your base URL here
      window.open(viewUrl, '_blank');
      return;
    }

    // Original logic for other file types
    if (typeof file === 'string') {
      window.open(file, '_blank');
      return;
    }

    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    }
  };

  //FileIcon
  const getFileIcon = (file) => {
    let fileName = '';

    // Handle backend file objects
    if (file.filename) {
      fileName = file.filename;
    } else if (typeof file === 'string') {
      fileName = file;
    } else if (file instanceof File) {
      fileName = file.name;
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📎';
    }
  };

  //FileName
  const getFileName = (file) => {
    // Handle backend file objects
    if (file.filename) {
      return file.filename;
    }

    // Original logic
    if (typeof file === 'string') {
      return file.split('/').pop() || 'File';
    }
    if (file instanceof File) {
      return file.name;
    }
    return 'Unknown File';
  };

  //FileSize
  const getFileSize = (file) => {
    // Handle backend file objects
    if (file.file_size) {
      const sizeInMB = parseFloat(file.file_size);
      return sizeInMB < 1
        ? `${(sizeInMB * 1024).toFixed(2)} KB`
        : `${sizeInMB.toFixed(2)} MB`;
    }

    // Original logic
    if (file instanceof File) {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB < 1
        ? `${(file.size / 1024).toFixed(2)} KB`
        : `${sizeInMB.toFixed(2)} MB`;
    }
    return 'Unknown size';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0  bg-opacity-80 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="animate-fadeInUp relative theme-bg-card rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-gray-200 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100">
          <div>
            <h2 className="text-xl px-1 font-semibold theme-text-primary">
              Files
            </h2>
            {taskTitle && (
              <p className="text-sm px-1 theme-text-secondary">
                For task : {taskTitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
          >
            ×
          </button>
        </div>

        {/* Files List */}
        <div className="p-3 overflow-y-auto flex-1">
          {files.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium theme-text-primary mb-2">No files</h3>
              <p className="text-gray-500 text-sm">This task has no attached files.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-2xl transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{getFileIcon(file)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium theme-text-primary text-sm truncate">
                        {getFileName(file)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {getFileSize(file)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(file)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TaskFileModal;