import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing file operations including upload, download, and metadata management
 * 
 * This hook provides a complete file management system with:
 * - Secure file upload to Supabase storage
 * - Database metadata tracking
 * - User authentication validation
 * - Error handling and user feedback
 * - File type validation and naming conventions
 * 
 * @returns Object containing file operation functions and loading states
 */
export const useFileOperations = () => {
  // Track upload state for UI feedback
  const [isUploading, setIsUploading] = useState(false);
  
  // Toast notifications for user feedback
  const { toast } = useToast();
  
  // Get current user for authentication and user-specific operations
  const { user } = useAuth();

  /**
   * Uploads a file to Supabase storage and saves metadata to database
   * 
   * This function handles the complete upload process:
   * 1. Validates user authentication
   * 2. Generates unique filename to prevent conflicts
   * 3. Uploads file to Supabase storage bucket
   * 4. Saves file metadata to database for tracking
   * 5. Provides user feedback via toast notifications
   * 
   * @param file - The file object to upload
   * @returns Promise that resolves with upload data or rejects with error
   */
  const uploadFile = async (file: File) => {
    // Ensure user is authenticated before allowing upload
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Generate unique filename to prevent conflicts
      // Format: userId/timestamp-randomString.extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload file to Supabase storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Save file metadata to database for tracking and retrieval
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          filename: fileName,
          original_filename: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          processing_status: 'completed'
        });

      if (dbError) {
        throw dbError;
      }

      // Provide success feedback to user
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded to your documents.`
      });

      // Dispatch event to notify file explorer to refresh
      window.dispatchEvent(new Event('file-uploaded'));

      return uploadData;
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Provide error feedback to user
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Triggers the file upload dialog and handles file selection
   * 
   * This function creates a hidden file input element, triggers the file dialog,
   * and processes the selected file through the uploadFile function.
   * 
   * Supported file types: PDF, DOC, DOCX, TXT, RTF
   */
  const triggerFileUpload = () => {
    // Create hidden file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false; // Single file selection
    
    // Define accepted file types for document uploads
    input.accept = '.pdf,.doc,.docx,.txt,.rtf';
    
    // Handle file selection
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadFile(file);
      }
    };
    
    // Trigger file dialog
    input.click();
  };

  /**
   * Fetches the list of files from Supabase for the current user
   */
  const fetchSupabaseFiles = async () => {
    console.log('=== FETCHING SUPABASE FILES ===');
    console.log('User:', user);
    console.log('User ID:', user?.id);
    
    if (!user) {
      console.log('No user found, returning empty array');
      return [];
    }
    
    try {
      console.log('Querying Supabase documents table...');
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      console.log('Supabase response:', { data, error });
      console.log('Query details:', {
        table: 'documents',
        filter: { user_id: user.id },
        expectedUserId: user.id,
        actualUserId: user?.id
      });
      
      if (error) {
        console.error('Error fetching files from Supabase:', error);
        return [];
      }
      
      console.log('Files found:', data?.length || 0);
      console.log('Returning files:', data || []);
      return data || [];
    } catch (err) {
      console.error('Exception in fetchSupabaseFiles:', err);
      return [];
    }
  };

  /**
   * Reads the content of a file from Supabase storage
   * 
   * @param filePath - Path to the file in storage
   * @param fileName - Original filename for display
   * @returns Promise with file content and metadata
   */
  const readFileContent = async (filePath: string, fileName: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('=== READING FILE CONTENT ===');
    console.log('File path:', filePath);
    console.log('File name:', fileName);

    try {
      console.log('Attempting to download file from Supabase...');
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      console.log('Supabase download response:', {
        hasData: !!data,
        hasError: !!error,
        error: error ? error.message : null
      });

      if (error) {
        console.error('Supabase storage download error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from Supabase');
      }

      console.log('File data received from Supabase:', {
        size: data.size,
        type: data.type,
        fileName,
        isBlob: data instanceof Blob,
        blobSize: data instanceof Blob ? data.size : 'N/A',
        blobType: data instanceof Blob ? data.type : 'N/A'
      });

      // Additional validation
      if (!data || data.size === 0) {
        throw new Error('File data is empty or null');
      }

      if (!(data instanceof Blob)) {
        throw new Error('File data is not a Blob');
      }

      // Get file extension and determine type
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
      let fileType = 'text/plain';
      
      if (fileExt === 'pdf') {
        fileType = 'application/pdf';
      } else if (fileExt === 'docx') {
        fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileExt === 'doc') {
        fileType = 'application/msword';
      } else if (fileExt === 'txt') {
        fileType = 'text/plain';
      }

      console.log('Detected file type:', fileType, 'for extension:', fileExt);

      // Handle binary files (like PDFs and DOCX) differently from text files
      if (fileType === 'application/pdf' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'application/msword') {
        console.log(`Processing ${fileExt.toUpperCase()} file...`);
        const arrayBuffer = await data.arrayBuffer();
        console.log(`Created ArrayBuffer for ${fileExt.toUpperCase()}:`, {
          byteLength: arrayBuffer.byteLength,
          hasContent: arrayBuffer.byteLength > 0,
          isArrayBuffer: arrayBuffer instanceof ArrayBuffer
        });
        
        if (arrayBuffer.byteLength === 0) {
          throw new Error(`${fileExt.toUpperCase()} file is empty or corrupted`);
        }
        
        // Validate file signature based on type
        const firstBytes = new Uint8Array(arrayBuffer.slice(0, 8));
        if (fileExt === 'pdf') {
          const signature = String.fromCharCode(...firstBytes.slice(0, 4));
          console.log('PDF signature check:', {
            signature: signature,
            isValid: signature === '%PDF',
            firstBytes: Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')
          });
          
          if (signature !== '%PDF') {
            throw new Error(`Invalid PDF signature: ${signature}`);
          }
        } else if (fileExt === 'docx') {
          // DOCX files start with PK (ZIP signature) since they are ZIP archives
          const signature = String.fromCharCode(...firstBytes.slice(0, 2));
          console.log('DOCX signature check:', {
            signature: signature,
            isValid: signature === 'PK',
            firstBytes: Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')
          });
          
          if (signature !== 'PK') {
            throw new Error(`Invalid DOCX signature: ${signature}`);
          }
        }
        
        console.log(`✅ ${fileExt.toUpperCase()} content is valid and ready`);
        
        return {
          content: '', // No text content for binary files
          binaryContent: arrayBuffer,
          fileName,
          fileType,
          filePath
        };
      } else {
        // Convert blob to text for text files
        const text = await data.text();
        console.log('Text file content length:', text.length);
        return {
          content: text,
          fileName,
          fileType,
          filePath
        };
      }
    } catch (error) {
      console.error('Error reading file content:', error);
      toast({
        title: "Error reading file",
        description: `Could not read ${fileName}. The file may be corrupted or missing.`,
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    uploadFile,
    triggerFileUpload,
    isUploading,
    fetchSupabaseFiles,
    readFileContent,
  };
};