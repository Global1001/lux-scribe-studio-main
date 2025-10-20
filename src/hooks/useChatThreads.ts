import { useState } from 'react';
import { ChatThread, ChatMessage, ChatMode } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { appConfig } from '@/lib/config';
import { ErrorHandler } from '@/utils/errorHandler';

/**
 * Default chat thread that's created when the application starts
 * Provides a starting point for users to begin chatting
 */
const defaultThread: ChatThread = {
  id: 'default-chat',
  title: 'New Chat',
  messages: [],
  contextFiles: ['Untitled Document'],
  mode: 'document'
};

/**
 * Initial mock data for development/testing purposes
 * In production, this would be loaded from a database
 */
const mockThreads: ChatThread[] = [defaultThread];

/**
 * Custom hook for managing chat threads and messages
 * 
 * This hook provides a complete chat management system including:
 * - Thread creation, switching, and deletion
 * - Message sending and storage
 * - Context file management for AI assistance
 * - State synchronization across components
 * - Research query handling with backend integration
 * 
 * @returns Object containing thread management functions and state
 */
export const useChatThreads = () => {
  // Store all chat threads in state
  const [threads, setThreads] = useState<ChatThread[]>(mockThreads);
  
  // Track which thread is currently active/selected
  const [activeThreadId, setActiveThreadId] = useState<string | null>('default-chat');

  // Get the currently active thread object
  const activeThread = activeThreadId ? threads.find(t => t.id === activeThreadId) : null;

  // Get current user for research operations
  const { user } = useAuth();

  /**
   * Creates a new chat thread and automatically switches to it
   * Each thread gets a unique ID based on timestamp
   */
  const createNewThread = () => {
    const newThread: ChatThread = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      contextFiles: ['Untitled Document'],
      mode: 'document'
    };
    setThreads([...threads, newThread]);
    setActiveThreadId(newThread.id);
  };

  /**
   * Closes/removes a chat thread
   * If the closed thread was active, switches to the first available thread
   * 
   * @param threadId - ID of the thread to close
   */
  const closeThread = (threadId: string) => {
    const newThreads = threads.filter(t => t.id !== threadId);
    setThreads(newThreads);
    
    // If we closed the active thread, switch to the first available one
    if (activeThreadId === threadId) {
      setActiveThreadId(newThreads.length > 0 ? newThreads[0].id : null);
    }
  };

  /**
   * Handles research queries by calling the backend API and creating a new document
   * 
   * @param query - The research query to send to the backend
   * @returns Promise that resolves when research is complete
   */
  const handleResearchQuery = async (query: string) => {
    return await ErrorHandler.withRetry(async () => {
      try {
        // Call the backend research API with POST request
        const response = await fetch(appConfig.api.search, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            max_results: 10
          })
        });

        if (!response.ok) {
          const errorDetails = {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          };
          ErrorHandler.handle(new Error(`API request failed: ${response.status}`), 'Research API call', false);
          throw new Error('Research query failed');
        }

        const researchData = await response.json();
        
        // Create research folder if it doesn't exist
        let researchFolderId = await createResearchFolder();
        
        // Create a new document with the research results
        await createResearchDocument(query, researchData, researchFolderId);
        
        // Add AI response to chat
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Research completed for "${query}". Found ${researchData.total_results} relevant cases from ${researchData.sources.join(' and ')}. A new document has been created with the full results in your Research folder.`,
          timestamp: new Date()
        };

        return aiMessage;
      } catch (error) {
        ErrorHandler.handleResearchError(error, query);
        
        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error while researching "${query}". Please try again.`,
          timestamp: new Date()
        };

        return errorMessage;
      }
    }, 2, 1500); // Retry up to 2 times with 1.5s delay
  };

  /**
   * Creates a research folder in Supabase if it doesn't exist
   * 
   * @returns Promise that resolves with the folder ID
   */
  const createResearchFolder = async (): Promise<string> => {
    // Temporarily bypass authentication for development
    // if (!user) {
    //   throw new Error('User not authenticated');
    // }

    // Check if research folder already exists
    // const { data: existingFolders } = await supabase
    //   .from('folders')
    //   .select('id')
    //   .eq('user_id', user.id)
    //   .eq('name', 'Research')
    //   .single();

    // if (existingFolders) {
    //   return existingFolders.id;
    // }

    // Create new research folder
    // const { data: newFolder, error } = await supabase
    //   .from('folders')
    //   .insert({
    //     user_id: user.id,
    //     name: 'Research',
    //     parent_folder_id: null
    //   })
    //   .select('id')
    //   .single();

    // if (error) {
    //   throw error;
    // }

    // return newFolder.id;
    return 'research-folder-id'; // Temporary mock folder ID
  };

  /**
   * Creates a new document with research results and stores it in Supabase
   * 
   * @param query - The original research query
   * @param researchData - The research results from the backend
   * @param folderId - The folder ID to store the document in
   */
  const createResearchDocument = async (query: string, researchData: any, folderId: string) => {
    // Temporarily bypass authentication for development
    // if (!user) {
    //   throw new Error('User not authenticated');
    // }

    // Create document content from research results
    const documentContent = formatResearchResults(query, researchData);
    
    // Temporarily bypass Supabase operations for development
    // Create a blob from the document content
    // const blob = new Blob([documentContent], { type: 'text/plain' });
    // const file = new File([blob], `Research - ${query}.txt`, { type: 'text/plain' });

    // Generate unique filename
    // const fileName = `${user.id}/research/${Date.now()}-${Math.random().toString(36).substring(2)}.txt`;
    
    // Upload to Supabase storage
    // const { data: uploadData, error: uploadError } = await supabase.storage
    //   .from('documents')
    //   .upload(fileName, file);

    // if (uploadError) {
    //   throw uploadError;
    // }

    // Save document metadata to database
    // const { error: dbError } = await supabase
    //   .from('documents')
    //   .insert({
    //     user_id: user.id,
    //     filename: fileName,
    //     original_filename: `Research - ${query}.txt`,
    //     file_path: uploadData.path,
    //     file_size: file.size,
    //     folder_id: folderId,
    //     processing_status: 'completed'
    //   });

    // if (dbError) {
    //   throw dbError;
    // }
    
    // Log document creation in development only
    if (process.env.NODE_ENV === 'development') {
      console.log('Research document created:', {
        query,
        content: documentContent,
        folderId
      });
    }
    
    // Dispatch event to notify DocumentEditor to display the research document
    window.dispatchEvent(new CustomEvent('research-document-created', {
      detail: {
        query,
        content: documentContent
      }
    }));
  };

  /**
   * Formats research results into a readable document
   * 
   * @param query - The original research query
   * @param researchData - The research results from the backend
   * @returns Formatted document content
   */
  const formatResearchResults = (query: string, researchData: any): string => {
    let content = `Research Results: ${query}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Results: ${researchData.total_results}\n`;
    content += `Sources: ${researchData.sources.join(', ')}\n`;
    content += `Search Time: ${researchData.search_time_ms}ms\n\n`;
    
    researchData.results.forEach((result: any, index: number) => {
      content += `${index + 1}. ${result.case_name}\n`;
      content += `   Citation: ${result.citation}\n`;
      content += `   Court: ${result.court}\n`;
      content += `   Date Decided: ${result.date_decided}\n`;
      content += `   Source: ${result.source}\n`;
      content += `   Relevance Score: ${result.score}\n`;
      content += `   Summary: ${result.snippet}\n\n`;
    });
    
    return content;
  };

  /**
   * Sends a new message to the currently active thread
   * Handles both regular chat messages and research queries
   * 
   * @param content - The message content to send
   */
  const sendMessage = async (content: string) => {
    // Validate input and active thread
    if (!content.trim() || !activeThread) return;

    // Create new user message with current timestamp
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    // Update the active thread with the new message
    const updatedThread = {
      ...activeThread,
      messages: [...activeThread.messages, newMessage]
    };

    // Update threads state, replacing the active thread
    setThreads(threads.map(t => t.id === activeThread.id ? updatedThread : t));

    // Handle research queries if in research mode
    if (activeThread.mode === 'research') {
      const aiMessage = await handleResearchQuery(content);
      
      // Add AI response to the thread
      const finalThread = {
        ...updatedThread,
        messages: [...updatedThread.messages, aiMessage]
      };
      
      setThreads(threads.map(t => t.id === activeThread.id ? finalThread : t));
    }
  };

  /**
   * Toggles a context file in the active thread
   * Context files are used to provide AI with document context
   * 
   * @param fileName - Name of the file to toggle
   */
  const toggleContextFile = (fileName: string) => {
    if (!activeThread) return;
    
    // Check if file is already selected
    const isSelected = activeThread.contextFiles.includes(fileName);
    
    // Add or remove file from context
    const updatedContextFiles = isSelected
      ? activeThread.contextFiles.filter(file => file !== fileName)
      : [...activeThread.contextFiles, fileName];
    
    // Update the active thread
    const updatedThread = {
      ...activeThread,
      contextFiles: updatedContextFiles
    };
    
    setThreads(threads.map(t => t.id === activeThread.id ? updatedThread : t));
  };

  /**
   * Removes a context file from the active thread
   * 
   * @param fileName - Name of the file to remove
   */
  const removeContextFile = (fileName: string) => {
    if (!activeThread) return;
    
    const updatedThread = {
      ...activeThread,
      contextFiles: activeThread.contextFiles.filter(file => file !== fileName)
    };
    
    setThreads(threads.map(t => t.id === activeThread.id ? updatedThread : t));
  };

  /**
   * Toggles the chat mode for the active thread
   * 
   * @param mode - The new chat mode to set
   */
  const setChatMode = (mode: ChatMode) => {
    if (!activeThread) return;
    
    const updatedThread = {
      ...activeThread,
      mode,
      // Clear context files when switching to research mode
      contextFiles: mode === 'research' ? [] : activeThread.contextFiles
    };
    
    setThreads(threads.map(t => t.id === activeThread.id ? updatedThread : t));
  };

  return {
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
  };
};