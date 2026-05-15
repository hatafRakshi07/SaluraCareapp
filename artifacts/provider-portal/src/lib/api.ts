const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("provider_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error?: string;
    };
    throw new Error(body.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export function getAdminKey(): string {
  return (
    new URLSearchParams(window.location.search).get("key") ??
    localStorage.getItem("admin_key") ??
    ""
  );
}
