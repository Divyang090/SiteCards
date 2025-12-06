import React, { useState } from 'react';

const SiteTaskCard = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onFilesOpen
}) => {
  const [expandedDescription, setExpandedDescription] = useState(false);

  const handleToggleDescription = () => {
    setExpandedDescription(!expandedDescription);
  };

  const handleToggleStatus = () => {
    onToggle(task.id);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(task);
  };

  const handleFilesClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFilesOpen) {
      onFilesOpen(task.files, task.title || task.task_name);
    }
  };

  // Helper function to format date from "2025-12-27T21:51:00" to "27-12-2025 21:51"
  const formatTaskDate = (dateString) => {
    if (!dateString) return '';

    try {
      // Handle both formats: "2025-12-27T21:51:00" and "27-12-2025T21:51"
      if (dateString.includes('T')) {
        const [datePart, timePart] = dateString.split('T');

        // Check if date is in YYYY-MM-DD format
        if (datePart.includes('-')) {
          const parts = datePart.split('-');
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            const [year, month, day] = parts;
            const time = timePart ? timePart.substring(0, 5) : ''; // Get HH:MM
            return time ? `${day}-${month}-${year} ${time}` : `${day}-${month}-${year}`;
          } else {
            // DD-MM-YYYY format
            const [day, month, year] = parts;
            const time = timePart ? timePart.substring(0, 5) : ''; // Get HH:MM
            return time ? `${day}-${month}-${year} ${time}` : `${day}-${month}-${year}`;
          }
        }
      }

      // Return original if format is unknown
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <div
      className={`theme-bg-primary overflow-x-auto scrollbar-hidden whitespace-nowrap rounded-lg border border-gray-500 p-4 flex items-center justify-between group hover:shadow-md transition-all duration-200 ${task.completed || task.status === 'completed' ? 'opacity-60 scale-[0.98]' : ''
        }`}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Checkbox*/}
        <button
          onClick={handleToggleStatus}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${task.completed || task.status === 'completed'
            ? 'bg-green-500 border-green-500 text-white shadow-sm'
            : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
            }`}
        >
          {(task.completed || task.status === 'completed') && (
            <svg
              className="w-3 h-3 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Task content*/}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleToggleDescription}
        >
          <div className="flex items-center">
            <span className={`block font-medium theme-text-secondary transition-all duration-200 ${task.completed || task.status === 'completed' ? 'text-gray-400 line-through' : 'theme-text-primary'
              }`}>
              {task.title || task.task_name}
            </span>
            <div className="flex items-center gap-2 ml-4">
              <span className="theme-bg-secondary px-2 py-1 rounded text-xs">
                {task.task_type}
              </span>
            </div>
          </div>

          {(task.assigned_to || task.location || task.date || task.files) && (
            <div className='flex items-center gap-3 mt-1'>

              {/* task assigned to on task card */}
              {task.assigned_to && task.assigned_to !== 'Unassigned' && (
                <span className={`text-xs flex items-center gap-1 ${task.completed || task.status === 'completed' ? 'text-gray-400' : 'theme-text-secondary'} `}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {task.assigned_to}
                </span>
              )}

              {/* task location on task card */}
              {task.location && (
                <span className={`text-xs flex items-center gap-1 ${task.completed || task.status === 'completed' ? 'text-gray-400' : 'theme-text-secondary'}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {task.location}
                </span>
              )}

              {/* task date on task card - FIXED THIS SECTION */}
              {task.date && (
                <span className={`text-xs flex items-center gap-1 ${task.completed || task.status === 'completed' ? 'text-gray-400' : 'theme-text-secondary'}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatTaskDate(task.date)}
                </span>
              )}

              {/* Files section */}
              {task.files && task.files.length > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFilesClick(e);
                  }}
                  className={`text-xs flex items-center gap-1 ${task.completed || task.status === 'completed' ? 'text-gray-400' : 'text-gray-500'} hover:text-blue-500 transition-colors duration-200`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {task.files.length}
                </button>
              )}
            </div>
          )}

          {task.description && expandedDescription && (
            <p className={`text-sm theme-bg-secondary theme-text-secondary mt-2 transition-all duration-200 ${task.completed || task.status === 'completed' ? 'text-gray-400' : ''
              }`}>
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Date and action buttons */}
      <div className="flex items-center gap-2 ml-4">
        <span className={`text-xs whitespace-nowrap transition-all duration-200 ${task.completed || task.status === 'completed' ? 'text-gray-400' : 'text-gray-500'
          }`}>
          {task.createdAt || task.created_at}
        </span>

        {/* Edit Button*/}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(task.id || task.task_id);
          }}
          className="text-gray-400 hover:text-blue-500 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(e);
          }}
          className="text-gray-400 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all duration-200"
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