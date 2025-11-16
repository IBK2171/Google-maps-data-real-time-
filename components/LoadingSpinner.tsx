import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      <p className="mt-4 text-lg text-blue-700">{message}</p>
    </div>
  );
};

export default LoadingSpinner;