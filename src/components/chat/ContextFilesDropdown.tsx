import React, { useState } from 'react';
import { AtSign, File, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileItem } from '@/types/chat';

// Mock available files (similar to FilesExplorer)
const availableFiles: FileItem[] = [
  { id: '1', name: 'Project Proposal.docx', type: 'document' },
  { id: '2', name: 'Meeting Notes.docx', type: 'document' },
  { id: '3', name: 'Draft Article.docx', type: 'document' },
  { id: '4', name: 'Letter Template.docx', type: 'template' },
  { id: '5', name: 'Report Template.docx', type: 'template' },
];

// Mock open documents (from DocumentEditor)
const openDocuments: FileItem[] = [
  { id: 'doc1', name: 'Untitled Document', type: 'document' },
  { id: 'doc2', name: 'Project Proposal', type: 'document' },
];

interface ContextFilesDropdownProps {
  contextFiles: string[];
  onToggleFile: (fileName: string) => void;
}

export const ContextFilesDropdown: React.FC<ContextFilesDropdownProps> = ({
  contextFiles,
  onToggleFile
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-editor-surface-hover"
        >
          <AtSign className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        className="w-80 p-0 bg-popover border border-editor-border"
        sideOffset={8}
      >
        <div className="p-3">
          <h4 className="text-sm font-medium text-text-primary mb-3">Add Context Files</h4>
          
          {/* Open Documents Section */}
          {openDocuments.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-medium text-text-secondary mb-2">Open Documents</h5>
              <div className="space-y-1">
                {openDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-editor-surface-hover cursor-pointer"
                    onClick={() => onToggleFile(doc.name)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-accent-blue" />
                      <span className="text-sm text-text-primary">{doc.name}</span>
                    </div>
                    {contextFiles.includes(doc.name) && (
                      <Check className="h-4 w-4 text-accent-blue" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Available Files Section */}
          <div>
            <h5 className="text-xs font-medium text-text-secondary mb-2">Available Files</h5>
            <div className="space-y-1">
              {availableFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-editor-surface-hover cursor-pointer"
                  onClick={() => onToggleFile(file.name)}
                >
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-text-secondary" />
                    <span className="text-sm text-text-primary">{file.name}</span>
                  </div>
                  {contextFiles.includes(file.name) && (
                    <Check className="h-4 w-4 text-accent-blue" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};