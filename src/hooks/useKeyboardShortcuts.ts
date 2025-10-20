import { useEffect } from 'react';

/**
 * Interface defining all available keyboard shortcuts
 * Each function represents an action that can be triggered by a key combination
 */
interface KeyboardShortcuts {
  onToggleFiles: () => void;
  onToggleBottomBar: () => void;
  onNewChat: () => void;
  onNewDocument: () => void;
  onToggleAIPanel: () => void;
}

/**
 * Custom hook for handling global keyboard shortcuts
 * 
 * This hook sets up event listeners for keyboard combinations and manages:
 * - Modifier key detection (Ctrl, Alt, Shift)
 * - Input field detection to prevent conflicts
 * - Shortcut priority and conflict resolution
 * - Event prevention to avoid browser default behaviors
 * 
 * @param shortcuts - Object containing callback functions for each shortcut
 */
export const useKeyboardShortcuts = ({
  onToggleFiles,
  onToggleBottomBar,
  onNewChat,
  onNewDocument,
  onToggleAIPanel,
}: KeyboardShortcuts) => {
  useEffect(() => {
    /**
     * Main keyboard event handler
     * Processes all key combinations and determines which shortcuts to trigger
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      // Extract modifier key states for easier comparison
      const isCtrl = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd (Mac)
      const isAlt = event.altKey;
      const isShift = event.shiftKey;
      
      // Check if user is typing in an input field or contenteditable area
      const target = event.target as HTMLElement;
      const isInInputField = target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';
      
      if (isInInputField) {
        // When in input fields, only allow specific shortcuts that don't conflict with typing
        if (isCtrl && !isAlt && !isShift) {
          switch (event.key.toLowerCase()) {
            case 'j': // Ctrl+J for bottom bar toggle
              event.preventDefault();
              onToggleBottomBar();
              break;
          }
        }
        return; // Exit early to prevent other shortcuts in input fields
      }

      // Handle complex modifier combinations (highest priority)
      if (isCtrl && isAlt && isShift) {
        switch (event.key.toLowerCase()) {
          case 'b': // Ctrl+Alt+Shift+B - Toggle Files Panel
            event.preventDefault();
            onToggleFiles();
            break;
        }
      } 
      // Handle two-modifier combinations (medium priority)
      else if (isCtrl && isAlt) {
        switch (event.key.toLowerCase()) {
          case 'b': // Ctrl+Alt+B - Toggle AI Panel
            event.preventDefault();
            onToggleAIPanel();
            break;
        }
      } 
      // Handle single-modifier combinations (lowest priority)
      else if (isCtrl) {
        switch (event.key.toLowerCase()) {
          case 'j': // Ctrl+J - Toggle Bottom Bar
            event.preventDefault();
            onToggleBottomBar();
            break;
          case 't': // Ctrl+T - New Chat Thread
            event.preventDefault();
            onNewChat();
            break;
          case 'n': // Ctrl+N - New Document
            event.preventDefault();
            onNewDocument();
            break;
        }
      }

      // Handle single key shortcuts (no modifiers)
      if (event.key === 'Escape') {
        // Escape key - Close bottom bar (common pattern in editors)
        onToggleBottomBar();
      }
    };

    // Add global event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggleFiles, onToggleBottomBar, onNewChat, onNewDocument, onToggleAIPanel]);
};