import React from 'react';

const StatusBadge = ({ status }) => {
  // Define styles for different statuses
  const statusStyles = {
    Scheduled: 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    Pending: 'bg-gray-100 text-gray-800'
  };
  
  // Use default style if status doesn't match
  const style = statusStyles[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
};

export default StatusBadge;