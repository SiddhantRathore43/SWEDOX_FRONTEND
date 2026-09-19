import { apiClient, extractErrorMessage, setOnSessionExpired } from "@/lib/apiClient";
import { clearTokens, getRefreshToken, setTokens } from "@/lib/tokenStore";
import type { AuthResponse } from "@/types/api";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface AuthUser {
  userId: number;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(data: AuthResponse): AuthUser {
  setTokens(data.accessToken, data.refreshToken);
  return { userId: data.userId, email: data.email, roles: data.roles };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Tokens are memory-only (never persisted, see tokenStore.ts) — there is
  // no session-restore call to await on mount, so nothing is ever actually
  // loading here. Kept as state (rather than removed) so consumers that
  // check `loading` before redirecting don't need to change.
  const [loading] = useState(false);

  useEffect(() => {
    setOnSessionExpired(() => {
      setUser(null);
    });
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>("/api/v1/auth/register", { email, password });
      setUser(toAuthUser(response.data));
      return { error: null };
    } catch (err) {
      return { error: new Error(extractErrorMessage(err)) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>("/api/v1/auth/login", { email, password });
      setUser(toAuthUser(response.data));
      return { error: null };
    } catch (err) {
      return { error: new Error(extractErrorMessage(err)) };
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiClient.post("/api/v1/auth/logout", { refreshToken });
      }
    } catch {
      // Best-effort revoke; the client-side session is cleared regardless.
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const isAdmin = useMemo(() => user?.roles.includes("ROLE_ADMIN") ?? false, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
