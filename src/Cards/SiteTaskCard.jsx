import React from 'react';

const SiteTaskCard = ({ task, onToggle, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`overflow-x-auto whitespace-nowrap scrollbar-hidden border rounded-lg p-4 hover:shadow-md transition-all duration-200 flex items-start gap-3 group ${
      task.status === 'completed' ? 'theme-bg-secondary opacity-50' : ''
    }`}>
      {/* Check button */}
      <button
        onClick={() => onToggle && onToggle(task.id)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 mt-1 ${
          task.status === 'completed'
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-500'
        }`}
      >
        {task.status === 'completed' && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1">
        <h3 className={`font-semibold theme-text-primary text-lg mb-1 ${
          task.status === 'completed' ? 'line-through text-gray-500' : ''
        }`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-500 mb-2">{task.description}</p>
        )}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className={`px-2 py-1 rounded-full ${
            task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {task.status}
          </span>
          <span>Due: {formatDate(task.due_date)}</span>
        </div>
      </div>

      {/* Hover-only action buttons */}
      <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onEdit && onEdit(task)}
          className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors duration-200"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete && onDelete(task.id)}
          className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors duration-200"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SiteTaskCard;