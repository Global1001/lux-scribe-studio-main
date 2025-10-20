import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatThread } from '@/types/chat';

interface ChatTabsProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onCloseThread: (threadId: string) => void;
  onCreateThread: () => void;
}

export const ChatTabs: React.FC<ChatTabsProps> = ({
  threads,
  activeThreadId,
  onThreadSelect,
  onCloseThread,
  onCreateThread
}) => {
  return (
    <div className="flex items-center bg-chat-background border-b border-editor-border">
      <ScrollArea className="flex-1">
        <div className="flex">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={`flex items-center gap-2 px-3 py-2 border-r border-editor-border cursor-pointer transition-colors group text-sm ${
                activeThreadId === thread.id 
                  ? 'bg-editor-surface text-text-primary' 
                  : 'hover:bg-editor-surface-hover text-text-secondary'
              }`}
              onClick={() => onThreadSelect(thread.id)}
            >
              <span className="truncate max-w-24">{thread.title}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseThread(thread.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onCreateThread}
        className="h-8 w-8 p-0 mx-2 hover:bg-editor-surface-hover"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};