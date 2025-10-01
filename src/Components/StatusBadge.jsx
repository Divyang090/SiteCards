import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    progress: {
      label: 'Progress',
      color: 'bg-blue-200 text-blue-900'
    },
    completed: {
      label: 'Completed',
      color: 'bg-green-100 text-green-800'
    },
    pending: {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800'
    }
  };

  const config = statusConfig[status] || statusConfig.progress;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;