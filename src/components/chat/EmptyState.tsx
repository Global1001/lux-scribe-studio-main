import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateThread: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateThread }) => {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto bg-editor-surface rounded-lg flex items-center justify-center mb-6">
          <MessageSquare className="h-6 w-6 text-text-muted" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-text-primary">No chats yet</h3>
          <p className="text-sm text-text-muted max-w-64">
            Start a conversation about your document with AI assistance
          </p>
        </div>
        <Button 
          onClick={onCreateThread} 
          className="bg-accent-blue hover:bg-accent-blue-hover text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
    </div>
  );
};