/**
 * Chat mode options for different types of conversations
 */
export type ChatMode = 'document' | 'research';

/**
 * Represents a single message in a chat conversation
 * 
 * Messages can be from either the user or the AI assistant.
 * Each message includes metadata for display and processing.
 */
export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  
  /** Role of the message sender - either 'user' or 'assistant' */
  role: 'user' | 'assistant';
  
  /** The actual content/text of the message */
  content: string;
  
  /** Timestamp when the message was created/sent */
  timestamp: Date;
}

/**
 * Represents a complete chat conversation thread
 * 
 * A chat thread contains multiple messages and can have context files
 * attached for AI assistance. Threads are persistent and can be
 * created, switched between, and closed.
 */
export interface ChatThread {
  /** Unique identifier for the thread */
  id: string;
  
  /** Display name for the thread (usually auto-generated) */
  title: string;
  
  /** Array of messages in chronological order */
  messages: ChatMessage[];
  
  /** List of file names that provide context for AI responses */
  contextFiles: string[];
  
  /** Chat mode - either document chat or external research */
  mode: ChatMode;
}

/**
 * Represents a file item in the file explorer
 * 
 * Used for displaying files and folders in the hierarchical
 * file structure. Supports both documents and templates.
 */
export interface FileItem {
  /** Unique identifier for the file */
  id: string;
  
  /** Display name of the file */
  name: string;
  
  /** Type of file - either a document or template */
  type: 'document' | 'template';
}