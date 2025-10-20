import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing folder operations
 */
export const useFolderOperations = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Creates a new folder in the database
   */
  const createFolder = async (name: string, parentFolderId?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create folders.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const { error } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name,
          parent_folder_id: parentFolderId || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Folder created",
        description: `Folder "${name}" has been created successfully.`
      });

      return true;
    } catch (error) {
      console.error('Error creating folder:', error);
      
      toast({
        title: "Creation failed",
        description: "There was an error creating the folder. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Prompts user for folder name and creates it
   */
  const promptCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name && name.trim()) {
      createFolder(name.trim());
    }
  };

  return {
    createFolder,
    promptCreateFolder,
    isCreating
  };
};