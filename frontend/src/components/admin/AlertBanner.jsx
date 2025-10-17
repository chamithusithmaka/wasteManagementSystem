import React from 'react';

const AlertBanner = ({ title, children, type = 'info', className = '' }) => {
  // Define styles for different alert types
  const alertStyles = {
    info: 'bg-blue-50 border-blue-500 text-blue-700',
    warning: 'bg-amber-50 border-amber-500 text-amber-700',
    error: 'bg-red-50 border-red-500 text-red-700',
    success: 'bg-green-50 border-green-500 text-green-700'
  };
  
  const style = alertStyles[type] || alertStyles.info;
  
  return (
    <div className={`border-l-4 p-4 rounded-md ${style} ${className}`}>
      {title && <h3 className="font-medium">{title}</h3>}
      <div className="mt-1">{children}</div>
    </div>
  );
};

export default AlertBanner;