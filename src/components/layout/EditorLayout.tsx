import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { FilesExplorer } from './FilesExplorer';
import { DocumentEditor } from './DocumentEditor';
import { ChatPanel } from './ChatPanel';
import { BottomBar } from './BottomBar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

/**
 * Main application layout component that orchestrates all panels and provides the resizable interface
 * 
 * This component manages the overall application structure including:
 * - Three main panels: Files Explorer, Document Editor, and Chat Panel
 * - Panel visibility states and toggle functionality
 * - Keyboard shortcuts for panel management
 * - Responsive layout with resizable panels
 * - Bottom bar for formatting tools and document statistics
 * 
 * The layout uses a resizable panel system that allows users to customize
 * their workspace by adjusting panel sizes and toggling panel visibility.
 */
export const EditorLayout: React.FC = () => {
  // Panel visibility states - control which panels are currently shown
  const [isFilesOpen, setIsFilesOpen] = useState(true);
  const [isBottomBarOpen, setIsBottomBarOpen] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);

  // Panel toggle functions - used by TopBar and keyboard shortcuts
  const toggleFiles = () => setIsFilesOpen(!isFilesOpen);
  const toggleBottomBar = () => setIsBottomBarOpen(!isBottomBarOpen);
  const toggleAIPanel = () => setIsAIPanelOpen(!isAIPanelOpen);

  /**
   * Placeholder function for new chat creation
   * TODO: Implement actual chat creation logic
   */
  const handleNewChat = () => {
    // This could trigger a global event or context
    console.log('New chat shortcut triggered');
  };

  /**
   * Placeholder function for new document creation
   * TODO: Implement actual document creation logic
   */
  const handleNewDocument = () => {
    // This could trigger a global event or context
    console.log('New document shortcut triggered');
  };

  // Setup keyboard shortcuts for panel management and common actions
  useKeyboardShortcuts({
    onToggleFiles: toggleFiles,
    onToggleBottomBar: toggleBottomBar,
    onNewChat: handleNewChat,
    onNewDocument: handleNewDocument,
    onToggleAIPanel: toggleAIPanel,
  });

  return (
    <div className="h-screen w-full bg-editor-background text-text-primary overflow-hidden flex flex-col">
      {/* Top Bar - Contains navigation, theme toggle, and panel controls */}
      <div className="h-12 border-b border-editor-border bg-editor-surface flex-shrink-0">
        <TopBar 
          onToggleFiles={toggleFiles} 
          isFilesOpen={isFilesOpen}
          onToggleBottomBar={toggleBottomBar}
          isBottomBarOpen={isBottomBarOpen}
          onToggleAIPanel={toggleAIPanel}
          isAIPanelOpen={isAIPanelOpen}
        />
      </div>

      {/* Main Content Area - Contains the three resizable panels */}
      <div className="flex-1 flex flex-col min-h-0">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Files Explorer Panel - Left side panel for file management */}
          {isFilesOpen && (
            <>
              <ResizablePanel 
                id="files-panel"
                order={1}
                defaultSize={20} // 20% of available width
                minSize={15}     // Minimum 15% width
                maxSize={35}     // Maximum 35% width
                className="bg-rail-background"
              >
                <FilesExplorer isOpen={isFilesOpen} />
              </ResizablePanel>
              <ResizableHandle className="w-1 bg-editor-border hover:bg-accent-blue transition-colors" />
            </>
          )}

          {/* Document Editor Panel - Center panel for document editing */}
          <ResizablePanel 
            id="editor-panel"
            order={2}
            // Dynamic sizing based on which panels are open
            defaultSize={isFilesOpen ? (isAIPanelOpen ? 50 : 80) : (isAIPanelOpen ? 70 : 100)} 
            minSize={30} // Minimum 30% width to ensure usability
            className="bg-content-background"
          >
            <DocumentEditor />
          </ResizablePanel>

          {/* Chat Panel - Right side panel for AI assistance */}
          {isAIPanelOpen && (
            <>
              <ResizableHandle className="w-1 bg-editor-border hover:bg-accent-blue transition-colors" />
              <ResizablePanel 
                id="chat-panel"
                order={3}
                defaultSize={30} // 30% of available width
                minSize={20}     // Minimum 20% width
                maxSize={50}     // Maximum 50% width
                className="bg-chat-background"
              >
                <ChatPanel />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {/* Bottom Bar - Contains formatting tools and document statistics */}
        {isBottomBarOpen && (
          <div className="h-10 border-t border-editor-border bg-editor-surface flex-shrink-0">
            <BottomBar />
          </div>
        )}
      </div>
    </div>
  );
};