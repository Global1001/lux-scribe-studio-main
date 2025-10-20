import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/chat';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-chat-message-user ml-4' 
                : 'bg-chat-message-ai mr-4'
            }`}
          >
            <div className="text-sm text-text-primary">{message.content}</div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};