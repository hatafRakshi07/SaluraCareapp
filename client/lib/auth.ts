import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getApiUrl } from "./query-client";

const TOKEN_KEY = "saluracare_token";
const USER_KEY = "saluracare_user";
const SESSION_TOKEN_KEY = "sc_session_token";
const SESSION_USER_KEY = "sc_session_user";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isPremium: boolean | null;
}

// ─── Global 401 handler ──────────────────────────────────────────────────────
let _onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler;
}

export function clearUnauthorizedHandler() {
  _onUnauthorized = null;
}

// ─── In-memory token cache ────────────────────────────────────────────────────
let _memToken: string | null = null;

// ─── sessionStorage helpers (web only, sync, no hang risk) ───────────────────
function sessionSet(key: string, value: string) {
  try {
    if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(key, value);
    }
  } catch {}
}

function sessionGet(key: string): string | null {
  try {
    if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
      return sessionStorage.getItem(key);
    }
  } catch {}
  return null;
}

function sessionClear() {
  try {
    if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_USER_KEY);
    }
  } catch {}
}

// ─── JWT helpers (no library needed) ─────────────────────────────────────────
export function getTokenExpiry(token: string): number | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const json = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return false;
  return Date.now() > expiry - 60_000;
}

// ─── Storage ─────────────────────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, fallback: T, ms = 1500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function getStoredToken(): Promise<string | null> {
  // Check in-memory first
  if (_memToken !== null) return _memToken;
  // Check sessionStorage (web, sync, no hang)
  const sessToken = sessionGet(SESSION_TOKEN_KEY);
  if (sessToken) { _memToken = sessToken; return sessToken; }
  // Fallback to AsyncStorage with timeout
  return withTimeout(AsyncStorage.getItem(TOKEN_KEY), null);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  // Check sessionStorage first (web)
  const sessUser = sessionGet(SESSION_USER_KEY);
  if (sessUser) {
    try { return JSON.parse(sessUser); } catch {}
  }
  // Fallback to AsyncStorage
  const raw = await withTimeout(AsyncStorage.getItem(USER_KEY), null);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function storeAuth(token: string, user: AuthUser): Promise<void> {
  _memToken = token;
  // Always write to sessionStorage (web, sync)
  sessionSet(SESSION_TOKEN_KEY, token);
  sessionSet(SESSION_USER_KEY, JSON.stringify(user));
  // Also persist to AsyncStorage (best-effort, with timeout)
  await withTimeout(
    Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ]).then(() => undefined),
    undefined
  );
}

export async function clearAuth(): Promise<void> {
  _memToken = null;
  sessionClear();
  await withTimeout(
    Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]).then(() => undefined),
    undefined
  );
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(new URL(path, getApiUrl()).toString(), { ...options, headers });

  if (res.status === 401 && _onUnauthorized) {
    _onUnauthorized();
  }

  return res;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────
export async function registerUser(
  email: string,
  name: string,
  password: string
): Promise<{ token: string; user: AuthUser }> {
  const res = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, name, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; user: AuthUser }> {
  const res = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await apiRequest("/api/auth/me");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch user");
  return data.user;
}

// ─── Payment / booking endpoints ──────────────────────────────────────────────
export async function createPaymentIntent(
  params: {
    serviceType?: string;
    serviceName?: string;
    amount: number;
    scheduledDate?: string;
    scheduledTime?: string;
    address?: string;
  },
  _token?: string
): Promise<{ clientSecret?: string; bookingId: string; paymentIntentId?: string; demo?: boolean }> {
  const res = await apiRequest("/api/payments/create-intent", {
    method: "POST",
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Payment failed");
  return data;
}

export async function confirmPayment(bookingId: string, paymentIntentId?: string): Promise<void> {
  await apiRequest("/api/payments/confirm", {
    method: "POST",
    body: JSON.stringify({ bookingId, paymentIntentId }),
  });
}

export async function getUserBookings() {
  const res = await apiRequest("/api/bookings");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch bookings");
  return data.bookings;
}
