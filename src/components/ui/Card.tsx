import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  padding = true 
}) => {
  return (
    <div className={clsx(
      'bg-white rounded-xl shadow-sm border border-gray-200',
      padding && 'p-6',
      className
    )}>
      {children}
    </div>
  );
};

export default Card;