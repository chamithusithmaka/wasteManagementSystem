import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div>{children}</div>
    </div>
  );
};

export default Card;