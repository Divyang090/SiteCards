import React from 'react';

const TaskFileModal = ({ 
  isOpen, 
  onClose, 
  files = [], 
  taskTitle = '' 
}) => {
  if (!isOpen) return null;

  const handleDownload = (file) => {
    // If file is a URL string, open in new tab
    if (typeof file === 'string') {
      window.open(file, '_blank');
      return;
    }
    
    // If file is a File object, create download link
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

  const handleView = (file) => {
    // If file is a URL string, open in new tab
    if (typeof file === 'string') {
      window.open(file, '_blank');
      return;
    }
    
    // If file is a File object, create object URL and open
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      // Note: We don't revoke the URL immediately as it's being viewed
    }
  };

  const getFileIcon = (file) => {
    if (typeof file === 'string') {
      const extension = file.split('.').pop()?.toLowerCase();
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
    }
    
    if (file instanceof File) {
      const type = file.type.split('/')[0];
      switch (type) {
        case 'image':
          return '🖼️';
        case 'application':
          if (file.type.includes('pdf')) return '📄';
          if (file.type.includes('word')) return '📝';
          if (file.type.includes('excel') || file.type.includes('sheet')) return '📊';
          if (file.type.includes('zip')) return '📦';
          return '📄';
        default:
          return '📎';
      }
    }
    
    return '📎';
  };

  const getFileName = (file) => {
    if (typeof file === 'string') {
      return file.split('/').pop() || 'File';
    }
    if (file instanceof File) {
      return file.name;
    }
    return 'Unknown File';
  };

  const getFileSize = (file) => {
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
        className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-[1px]"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 border border-gray-200 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold theme-text-primary">
              Files
            </h2>
            {taskTitle && (
              <p className="text-sm text-gray-500 mt-1">
                For task: {taskTitle}
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
        <div className="p-6 overflow-y-auto flex-1">
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
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFileModal;