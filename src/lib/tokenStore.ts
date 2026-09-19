/**
 * Tokens live only in memory (module-level state), never in localStorage or
 * sessionStorage — this means a hard page refresh loses the session and the
 * user must log in again; that trade-off is deliberate to avoid exposing
 * tokens to XSS via web storage. Matches the backend's actual issued-token
 * shape (see swedox-backend AuthResponse).
 */
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setTokens(newAccessToken: string, newRefreshToken: string): void {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;
}

export function setAccessToken(newAccessToken: string): void {
  accessToken = newAccessToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
}
