import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";

const TEAL = "#00B5A5";
const NAVY = "#1A3A52";

const ROLE_LABELS: Record<string, string> = {
  nurse: "Home Nurse",
  caretaker: "Caretaker",
  physiotherapist: "Physiotherapist",
  lab: "Lab Provider",
  pharmacy: "Pharmacy",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending Review", color: "#d97706", bg: "#fffbeb" },
  approved: { label: "Approved", color: "#059669", bg: "#ecfdf5" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "#fef2f2" },
};

interface ProviderProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  experience: number | null;
  qualification: string | null;
  address: string | null;
  city: string | null;
  availability: boolean | null;
  pricePerHour: number | null;
  rating: number | null;
  status: string | null;
  createdAt: string | null;
}

interface BookingRecord {
  id: string;
  userId: string;
  type: string;
  itemId: string;
  itemName: string;
  amount: string;
  status: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  address: string | null;
  createdAt: string | null;
}

interface BookingsResponse {
  bookings: BookingRecord[];
  totalEarnings: number;
  monthlyEarnings: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = localStorage.getItem("provider_token");

  const profileQuery = useQuery<{ provider: ProviderProfile }, Error>({
    queryKey: ["provider", "me"],
    queryFn: () => apiFetch<{ provider: ProviderProfile }>("/providers/me"),
    enabled: !!token,
    retry: false,
  });

  const bookingsQuery = useQuery<BookingsResponse, Error>({
    queryKey: ["provider", "me", "bookings"],
    queryFn: () => apiFetch<BookingsResponse>("/providers/me/bookings"),
    enabled: !!token && !!profileQuery.data,
    refetchInterval: 30_000,
  });

  const availabilityMutation = useMutation<
    { provider: ProviderProfile },
    Error,
    { id: string; availability: boolean }
  >({
    mutationFn: ({ id, availability }) =>
      apiFetch<{ provider: ProviderProfile }>(`/providers/${id}`, {
        method: "PUT",
        body: JSON.stringify({ availability }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["provider", "me"] });
    },
  });

  function logout() {
    localStorage.removeItem("provider_token");
    localStorage.removeItem("provider_data");
    navigate("/");
  }

  if (!token) {
    navigate("/login");
    return null;
  }

  if (profileQuery.isError) {
    localStorage.removeItem("provider_token");
    localStorage.removeItem("provider_data");
    navigate("/login");
    return null;
  }

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-10 h-10 rounded-full border-4 border-gray-200 mx-auto mb-3 animate-spin"
              style={{ borderTopColor: TEAL }}
            />
            <p className="text-gray-500 text-sm">Loading your dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  const provider = profileQuery.data?.provider;
  if (!provider) return null;

  const status = provider.status ?? "pending";
  const statusConf = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const bookingsData = bookingsQuery.data;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar providerName={provider.name} onLogout={logout} />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your provider profile and availability</p>
        </div>

        {availabilityMutation.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {availabilityMutation.error.message}
          </div>
        )}
        {availabilityMutation.isSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            Availability updated successfully.
          </div>
        )}

        {/* Profile + Availability */}
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 col-span-2">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                style={{ background: TEAL }}
              >
                {provider.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">{provider.name}</h2>
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ color: statusConf.color, background: statusConf.bg }}
                  >
                    {statusConf.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{provider.email}</p>
                <p className="text-sm font-medium mt-1" style={{ color: NAVY }}>
                  {ROLE_LABELS[provider.role] ?? provider.role}
                  {provider.city ? ` · ${provider.city}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2 font-medium">Availability</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: provider.availability ? TEAL : "#6b7280" }}>
                {provider.availability ? "Available" : "Unavailable"}
              </span>
              <button
                onClick={() =>
                  availabilityMutation.mutate({ id: provider.id, availability: !provider.availability })
                }
                disabled={availabilityMutation.isPending}
                className="w-12 h-6 rounded-full transition-colors relative flex-shrink-0"
                style={{ background: provider.availability ? TEAL : "#d1d5db" }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                  style={{ left: provider.availability ? "calc(100% - 1.375rem)" : "2px" }}
                />
              </button>
            </div>
            {status === "approved" && (
              <p className="text-xs text-green-600 mt-3 leading-relaxed">You're live in the SaluraCare app!</p>
            )}
            {status === "pending" && (
              <p className="text-xs text-amber-600 mt-3 leading-relaxed">
                Pending approval — you'll go live once reviewed.
              </p>
            )}
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Total Earnings", value: bookingsData ? `MYR ${bookingsData.totalEarnings.toFixed(2)}` : "—" },
            { label: "This Month", value: bookingsData ? `MYR ${bookingsData.monthlyEarnings.toFixed(2)}` : "—" },
            { label: "Total Bookings", value: bookingsData ? String(bookingsData.bookings.length) : "—" },
            { label: "Rating", value: provider.rating != null ? `${Number(provider.rating).toFixed(1)} ⭐` : "—" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-bold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Profile Details */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {[
            { label: "Experience", value: provider.experience != null ? `${provider.experience} years` : "—" },
            { label: "Rate per Hour", value: provider.pricePerHour != null ? `MYR ${provider.pricePerHour}` : "—" },
            { label: "Phone", value: provider.phone ?? "—" },
            { label: "Member Since", value: provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : "—" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>

        {provider.qualification && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <p className="text-xs text-gray-400 mb-1">Qualifications</p>
            <p className="text-sm text-gray-700">{provider.qualification}</p>
          </div>
        )}

        {/* Booking Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Booking Requests</h3>
            {bookingsQuery.isFetching && (
              <span className="text-xs text-gray-400">Refreshing…</span>
            )}
          </div>
          {bookingsQuery.isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading bookings…</div>
          ) : bookingsData && bookingsData.bookings.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {bookingsData.bookings.map((b) => (
                <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{b.itemName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {b.type}
                      {b.scheduledDate ? ` · ${b.scheduledDate}` : ""}
                      {b.scheduledTime ? ` ${b.scheduledTime}` : ""}
                      {b.address ? ` · ${b.address}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-700">MYR {b.amount}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{
                        background: b.status === "completed" ? "#ecfdf5" : b.status === "pending" ? "#fffbeb" : "#f3f4f6",
                        color: b.status === "completed" ? "#059669" : b.status === "pending" ? "#d97706" : "#6b7280",
                      }}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              <p className="text-2xl mb-2">📋</p>
              <p>No booking requests yet.</p>
              {status === "pending" && (
                <p className="text-xs mt-1 text-amber-600">Bookings will appear here once your profile is approved.</p>
              )}
            </div>
          )}
        </div>

        {status === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <p className="text-sm font-semibold text-red-800 mb-1">Application Rejected</p>
            <p className="text-xs text-red-700">
              Your registration was not approved. Please contact support for more information or to resubmit your application.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
