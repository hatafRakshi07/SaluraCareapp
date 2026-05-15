import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";

const TEAL = "#00B5A5";

const ROLES = [
  { value: "nurse", label: "Home Nurse" },
  { value: "caretaker", label: "Caretaker" },
  { value: "physiotherapist", label: "Physiotherapist" },
  { value: "lab", label: "Lab Provider" },
  { value: "pharmacy", label: "Pharmacy" },
] as const;

type RoleValue = (typeof ROLES)[number]["value"];
type Step = 1 | 2 | 3;

interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: RoleValue;
  experience?: number;
  qualification?: string;
  address?: string;
  city?: string;
  pricePerHour?: number;
  availability?: boolean;
}

interface ProviderProfile {
  id: string;
  name: string;
  email: string;
  status: string | null;
}

interface AuthResponse {
  token: string;
  provider: ProviderProfile;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
  experience: string;
  qualification: string;
  address: string;
  city: string;
  pricePerHour: string;
  availability: boolean;
}

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "",
  experience: "",
  qualification: "",
  address: "",
  city: "",
  pricePerHour: "",
  availability: true,
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [validationError, setValidationError] = useState("");

  const registerMutation = useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: (payload) =>
      apiFetch<AuthResponse>("/providers/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      localStorage.setItem("provider_token", data.token);
      localStorage.setItem("provider_data", JSON.stringify(data.provider));
      navigate("/dashboard");
    },
  });

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationError("");
  }

  function validateStep1(): string {
    if (!form.name.trim() || form.name.length < 2) return "Name must be at least 2 characters.";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Enter a valid email.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  }

  function validateStep2(): string {
    if (!form.role) return "Please select your role.";
    return "";
  }

  function next() {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : "";
    if (err) { setValidationError(err); return; }
    setValidationError("");
    setStep((prev) => (prev + 1) as Step);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: RegisterPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role as RoleValue,
    };
    if (form.phone) payload.phone = form.phone.trim();
    if (form.experience) payload.experience = parseInt(form.experience, 10);
    if (form.qualification) payload.qualification = form.qualification.trim();
    if (form.address) payload.address = form.address.trim();
    if (form.city) payload.city = form.city.trim();
    if (form.pricePerHour) payload.pricePerHour = parseInt(form.pricePerHour, 10);
    payload.availability = form.availability;
    registerMutation.mutate(payload);
  }

  const stepLabels = ["Personal Info", "Role & Experience", "Location & Pricing"];
  const displayError = validationError || (registerMutation.isError ? registerMutation.error.message : "");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg p-8">
          <div className="text-center mb-7">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: TEAL }}
            >
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Provider Registration</h1>
            <p className="text-gray-500 text-sm mt-1">Join SaluraCare and start serving patients</p>
          </div>

          <div className="flex items-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex flex-col items-center relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 z-10 transition-colors"
                  style={{
                    background: step >= s ? TEAL : "#e5e7eb",
                    color: step >= s ? "white" : "#9ca3af",
                  }}
                >
                  {step > s ? "✓" : s}
                </div>
                <span className="text-xs text-gray-500 text-center hidden sm:block">{stepLabels[s - 1]}</span>
                {s < 3 && (
                  <div
                    className="absolute top-4 left-1/2 w-full h-0.5 transition-colors"
                    style={{ background: step > s ? TEAL : "#e5e7eb" }}
                  />
                )}
              </div>
            ))}
          </div>

          {displayError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    autoComplete="name"
                    placeholder="Dr. Ahmad bin Malik"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    autoComplete="tel"
                    placeholder="+60 12 345 6789"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Role *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => update("role", r.value)}
                        className="py-3 px-3 rounded-xl text-sm font-medium border-2 transition-all text-left"
                        style={{
                          borderColor: form.role === r.value ? TEAL : "#e5e7eb",
                          background: form.role === r.value ? `${TEAL}18` : "white",
                          color: form.role === r.value ? TEAL : "#374151",
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={form.experience}
                    onChange={(e) => update("experience", e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications / License No.</label>
                  <textarea
                    value={form.qualification}
                    onChange={(e) => update("qualification", e.target.value)}
                    placeholder="e.g. RN, MMC License 12345"
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition resize-none"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    autoComplete="street-address"
                    placeholder="123 Jalan Bukit Bintang"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    autoComplete="address-level2"
                    placeholder="Kuala Lumpur"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour (MYR)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.pricePerHour}
                    onChange={(e) => update("pricePerHour", e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  />
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Available for bookings</p>
                    <p className="text-xs text-gray-500 mt-0.5">Accept patient bookings once approved</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, availability: !prev.availability }))}
                    className="w-12 h-6 rounded-full transition-colors relative flex-shrink-0"
                    style={{ background: form.availability ? TEAL : "#d1d5db" }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                      style={{ left: form.availability ? "calc(100% - 1.375rem)" : "2px" }}
                    />
                  </button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <strong>Note:</strong> Your profile will be reviewed by our team before appearing in the SaluraCare app. This usually takes 1–2 business days.
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-7">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => { setValidationError(""); setStep((s) => (s - 1) as Step); }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition"
                  style={{ background: TEAL }}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-opacity"
                  style={{ background: TEAL, opacity: registerMutation.isPending ? 0.7 : 1 }}
                >
                  {registerMutation.isPending ? "Submitting…" : "Submit Registration"}
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-medium hover:underline"
              style={{ color: TEAL }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
