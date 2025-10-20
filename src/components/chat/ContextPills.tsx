import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContextPillsProps {
  contextFiles: string[];
  onRemoveFile: (fileName: string) => void;
}

export const ContextPills: React.FC<ContextPillsProps> = ({
  contextFiles,
  onRemoveFile
}) => {
  if (contextFiles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {contextFiles.map((file, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="text-xs bg-accent-blue-light text-accent-blue border-none"
        >
          {file}
          <X 
            className="h-3 w-3 ml-1 cursor-pointer hover:text-accent-red" 
            onClick={() => onRemoveFile(file)}
          />
        </Badge>
      ))}
    </div>
  );
};