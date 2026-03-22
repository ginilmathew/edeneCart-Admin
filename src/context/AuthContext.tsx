import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "../types";
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";
import { getAccessToken, setAccessToken } from "../lib/auth-token";

const USER_KEY = "edenecart_user";

interface LoginResult {
  ok: true;
}

interface LoginFailure {
  ok: false;
  message: string;
}

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string) => Promise<LoginResult | LoginFailure>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthResponse {
  accessToken: string;
  user: User;
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      localStorage.removeItem(USER_KEY);
      return;
    }
    try {
      const me = await api.get<User>(endpoints.authMe);
      setUser(me);
      localStorage.setItem(USER_KEY, JSON.stringify(me));
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult | LoginFailure> => {
      const trimmed = username.trim();
      if (!trimmed) return { ok: false, message: "Enter username" };
      if (!password) return { ok: false, message: "Enter password" };
      try {
        const data = await api.post<AuthResponse>(endpoints.authLogin, {
          username: trimmed,
          password,
        });
        setAccessToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { ok: true };
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Sign in failed";
        return { ok: false, message };
      }
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user && !!getAccessToken(),
      refreshUser,
    }),
    [user, login, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
