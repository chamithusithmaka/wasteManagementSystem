import React, { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'warning' | 'success';
  children: ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  const variantStyles = {
    default: 'bg-blue-100 text-blue-800',
    warning: 'bg-amber-100 text-amber-800',
    success: 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-3 py-1 ${variantStyles[variant]} text-sm font-medium rounded-full`}>
      {children}
    </span>
  );
};

export default Badge;