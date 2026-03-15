import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { User } from "../types";
import { MOCK_USERS } from "../data/mockData";

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string, options?: { isStaffActive?: boolean }) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface LoginOptions {
  isStaffActive?: boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("edenecart_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });

  const login = useCallback(
    (username: string, _password: string, options?: LoginOptions): boolean => {
      const found = MOCK_USERS.find(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );
      if (!found) return false;
      if (found.role === "staff" && options?.isStaffActive === false) return false;
      setUser(found);
      localStorage.setItem("edenecart_user", JSON.stringify(found));
      return true;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("edenecart_user");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
    }),
    [user, login, logout]
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
