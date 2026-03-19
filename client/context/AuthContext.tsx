import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
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
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref so AppState handler always sees the latest token
  const tokenRef = useRef<string | null>(null);

  // ─── Clear any running expiry timer ───────────────────────────────────────
  const clearExpiryTimer = () => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  };

  // ─── Schedule auto-logout when JWT expires ────────────────────────────────
  const scheduleExpiryLogout = (tok: string, onExpire: () => void) => {
    clearExpiryTimer();
    const expiry = getTokenExpiry(tok);
    if (!expiry) return;
    const msUntilExpiry = expiry - Date.now() - 60_000;
    if (msUntilExpiry <= 0) {
      onExpire();
      return;
    }
    expiryTimerRef.current = setTimeout(onExpire, msUntilExpiry);
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    clearExpiryTimer();
    await clearAuth();
    tokenRef.current = null;
    setToken(null);
    setUser(null);
  };

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = async (newToken: string, newUser: AuthUser) => {
    await storeAuth(newToken, newUser);
    tokenRef.current = newToken;
    setToken(newToken);
    setUser(newUser);
    scheduleExpiryLogout(newToken, logout);
  };

  // ─── Update user in state + storage ──────────────────────────────────────
  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    const tok = tokenRef.current;
    if (tok) storeAuth(tok, updatedUser).catch(() => {});
  };

  // ─── Silently validate session with server ────────────────────────────────
  // Only clears session on definitive auth error — not network failures.
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
      // Network/server errors → stay logged in
    }
  };

  // ─── Refresh user profile (callable from screens) ────────────────────────
  const refreshUser = async () => {
    const tok = tokenRef.current;
    if (!tok) return;
    await verifyAndRefresh(tok);
  };

  // ─── Bootstrap: load & show session instantly, validate in background ────
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
            scheduleExpiryLogout(storedToken, logout);
          }
          setIsLoading(false);
          // Background validation — won't block the UI
          verifyAndRefresh(storedToken);
          return;
        }
      } catch {
        // ignore storage errors
      }
      setIsLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Register global 401 handler ─────────────────────────────────────────
  useEffect(() => {
    setUnauthorizedHandler(() => {
      // Can't call async logout directly in a sync callback; clear state manually
      clearExpiryTimer();
      clearAuth().catch(() => {});
      tokenRef.current = null;
      setToken(null);
      setUser(null);
    });
    return () => clearUnauthorizedHandler();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── AppState: re-validate when app comes to foreground ──────────────────
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
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, updateUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
