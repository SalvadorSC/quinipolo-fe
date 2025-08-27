import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { supabase } from "../lib/supabaseClient";
import { AUTH_TOKEN_STORAGE_KEY } from "./config";
import { GoogleUser } from "../types/auth";

// Base URL for the API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Helper to get the current Supabase access token (async).
 */
const getAccessToken = async (): Promise<string | null> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    // Check if token is expired or about to expire (within 5 minutes)
    if (session?.access_token && session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      if (expiresAt <= fiveMinutesFromNow) {
        console.log("Token expired or expiring soon, refreshing...");
        const {
          data: { session: refreshedSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.error("Error refreshing session:", refreshError);
          return null;
        }

        return refreshedSession?.access_token || null;
      }
    }

    return session?.access_token || null;
  } catch (error) {
    console.error("Error in getAccessToken:", error);
    return null;
  }
};

/**
 * Makes an API call using Axios, always including the Supabase access token if available.
 *
 * @param method - The HTTP method ("get", "post", "put", or "patch").
 * @param url - The endpoint URL.
 * @param data - The data to be sent with the request (for POST, PUT, and PATCH requests).
 * @param config - Additional Axios request configuration.
 * @returns The response data of type T.
 */
const apiCall = async <T>(
  method: "get" | "post" | "put" | "patch",
  url: string,
  data: any = null,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  try {
    const token = await getAccessToken();
    const headers = {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response: AxiosResponse<T> = await axios({
      method,
      url: `${API_BASE_URL}${url}`,
      data,
      ...config,
      headers,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error in ${method.toUpperCase()} ${url}:`, error);

    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Authentication error, redirecting to login");
      // Clear any stored session data
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      // Redirect to login page
      window.location.href = "/sign-in";
      throw new Error("Authentication required");
    }

    throw error;
  }
};

/**
 * Makes a GET request.
 *
 * @param url - The endpoint URL.
 * @param config - Additional Axios request configuration.
 * @returns The response data of type T.
 */
export const apiGet = async <T>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> => apiCall<T>("get", url, null, config);

/**
 * Makes a POST request.
 *
 * @param url - The endpoint URL.
 * @param data - The data to be sent with the request.
 * @param config - Additional Axios request configuration.
 * @returns The response data of type T.
 */
export const apiPost = async <T>(
  url: string,
  data: any,
  config: AxiosRequestConfig = {}
): Promise<T> => apiCall<T>("post", url, data, config);

/**
 * Makes a PUT request.
 *
 * @param url - The endpoint URL.
 * @param data - The data to be sent with the request.
 * @param config - Additional Axios request configuration.
 * @returns The response data of type T.
 */
export const apiPut = async <T>(
  url: string,
  data: any,
  config: AxiosRequestConfig = {}
): Promise<T> => apiCall<T>("put", url, data, config);

/**
 * Makes a PATCH request.
 *
 * @param url - The endpoint URL.
 * @param data - The data to be sent with the request.
 * @param config - Additional Axios request configuration.
 * @returns The response data of type T.
 */
export const apiPatch = async <T>(
  url: string,
  data: any,
  config: AxiosRequestConfig = {}
): Promise<T> => apiCall<T>("patch", url, data, config);

export const handleGoogleSignUp = async (user: GoogleUser) => {
  try {
    const response = await apiPost("/api/auth/google-signup", {
      userId: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name,
      username: user.user_metadata?.username,
    });
    return response;
  } catch (error) {
    console.error("Error in Google signup:", error);
    throw error;
  }
};
