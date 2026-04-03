import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
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

// ─── Module-level auth store ──────────────────────────────────────────────────
// Bypasses React Compiler memoization by using useSyncExternalStore.

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

let _state: AuthState = { user: null, token: null, isLoading: true };
const _listeners = new Set<() => void>();

function getSnapshot(): AuthState {
  return _state;
}

function subscribe(listener: () => void): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function setState(partial: Partial<AuthState>) {
  _state = { ..._state, ...partial };
  _listeners.forEach((l) => l());
}

// ─── AuthContext (functions only — state is in the external store) ────────────
interface AuthContextType {
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef<string | null>(null);

  const clearExpiryTimer = () => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  };

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

  const logout = async () => {
    clearExpiryTimer();
    await clearAuth();
    tokenRef.current = null;
    setState({ user: null, token: null });
  };

  const login = async (newToken: string, newUser: AuthUser) => {
    await storeAuth(newToken, newUser);
    tokenRef.current = newToken;
    setState({ user: newUser, token: newToken });
    scheduleExpiryLogout(newToken, logout);
  };

  const updateUser = (updatedUser: AuthUser) => {
    setState({ user: updatedUser });
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
      setState({ user: freshUser });
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
            setState({ user: storedUser, token: storedToken, isLoading: false });
            scheduleExpiryLogout(storedToken, logout);
          } else {
            setState({ isLoading: false });
          }
          verifyAndRefresh(storedToken);
          return;
        }
      } catch {
        // ignore storage errors
      }
      setState({ isLoading: false });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearExpiryTimer();
      clearAuth().catch(() => {});
      tokenRef.current = null;
      setState({ user: null, token: null });
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
    <AuthContext.Provider value={{ login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── useAuth: reads from the external store (bypasses React Compiler) ─────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...state, ...ctx };
}
