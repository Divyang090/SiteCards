import React from 'react';

const StatusBadge = ({ status, dueDate }) => {
  // Calculate days remaining/overdue
  const getDueDateInfo = () => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return {
      days: Math.abs(daysDiff),
      isOverdue: daysDiff < 0,
      isDueSoon: daysDiff >= 0 && daysDiff <= 7
    };
  };

  const dueInfo = getDueDateInfo();

  const statusConfig = {
    progress: {
      label: dueInfo ? (
        dueInfo.isOverdue ? `Overdue by ${dueInfo.days} days` :
        dueInfo.isDueSoon ? `Due in ${dueInfo.days} days` :
        'In Progress'
      ) : 'In Progress',
      color: dueInfo ? (
        dueInfo.isOverdue ? 'bg-red-100 text-red-800' :
        dueInfo.isDueSoon ? 'bg-orange-100 text-orange-800' :
        'bg-blue-200 text-blue-900'
      ) : 'bg-blue-200 text-blue-900'
    },
    completed: {
      label: 'Completed',
      color: 'bg-green-100 text-green-800'
    },
    review: {
      label: dueInfo ? (
        dueInfo.isOverdue ? `Review - Overdue by ${dueInfo.days} days` :
        dueInfo.isDueSoon ? `Review - Due in ${dueInfo.days} days` :
        'Review'
      ) : 'Review',
      color: dueInfo ? (
        dueInfo.isOverdue ? 'bg-red-100 text-red-800' :
        dueInfo.isDueSoon ? 'bg-orange-100 text-orange-800' :
        'bg-purple-100 text-purple-800'
      ) : 'bg-purple-100 text-purple-800'
    },
    Planning: {
      label: dueInfo ? (
        dueInfo.isOverdue ? `Planning - Overdue by ${dueInfo.days} days` :
        dueInfo.isDueSoon ? `Planning - Due in ${dueInfo.days} days` :
        'Planning'
      ) : 'Planning',
      color: dueInfo ? (
        dueInfo.isOverdue ? 'bg-red-100 text-red-800' :
        dueInfo.isDueSoon ? 'bg-orange-100 text-orange-800' :
        'bg-yellow-100 text-yellow-800'
      ) : 'bg-yellow-100 text-yellow-800'
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