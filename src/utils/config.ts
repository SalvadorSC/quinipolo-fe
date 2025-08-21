// Environment configuration utility
export const config = {
  // Base URL for the application
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : window.location.origin,

  // API base URL
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000",

  // Supabase configuration
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  },

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

// Helper function to get redirect URLs
export const getRedirectUrl = (path: string): string => {
  return `${config.baseUrl}${path}`;
};

// Centralized storage key for Supabase auth token
export const AUTH_TOKEN_STORAGE_KEY = "quinipolo-auth-token";

// Quinipolo filtering configuration
export const PENDING_QUINIPOLO_RECENT_DAYS = 30;
