import { apiClient, extractErrorMessage, setOnSessionExpired } from "@/lib/apiClient";
import { clearTokens, getRefreshToken, setTokens } from "@/lib/tokenStore";
import type { AuthResponse } from "@/types/api";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface AuthUser {
  userId: number;
  email: string;
  roles: string[];
}

export interface AuthResult {
  error: Error | null;
  user?: AuthUser | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "vyonixpay_user";

function toAuthUser(data: AuthResponse): AuthUser {
  setTokens(data.accessToken, data.refreshToken);
  const authUser: AuthUser = { userId: data.userId, email: data.email, roles: data.roles };
  if (typeof window !== "undefined") {
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
  }
  return authUser;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [loading] = useState(false);

  useEffect(() => {
    setOnSessionExpired(() => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(USER_STORAGE_KEY);
        try {
          sessionStorage.clear();
          localStorage.clear();
        } catch {
          // Ignore
        }
      }
      clearTokens();
      setUser(null);
    });
  }, []);

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await apiClient.post<AuthResponse>("/api/v1/auth/register", { email, password });
      const authUser = toAuthUser(response.data);
      setUser(authUser);
      return { error: null, user: authUser };
    } catch (err) {
      return { error: new Error(extractErrorMessage(err)), user: null };
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await apiClient.post<AuthResponse>("/api/v1/auth/login", { email, password });
      const authUser = toAuthUser(response.data);
      setUser(authUser);
      return { error: null, user: authUser };
    } catch (err) {
      return { error: new Error(extractErrorMessage(err)), user: null };
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
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(USER_STORAGE_KEY);
        try {
          sessionStorage.clear();
          localStorage.clear();
        } catch {
          // Ignore
        }
      }
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
