import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`border-2 border-warm-300 border-t-warm-600 rounded-full ${sizeClasses[size]}`}
      />
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  count = 1 
}) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-warm-200 rounded-lg mb-4"
          style={{ height: '200px' }}
        />
      ))}
    </div>
  );
};

interface PhotoGridSkeletonProps {
  count?: number;
}

export const PhotoGridSkeleton: React.FC<PhotoGridSkeletonProps> = ({ 
  count = 12 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="animate-pulse"
        >
          <div className="bg-warm-200 rounded-lg aspect-[4/3] mb-4"></div>
          <div className="bg-warm-200 h-4 rounded mb-2"></div>
          <div className="bg-warm-200 h-3 rounded w-3/4 mb-2"></div>
          <div className="flex space-x-2">
            <div className="bg-warm-200 h-6 w-12 rounded-full"></div>
            <div className="bg-warm-200 h-6 w-16 rounded-full"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
