/**
 * Supabase client configuration and initialization
 * 
 * This file contains the Supabase client setup with:
 * - Database URL and API key configuration
 * - Authentication settings for session management
 * - TypeScript type safety with generated database types
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { appConfig } from '@/lib/config';

/**
 * Validates Supabase configuration to ensure it's properly set up
 */
const validateSupabaseConfig = () => {
  const { url, anonKey } = appConfig.supabase;
  
  if (!url || !anonKey) {
    console.error('ERROR: Supabase configuration missing. Please check your .env file.');
    console.error('Required environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    
    // In development, provide more helpful error message
    if (appConfig.isDevelopment) {
      console.error('Hint: Create a .env file in the project root with the required variables.');
      console.error('You can copy them from env.example and update with your Supabase credentials.');
    }
    
    return false;
  }
  
  return true;
};

// Validate configuration and warn if invalid
const isConfigValid = validateSupabaseConfig();
if (!isConfigValid && appConfig.isDevelopment) {
  console.warn('Supabase client initialized with invalid configuration. Some features may not work correctly.');
}

/**
 * Supabase client instance with authentication and storage configuration
 * 
 * Configuration includes:
 * - localStorage for session persistence
 * - Automatic token refresh
 * - Session persistence across browser sessions
 * 
 * Usage example:
 * ```typescript
 * import { supabase } from "@/integrations/supabase/client";
 * 
 * // Query data
 * const { data, error } = await supabase
 *   .from('documents')
 *   .select('*');
 * 
 * // Upload files
 * const { data, error } = await supabase.storage
 *   .from('documents')
 *   .upload('path/to/file', file);
 * ```
 */

export const supabase = createClient<Database>(
  appConfig.supabase.url, 
  appConfig.supabase.anonKey, 
  {
    auth: {
      storage: localStorage,        // Use localStorage for session storage
      persistSession: true,         // Persist sessions across browser restarts
      autoRefreshToken: true,       // Automatically refresh expired tokens
    }
  }
);