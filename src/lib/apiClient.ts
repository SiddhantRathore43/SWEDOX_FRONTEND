import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from "./tokenStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Separate instance for the refresh call itself so its interceptor doesn't recurse.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
});

let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(handler: () => void): void {
  onSessionExpired = handler;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  const response = await refreshClient.post("/api/v1/auth/refresh", { refreshToken });
  const newAccessToken: string = response.data.accessToken;
  setAccessToken(newAccessToken);
  return newAccessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccessToken = await refreshPromise;
        originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return apiClient.request(originalRequest);
      } catch {
        clearTokens();
        onSessionExpired?.();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

interface BackendErrorPayload {
  message?: string;
  code?: string;
  errors?: Array<{ field?: string; message?: string }>;
}

function containsSensitiveLeak(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes("/api/") ||
    lower.includes("http://") ||
    lower.includes("https://") ||
    lower.includes("exception") ||
    lower.includes("trace:") ||
    lower.includes("stacktrace") ||
    lower.includes("sql") ||
    lower.includes("org.springframework") ||
    lower.includes("java.") ||
    lower.includes("class ") ||
    lower.includes("column") ||
    lower.includes("table") ||
    lower.includes("bad credentials") ||
    lower.includes("failed to parse")
  );
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as BackendErrorPayload | undefined;

    // 1. If backend returned specific validation errors, pick the first user-friendly error if clean
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const firstMsg = data.errors[0]?.message;
      if (firstMsg && typeof firstMsg === "string" && !containsSensitiveLeak(firstMsg)) {
        return firstMsg;
      }
    }

    // 2. If backend provided a custom business message, sanitize and check for sensitive leaks
    if (data?.message && typeof data.message === "string") {
      if (!containsSensitiveLeak(data.message)) {
        return data.message;
      }
    }

    // 3. User-friendly fallbacks based on HTTP status codes
    if (status === 400) return "Invalid request. Please check the provided information.";
    if (status === 401) return "Invalid username or password. Please verify your credentials.";
    if (status === 403) return "Access denied. You do not have permission to perform this action.";
    if (status === 404) return "Requested resource was not found.";
    if (status === 409) return "This record already exists.";
    if (status === 429) return "Too many requests. Please wait a moment and try again.";
    if (status && status >= 500) return "Unable to process request at this time. Please try again.";

    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return "Connection timed out. Please check your internet connection.";
    }
    if (error.message?.includes("Network Error")) {
      return "Unable to reach the server. Please check your network connection.";
    }
  }

  return "Unable to process request at this time. Please try again.";
}
