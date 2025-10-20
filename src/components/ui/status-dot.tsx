import React from 'react';
import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 'uploaded' | 'cached' | 'missing';
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, className }) => {
  const dotClasses = {
    uploaded: 'bg-green-500',
    cached: 'bg-yellow-500', 
    missing: 'bg-red-500'
  };

  return (
    <div 
      className={cn(
        'w-1.5 h-1.5 rounded-full flex-shrink-0',
        dotClasses[status],
        className
      )}
      title={
        status === 'uploaded' 
          ? 'File uploaded to Supabase' 
          : status === 'cached'
          ? 'File cached locally, not uploaded'
          : 'File missing'
      }
    />
  );
};