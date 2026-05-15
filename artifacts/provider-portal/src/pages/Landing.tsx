import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const TEAL = "#00B5A5";
const NAVY = "#1A3A52";

const roles = [
  { icon: "🏥", title: "Home Nurse", desc: "Provide skilled nursing care in patient homes." },
  { icon: "🤝", title: "Caretaker", desc: "Assist elderly and disabled individuals daily." },
  { icon: "🦵", title: "Physiotherapist", desc: "Deliver rehabilitation and physical therapy." },
  { icon: "🧪", title: "Lab Provider", desc: "Offer diagnostic and laboratory services." },
  { icon: "💊", title: "Pharmacy", desc: "Supply medications and pharmaceutical care." },
];

const steps = [
  { num: "1", label: "Register", desc: "Fill in your professional details and credentials." },
  { num: "2", label: "Get Approved", desc: "Our team reviews and approves your profile." },
  { num: "3", label: "Start Serving", desc: "Appear in the SaluraCare app and receive bookings." },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <section
        style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #007a70 100%)` }}
        className="py-20 px-4 text-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span>🌟</span>
            <span>Join Malaysia's fastest-growing healthcare platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
            Grow your healthcare practice<br />with SaluraCare
          </h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto mb-8">
            Register as a verified provider and connect with thousands of patients who need your expertise — from home nursing to lab tests and pharmacy services.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/register")}
              className="px-7 py-3.5 bg-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-base"
              style={{ color: TEAL }}
            >
              Register as Provider
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-7 py-3.5 bg-white/15 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/25 transition-all text-base"
            >
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: NAVY }}>
            Who can join?
          </h2>
          <p className="text-center text-gray-500 mb-10">We welcome all healthcare professionals and service providers.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {roles.map((r) => (
              <div
                key={r.title}
                className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-3xl mb-3">{r.icon}</div>
                <div className="font-semibold text-gray-800 text-sm mb-1">{r.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: NAVY }}>
            How it works
          </h2>
          <p className="text-center text-gray-500 mb-10">Simple steps to start serving patients.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4"
                  style={{ background: TEAL }}
                >
                  {s.num}
                </div>
                <div className="font-semibold text-gray-800 mb-1">{s.label}</div>
                <div className="text-sm text-gray-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0d2236 100%)` }}
        className="py-16 px-4 text-white text-center"
      >
        <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
        <p className="text-white/75 mb-7 max-w-md mx-auto">
          Join hundreds of providers already earning through SaluraCare.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="px-8 py-3.5 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-base"
          style={{ background: TEAL, color: "white" }}
        >
          Register Now — It's Free
        </button>
      </section>

      <footer className="py-6 text-center text-sm text-gray-400 border-t">
        © {new Date().getFullYear()} SaluraCare. All rights reserved.
      </footer>
    </div>
  );
}
