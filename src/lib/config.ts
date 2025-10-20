/**
 * Centralized configuration for API URLs, ports, and host information
 * 
 * This file centralizes all environment-specific configuration to make
 * deployment and environment switching easier.
 */

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Base configuration
const config = {
  // Frontend configuration
  frontend: {
    port: parseInt(import.meta.env.VITE_FRONTEND_PORT || '8081'),
    host: 'localhost',
    protocol: 'https',
    get url() {
      return `${this.protocol}://${this.host}`;//:${this.port}`;
    }
  },

  // Backend API configuration
  backend: {
    port: parseInt(import.meta.env.VITE_BACKEND_PORT || '8001'),
    host: import.meta.env.VITE_BACKEND_HOST || 'localhost',
    protocol: 'https',
    get url() {
      return `${this.protocol}://${this.host}`;//:${this.port}`;
    },
    get apiBaseUrl() {
      return `${this.url}/api/v1`;
    }
  },

  // Supabase configuration from environment variables
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  // Environment-specific overrides
  development: {
    // Development-specific settings
    corsOrigins: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'],
  },

  production: {
    // Production-specific settings (to be configured)
    corsOrigins: [],
  }
};

// Debug environment variables (only in development)
if (isDevelopment) {
  console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
  console.log('Environment:', isDevelopment ? 'Development' : 'Production');
  console.log('Frontend URL:', config.frontend.url);
  console.log('Backend URL:', config.backend.url);
  console.log('Backend API Base URL:', config.backend.apiBaseUrl);
  console.log('Supabase URL:', config.supabase.url ? 'Set' : 'Not set');
  console.log('Supabase Anon Key:', config.supabase.anonKey ? 'Set (hidden)' : 'Not set');
}

// Apply environment-specific overrides
const envConfig = isDevelopment ? config.development : config.production;

// Export the final configuration
export const appConfig = {
  ...config,
  corsOrigins: envConfig.corsOrigins,
  isDevelopment,
  isProduction,
  api: {
    search: `${config.backend.apiBaseUrl}/search`,
    health: `${config.backend.apiBaseUrl}/health`,
    research: `${config.backend.apiBaseUrl}/research`,
  }
};

// Type definitions for better TypeScript support
export interface AppConfig {
  frontend: {
    port: number;
    host: string;
    protocol: string;
    url: string;
  };
  backend: {
    port: number;
    host: string;
    protocol: string;
    url: string;
    apiBaseUrl: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  corsOrigins: string[];
  isDevelopment: boolean;
  isProduction: boolean;
  api: {
    search: string;
    health: string;
    research: string;
  };
} 