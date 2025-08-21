import { createClient } from "@supabase/supabase-js";
import { AUTH_TOKEN_STORAGE_KEY } from "../utils/config";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug logging (development only)
if (process.env.NODE_ENV === "development") {
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Anon Key exists:", !!supabaseAnonKey);
}

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: AUTH_TOKEN_STORAGE_KEY,
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Handle storage errors gracefully
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Handle storage errors gracefully
        }
      },
    },
  },
});
