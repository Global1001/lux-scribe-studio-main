import { toast } from 'sonner';

/**
 * Centralized error handling utility
 * Provides consistent error logging and user notifications
 */
export class ErrorHandler {
  /**
   * Handles errors by logging them and showing appropriate user notifications
   * @param error - The error object or message
   * @param context - Additional context about where the error occurred
   * @param showToast - Whether to show a toast notification to the user
   */
  static handle(error: unknown, context?: string, showToast: boolean = false): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Structure error details for logging
    const errorDetails = {
      message: errorMessage,
      context,
      stack: errorStack,
      timestamp: new Date().toISOString()
    };

    // Log to console in development, would be external service in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', errorDetails);
    }

    // Show user-friendly toast notification if requested
    if (showToast) {
      const userMessage = context 
        ? `Error in ${context}: ${errorMessage}`
        : `An error occurred: ${errorMessage}`;
      
      toast.error(userMessage);
    }
  }

  /**
   * Handles API errors specifically
   * @param error - The error object
   * @param apiEndpoint - The API endpoint that failed
   * @param showToast - Whether to show a toast notification
   */
  static handleApiError(error: unknown, apiEndpoint: string, showToast: boolean = true): void {
    const context = `API call to ${apiEndpoint}`;
    this.handle(error, context, showToast);
  }

  /**
   * Handles research query errors
   * @param error - The error object
   * @param query - The research query that failed
   */
  static handleResearchError(error: unknown, query: string): void {
    const context = `Research query: "${query}"`;
    this.handle(error, context, true);
  }

  /**
   * Creates a retry wrapper for async operations
   * @param operation - The async operation to retry
   * @param maxRetries - Maximum number of retry attempts
   * @param delay - Delay between retries in milliseconds
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }

        // Log retry attempt
        this.handle(error, `Retry attempt ${attempt}/${maxRetries}`, false);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}