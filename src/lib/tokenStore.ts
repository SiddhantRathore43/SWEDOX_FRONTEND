const ACCESS_TOKEN_KEY = "vyonixpay_access_token";
const REFRESH_TOKEN_KEY = "vyonixpay_refresh_token";

let accessToken: string | null = typeof window !== "undefined" ? sessionStorage.getItem(ACCESS_TOKEN_KEY) : null;
let refreshToken: string | null = typeof window !== "undefined" ? sessionStorage.getItem(REFRESH_TOKEN_KEY) : null;

export function getAccessToken(): string | null {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (!refreshToken && typeof window !== "undefined") {
    refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return refreshToken;
}

export function setTokens(newAccessToken: string, newRefreshToken: string): void {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
  }
}

export function setAccessToken(newAccessToken: string): void {
  accessToken = newAccessToken;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  }
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem("vyonixpay_user");
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {
      // Ignore security/sandbox storage access limitations
    }
  }
}
