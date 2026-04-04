import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  storeAuth,
  clearAuth,
  getStoredToken,
  getStoredUser,
  fetchCurrentUser,
  getTokenExpiry,
  isTokenExpired,
  setUnauthorizedHandler,
  clearUnauthorizedHandler,
  type AuthUser,
} from "../lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tokenRef = useRef<string | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExpiryTimer = () => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  };

  const logout = async () => {
    clearExpiryTimer();
    await clearAuth();
    tokenRef.current = null;
    setToken(null);
    setUser(null);
  };

  const scheduleExpiryLogout = (tok: string) => {
    clearExpiryTimer();
    const expiry = getTokenExpiry(tok);
    if (!expiry) return;
    const msUntilExpiry = expiry - Date.now() - 60_000;
    if (msUntilExpiry <= 0) {
      logout();
      return;
    }
    expiryTimerRef.current = setTimeout(logout, msUntilExpiry);
  };

  const login = async (newToken: string, newUser: AuthUser) => {
    console.log("[Auth] login called for:", newUser.email);
    await storeAuth(newToken, newUser);
    tokenRef.current = newToken;
    setToken(newToken);
    setUser(newUser);
    scheduleExpiryLogout(newToken);
    console.log("[Auth] login complete, user set:", newUser.email);
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    const tok = tokenRef.current;
    if (tok) storeAuth(tok, updatedUser).catch(() => {});
  };

  const verifyAndRefresh = async (tok: string): Promise<void> => {
    if (isTokenExpired(tok)) {
      await logout();
      return;
    }
    try {
      const freshUser = await fetchCurrentUser();
      setUser(freshUser);
      await storeAuth(tok, freshUser);
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      if (
        msg.includes("Unauthorized") ||
        msg.includes("Invalid") ||
        msg.includes("expired")
      ) {
        await logout();
      }
    }
  };

  const refreshUser = async () => {
    const tok = tokenRef.current;
    if (!tok) return;
    await verifyAndRefresh(tok);
  };

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getStoredToken();
        if (storedToken) {
          const storedUser = await getStoredUser();
          if (storedUser) {
            tokenRef.current = storedToken;
            setToken(storedToken);
            setUser(storedUser);
            scheduleExpiryLogout(storedToken);
            setIsLoading(false);
            verifyAndRefresh(storedToken);
            return;
          }
        }
      } catch {
        // ignore storage errors
      }
      setIsLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearExpiryTimer();
      clearAuth().catch(() => {});
      tokenRef.current = null;
      setToken(null);
      setUser(null);
    });
    return () => clearUnauthorizedHandler();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active" && tokenRef.current) {
        verifyAndRefresh(tokenRef.current);
      }
    };
    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
