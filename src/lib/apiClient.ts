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

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) {
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  return "Something went wrong. Please try again.";
}
