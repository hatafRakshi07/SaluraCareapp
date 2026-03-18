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

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function storeAuth(token: string, user: AuthUser): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function clearAuth(): Promise<void> {
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

async function apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(new URL(path, getApiUrl()).toString(), { ...options, headers });
}

export async function registerUser(email: string, name: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, name, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
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

export async function createPaymentIntent(params: {
  itemId: string;
  itemName: string;
  type: string;
  amount: number;
  scheduledDate?: string;
  scheduledTime?: string;
  address?: string;
}): Promise<{ clientSecret?: string; bookingId: string; paymentIntentId?: string; demo?: boolean }> {
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
