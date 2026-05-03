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

// ─── External store: survives React context boundaries ────────────────────────
type AuthState = { user: AuthUser | null; token: string | null; isLoading: boolean };
type Listener = (state: AuthState) => void;

let _state: AuthState = { user: null, token: null, isLoading: true };
const _listeners = new Set<Listener>();

function getState(): AuthState { return _state; }

function setState(next: Partial<AuthState>) {
  _state = { ..._state, ...next };
  _listeners.forEach(l => l(_state));
}

function subscribe(l: Listener): () => void {
  _listeners.add(l);
  return () => _listeners.delete(l);
}

function useAuthStore(): AuthState {
  return useSyncExternalStore(subscribe, getState);
}

// ─── Context (for backwards compat / function access only) ───────────────────
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();
  const tokenRef = useRef<string | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track init so effects only run once
  const initializedRef = useRef(false);

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
    setState({ token: null, user: null, isLoading: false });
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

  const login = (newToken: string, newUser: AuthUser): void => {
    tokenRef.current = newToken;
    // Fire-and-forget: storage is only for persistence across restarts.
    // Do NOT await it — a hanging or slow storage must not block navigation.
    storeAuth(newToken, newUser).catch(() => {});
    setState({ token: newToken, user: newUser, isLoading: false });
    scheduleExpiryLogout(newToken);
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
    if (initializedRef.current) return;
    initializedRef.current = true;
    (async () => {
      try {
        const storedToken = await getStoredToken();
        if (storedToken) {
          const storedUser = await getStoredUser();
          if (storedUser) {
            tokenRef.current = storedToken;
            setState({ token: storedToken, user: storedUser, isLoading: false });
            scheduleExpiryLogout(storedToken);
            verifyAndRefresh(storedToken);
            return;
          }
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
      setState({ token: null, user: null, isLoading: false });
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
    <AuthContext.Provider value={{
      user: store.user,
      token: store.token,
      isLoading: store.isLoading,
      login,
      logout,
      updateUser,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Direct store hook — bypasses React context propagation entirely.
// Use when context updates aren't propagating through NavigationContainer.
export { useAuthStore };
