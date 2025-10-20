import React from 'react';
import { useChatThreads } from '@/hooks/useChatThreads';
import { ChatTabs } from '@/components/chat/ChatTabs';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { MessageInput } from '@/components/chat/MessageInput';
import { EmptyState } from '@/components/chat/EmptyState';

export const ChatPanel: React.FC = () => {
  const {
    threads,
    activeThread,
    activeThreadId,
    setActiveThreadId,
    createNewThread,
    closeThread,
    sendMessage,
    toggleContextFile,
    removeContextFile,
    setChatMode
  } = useChatThreads();

  return (
    <div className="flex flex-col h-full">
      {/* Chat Tabs */}
      <ChatTabs
        threads={threads}
        activeThreadId={activeThreadId}
        onThreadSelect={setActiveThreadId}
        onCloseThread={closeThread}
        onCreateThread={createNewThread}
      />

      {/* Chat Content */}
      {activeThread ? (
        <>
          {/* Messages */}
          <ChatMessages messages={activeThread.messages} />

          {/* Input */}
          <MessageInput
            onSendMessage={sendMessage}
            contextFiles={activeThread.contextFiles}
            onToggleContextFile={toggleContextFile}
            onRemoveContextFile={removeContextFile}
            chatMode={activeThread.mode}
            onChatModeChange={setChatMode}
          />
        </>
      ) : (
        <EmptyState onCreateThread={createNewThread} />
      )}
    </div>
  );
};