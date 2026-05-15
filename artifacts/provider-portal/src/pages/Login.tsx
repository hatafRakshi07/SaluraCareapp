import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";

const TEAL = "#00B5A5";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  provider: ProviderProfile;
}

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

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials) =>
      apiFetch<AuthResponse>("/providers/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      localStorage.setItem("provider_token", data.token);
      localStorage.setItem("provider_data", JSON.stringify(data.provider));
      navigate("/dashboard");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
          <div className="text-center mb-7">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: TEAL }}
            >
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your provider account</p>
          </div>

          {loginMutation.isError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {loginMutation.error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity"
              style={{ background: TEAL, opacity: loginMutation.isPending ? 0.7 : 1 }}
            >
              {loginMutation.isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-medium hover:underline"
              style={{ color: TEAL }}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
