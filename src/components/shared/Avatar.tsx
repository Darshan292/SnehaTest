import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'Avatar', 
  size = 'md',
  className = '',
  fallback
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const baseClasses = `${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={baseClasses}
        onError={(e) => {
          // Hide the image and show fallback on error
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div className={baseClasses}>
      {fallback || <User className={`${iconSizes[size]} text-gray-500 dark:text-gray-400`} />}
    </div>
  );
};

export default Avatar;