import { useNavigate } from "react-router-dom";

const TEAL = "#00B5A5";

interface NavbarProps {
  providerName?: string;
  onLogout?: () => void;
}

export default function Navbar({ providerName, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <nav
      style={{ borderBottom: "1px solid #e5e7eb" }}
      className="bg-white sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 group"
        >
          <div
            style={{ background: TEAL }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
          >
            <span className="text-white font-bold text-lg leading-none">S</span>
          </div>
          <div className="hidden sm:block">
            <span style={{ color: TEAL }} className="font-bold text-base leading-tight block">
              SaluraCare
            </span>
            <span className="text-xs text-gray-400 leading-tight block">Provider Portal</span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {providerName ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                Hello, <strong>{providerName}</strong>
              </span>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ color: TEAL }}
              >
                Dashboard
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-sm font-medium px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-colors"
                style={{ background: TEAL }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
