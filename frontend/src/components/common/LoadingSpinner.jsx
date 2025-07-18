import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <AiOutlineLoading3Quarters 
      className={`animate-spin ${sizeClasses[size]} ${className}`}
    />
  );
}