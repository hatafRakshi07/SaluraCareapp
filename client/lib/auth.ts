import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "./query-client";

const TOKEN_KEY = "saluracare_token";
const USER_KEY = "saluracare_user";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isPremium: boolean | null;
}

// ─── Global 401 handler ──────────────────────────────────────────────────────
// AuthContext registers this so any 401 from any API call auto-logs the user out
let _onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler;
}

export function clearUnauthorizedHandler() {
  _onUnauthorized = null;
}

// ─── In-memory token cache ────────────────────────────────────────────────────
// Keeps the active token in memory so API calls work even when storage is
// unavailable (e.g. iframe contexts where localStorage may be blocked).
let _memToken: string | null = null;

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
export async function getStoredToken(): Promise<string | null> {
  if (_memToken !== null) return _memToken;
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function storeAuth(token: string, user: AuthUser): Promise<void> {
  _memToken = token;
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function clearAuth(): Promise<void> {
  _memToken = null;
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
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

  // Auto-logout on 401 anywhere in the app
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
