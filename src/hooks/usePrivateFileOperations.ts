import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { appConfig } from '@/lib/config';

interface PrivateFile {
  filename: string;
  original_filename: string;
  size: number;
  local_path: string;
  upload_type: 'private';
}

/**
 * Custom hook for managing private file operations (local server storage)
 * Files uploaded through this hook are stored on the server but not in Supabase
 */
export const usePrivateFileOperations = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  /**
   * Upload a file to local server storage (not Supabase)
   */
  const uploadPrivateFile = async (file: File): Promise<PrivateFile | null> => {
    setIsUploading(true);
    
    try {
      // Check if backend is available first
      const healthResponse = await fetch(`${appConfig.backend.url}/health`);
      if (!healthResponse.ok) {
        throw new Error('Backend server is not available');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${appConfig.backend.url}/api/v1/upload/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Upload endpoints are not available on the backend server');
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      
      toast({
        title: "Private file uploaded",
        description: `${file.name} has been uploaded privately to the server.`
      });

      // Dispatch event to notify file explorer to refresh
      window.dispatchEvent(new CustomEvent('private-file-uploaded', {
        detail: { ...result, original_filename: file.name }
      }));

      return result;
    } catch (error) {
      console.error('Error uploading private file:', error);
      
      toast({
        title: "Private upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file privately.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Trigger private file upload dialog
   */
  const triggerPrivateFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.accept = '.pdf,.doc,.docx,.txt,.rtf';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadPrivateFile(file);
      }
    };
    
    input.click();
  };

  /**
   * Fetch list of private files from server
   */
  const fetchPrivateFiles = async (): Promise<PrivateFile[]> => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return [];
    }

    // Debounce: don't fetch more than once every 2 seconds
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000) {
      return [];
    }

    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;

    try {
      // Check if backend is available first
      const healthResponse = await fetch(`${appConfig.backend.url}/health`);
      if (!healthResponse.ok) {
        console.log('Backend not available, skipping private file fetch');
        return [];
      }

      // Try to fetch private files
      const response = await fetch(`${appConfig.backend.url}/api/v1/upload/list`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Upload endpoints not available on backend');
          return [];
        }
        throw new Error('Failed to fetch private files');
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error fetching private files:', error);
      return [];
    } finally {
      isFetchingRef.current = false;
    }
  };

  return {
    uploadPrivateFile,
    triggerPrivateFileUpload,
    fetchPrivateFiles,
    isUploading,
  };
};