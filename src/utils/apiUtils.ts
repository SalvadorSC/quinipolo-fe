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

type CacheOptions = {
  ttlMs?: number; // how long to keep the cached value (default 15000ms)
  key?: string; // override the cache key if needed
  skip?: boolean; // set true to disable cache for this call
};

type RequestConfig = AxiosRequestConfig & { cache?: CacheOptions };

const getParamsKey = (params: any): string => {
  if (!params) return "";
  try {
    // Stable stringify params for cache key
    const keys = Object.keys(params).sort();
    const obj: Record<string, any> = {};
    for (const k of keys) obj[k] = params[k];
    return JSON.stringify(obj);
  } catch {
    return "";
  }
};

const cacheStore = new Map<string, { timestamp: number; data: any }>();
const inflightStore = new Map<string, Promise<any>>();

/**
 * Makes an API call using Axios, always including the Supabase access token if available.
 * Adds lightweight GET caching + in-flight deduplication.
 */
const apiCall = async <T>(
  method: "get" | "post" | "put" | "patch",
  url: string,
  data: any = null,
  config: RequestConfig = {}
): Promise<T> => {
  try {
    const token = await getAccessToken();
    const headers = {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const fullUrl = `${API_BASE_URL}${url}`;

    // GET caching and dedupe
    if (method === "get") {
      const ttlMs = config.cache?.ttlMs ?? 15000;
      const paramsKey = getParamsKey(config.params);
      const cacheKey = config.cache?.key || `${fullUrl}?${paramsKey}`;

      if (!config.cache?.skip) {
        const cached = cacheStore.get(cacheKey);
        const now = Date.now();
        if (cached && now - cached.timestamp < ttlMs) {
          console.debug("[api-cache] hit", cacheKey);
          return cached.data as T;
        }

        const inflight = inflightStore.get(cacheKey);
        if (inflight) {
          console.debug("[api-cache] dedupe waiting", cacheKey);
          return inflight as Promise<T>;
        }

        const requestPromise = (async () => {
          const response: AxiosResponse<T> = await axios({
            method,
            url: fullUrl,
            data,
            ...config,
            headers,
          });
          cacheStore.set(cacheKey, {
            timestamp: Date.now(),
            data: response.data,
          });
          return response.data;
        })();

        inflightStore.set(cacheKey, requestPromise);
        try {
          const result = await requestPromise;
          return result;
        } finally {
          inflightStore.delete(cacheKey);
        }
      }
    }

    const response: AxiosResponse<T> = await axios({
      method,
      url: fullUrl,
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
  config: RequestConfig = {}
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
