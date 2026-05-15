import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";

const TEAL = "#00B5A5";
const NAVY = "#1A3A52";

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

const ROLE_LABELS: Record<string, string> = {
  nurse: "Home Nurse",
  caretaker: "Caretaker",
  physiotherapist: "Physiotherapist",
  lab: "Lab Provider",
  pharmacy: "Pharmacy",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#d97706", bg: "#fffbeb" },
  approved: { label: "Approved", color: "#059669", bg: "#ecfdf5" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fef2f2" },
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";

interface ProviderRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  experience: number | null;
  qualification: string | null;
  city: string | null;
  pricePerHour: number | null;
  status: string | null;
  createdAt: string | null;
}

async function adminFetch<T>(path: string, key: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-key": key,
    ...(options.headers as Record<string, string>),
  };
  const separator = path.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${path}${separator}key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({ error: res.statusText }))) as { error?: string };
    throw new Error(body.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [storedKey] = useState<string>(
    () =>
      new URLSearchParams(window.location.search).get("key") ??
      localStorage.getItem("admin_key") ??
      "",
  );
  const [inputKey, setInputKey] = useState(storedKey);
  const [activeKey, setActiveKey] = useState(storedKey);
  const [filter, setFilter] = useState<StatusFilter>("pending");

  useEffect(() => {
    if (activeKey) localStorage.setItem("admin_key", activeKey);
  }, [activeKey]);

  const providersQuery = useQuery<ProviderRecord[], Error>({
    queryKey: ["admin", "providers", filter, activeKey],
    queryFn: () => {
      const path = filter === "all"
        ? "/admin/providers"
        : `/admin/providers?status=${filter}`;
      return adminFetch<ProviderRecord[]>(path, activeKey);
    },
    enabled: !!activeKey,
    refetchInterval: 30_000,
    retry: false,
  });

  const updateStatusMutation = useMutation<
    { provider: ProviderRecord },
    Error,
    { id: string; status: string }
  >({
    mutationFn: ({ id, status }) =>
      adminFetch<{ provider: ProviderRecord }>(
        `/admin/providers/${id}/status`,
        activeKey,
        { method: "PUT", body: JSON.stringify({ status }) },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "providers"] });
    },
  });

  if (!activeKey) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8 text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: NAVY }}
            >
              <span className="text-white text-xl">🔐</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Admin Access</h1>
            <p className="text-gray-500 text-sm mb-6">Enter the admin key to continue</p>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Admin key"
              autoComplete="off"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 transition"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  localStorage.setItem("admin_key", inputKey);
                  setActiveKey(inputKey);
                }
              }}
            />
            <button
              onClick={() => {
                localStorage.setItem("admin_key", inputKey);
                setActiveKey(inputKey);
              }}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm"
              style={{ background: NAVY }}
            >
              Enter Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (providersQuery.isError) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">{providersQuery.error.message}</p>
            <button
              onClick={() => { setActiveKey(""); setInputKey(""); }}
              className="text-sm text-gray-500 hover:underline"
            >
              Try a different key
            </button>
          </div>
        </div>
      </div>
    );
  }

  const providers = providersQuery.data ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage provider registrations</p>
          </div>
          <button
            onClick={() => void queryClient.invalidateQueries({ queryKey: ["admin", "providers"] })}
            className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            ↻ Refresh
          </button>
        </div>

        {updateStatusMutation.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {updateStatusMutation.error.message}
          </div>
        )}

        <div className="flex gap-2 mb-5 flex-wrap">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize"
              style={{
                background:
                  filter === f
                    ? f === "pending"
                      ? TEAL
                      : f === "approved"
                        ? "#059669"
                        : f === "rejected"
                          ? "#dc2626"
                          : NAVY
                    : "white",
                color: filter === f ? "white" : "#374151",
                borderColor: filter === f ? "transparent" : "#e5e7eb",
              }}
            >
              {f === "all" ? "All Providers" : `${f.charAt(0).toUpperCase()}${f.slice(1)}`}
            </button>
          ))}
        </div>

        {providersQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-10 h-10 rounded-full border-4 border-gray-200 animate-spin"
              style={{ borderTopColor: TEAL }}
            />
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium">No {filter === "all" ? "" : filter} providers found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {providers.map((p) => {
              const statusConf = STATUS_CONFIG[p.status ?? "pending"] ?? STATUS_CONFIG.pending;
              const isActing = updateStatusMutation.isPending && updateStatusMutation.variables?.id === p.id;
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ background: TEAL }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{p.name}</span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ color: statusConf.color, background: statusConf.bg }}
                          >
                            {statusConf.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{p.email}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400">
                          <span>{ROLE_LABELS[p.role] ?? p.role}</span>
                          {p.city && <span>📍 {p.city}</span>}
                          {p.experience != null && <span>🕐 {p.experience} yrs</span>}
                          {p.pricePerHour != null && <span>💰 MYR {p.pricePerHour}/hr</span>}
                        </div>
                        {p.qualification && (
                          <p className="text-xs text-gray-400 mt-1 italic">{p.qualification}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap flex-shrink-0">
                      {p.status !== "approved" && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: p.id, status: "approved" })}
                          disabled={isActing}
                          className="text-sm font-medium px-4 py-2 rounded-xl text-white transition-opacity"
                          style={{ background: TEAL, opacity: isActing ? 0.6 : 1 }}
                        >
                          {isActing ? "…" : "Approve"}
                        </button>
                      )}
                      {p.status !== "rejected" && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: p.id, status: "rejected" })}
                          disabled={isActing}
                          className="text-sm font-medium px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                        >
                          {isActing ? "…" : "Reject"}
                        </button>
                      )}
                      {p.status === "approved" && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: p.id, status: "pending" })}
                          disabled={isActing}
                          className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                        >
                          Set Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
