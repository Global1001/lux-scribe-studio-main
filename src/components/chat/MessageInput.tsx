import React, { useState, useRef, useEffect } from 'react';
import { Send, FileSearch, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ContextFilesDropdown } from './ContextFilesDropdown';
import { ContextPills } from './ContextPills';
import { ChatToolsDropdown } from './ChatToolsDropdown';
import { ChatMode } from '@/types/chat';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  contextFiles: string[];
  onToggleContextFile: (fileName: string) => void;
  onRemoveContextFile: (fileName: string) => void;
  chatMode: ChatMode;
  onChatModeChange: (mode: ChatMode) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  contextFiles,
  onToggleContextFile,
  onRemoveContextFile,
  chatMode,
  onChatModeChange
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [maxHeight, setMaxHeight] = useState(200);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic maximum height based on available space
  useEffect(() => {
    const calculateMaxHeight = () => {
      if (containerRef.current) {
        const chatPanel = containerRef.current.closest('.bg-chat-background');
        if (chatPanel) {
          const chatPanelRect = chatPanel.getBoundingClientRect();
          const inputContainerRect = containerRef.current.getBoundingClientRect();
          
          // Calculate available space from current input position to top of chat panel
          const availableSpace = inputContainerRect.top - chatPanelRect.top;
          
          // Set maximum height to available space minus 50px buffer
          const dynamicMaxHeight = Math.max(40, availableSpace - 50);
          setMaxHeight(dynamicMaxHeight);
        }
      }
    };

    // Calculate on mount and window resize
    calculateMaxHeight();
    window.addEventListener('resize', calculateMaxHeight);
    
    return () => {
      window.removeEventListener('resize', calculateMaxHeight);
    };
  }, []);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height based on content and dynamic max height
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [messageInput, maxHeight]);

  const handleSend = async () => {
    if (!messageInput.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await onSendMessage(messageInput);
      setMessageInput('');
      
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      // Error handling will be managed by the parent component
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault();
      handleSend();
    }
  };

  const placeholderText = chatMode === 'document' ? 'Ask about your document...' : 'Enter a legal research query...';
  const showContextFeatures = chatMode === 'document';
  
  // Get appropriate send icon based on chat mode and loading state
  const getSendIcon = () => {
    if (isSending) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    switch (chatMode) {
      case 'document':
        return <FileSearch className="h-4 w-4" />;
      case 'research':
        return <Search className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  return (
    <div ref={containerRef} className="p-3 border-t border-editor-border">
      <div className="flex items-end gap-2">
        {showContextFeatures && (
          <ContextFilesDropdown
            contextFiles={contextFiles}
            onToggleFile={onToggleContextFile}
          />
        )}
        <div className="flex-1">
          {/* Chat Tools Dropdown */}
          <div className="mb-1">
            <ChatToolsDropdown
              currentMode={chatMode}
              onModeChange={onChatModeChange}
            />
          </div>
          
          <div className="relative bg-editor-surface border border-editor-border rounded-md">
            {showContextFeatures && contextFiles.length > 0 && (
              <div className="p-2 pb-0">
                <ContextPills
                  contextFiles={contextFiles}
                  onRemoveFile={onRemoveContextFile}
                />
              </div>
            )}
            <Textarea
              ref={textareaRef}
              placeholder={placeholderText}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-none bg-transparent resize-none min-h-[40px] focus-visible:ring-0 overflow-y-auto"
              style={{ maxHeight: `${maxHeight}px` }}
              rows={1}
              disabled={isSending}
            />
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={!messageInput.trim() || isSending}
          className="bg-accent-blue hover:bg-accent-blue-hover"
        >
          {getSendIcon()}
        </Button>
      </div>
    </div>
  );
};