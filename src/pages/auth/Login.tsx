import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { ROLE_DASHBOARD_MAP } from "../../types/user";
import type { Role } from "../../types/user";
import { LogIn, Mail, Lock, AlertCircle, X } from "lucide-react";

/** ─── Toast Notification Component ───────────────────── */
function Toast({
  message,
  type = "error",
  onClose,
}: {
  message: string;
  type?: "error" | "success";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-sm max-w-sm ${type === "error"
        ? "bg-red-50/95 border-red-200 text-red-700"
        : "bg-emerald-50/95 border-emerald-200 text-emerald-700"
        }`}
    >
      <AlertCircle size={20} className="shrink-0" />
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-full hover:bg-black/5 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

/** ─── Login Page ─────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in → redirect to role-based dashboard
  if (isAuthenticated && user) {
    return <Navigate to={ROLE_DASHBOARD_MAP[user.role as Role]} replace />;
  }

  const handleLogin = async () => {
    setError("");
    setToast(null);

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(false); // set to true after validation passes
    setLoading(true);

    try {
      // 1. Attempt to login via the REAl backend
      const { user } = await authService.login({ email: email.trim(), password });

      // 2. Success!
      login(user); // update the context
      navigate(ROLE_DASHBOARD_MAP[user.role as Role], { replace: true });
    } catch (err: any) {
      // 3. Error handling
      const msg = err?.message || "Login failed. Please check your credentials.";
      setError(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-surface-muted">
      <div className="flex-1 flex relative">
        {/* ─── Toast Notification ──────────────────────── */}
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>

        {/* ─── Left Panel (Branding) ───────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative items-center justify-center p-12">
          {/* Background dots */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 text-white max-w-md"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-white rounded-lg p-2 shadow-lg ring-1 ring-white/20 shrink-0">
                <img src="/logo.png" alt="Design Elements Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-4xl font-bold leading-tight">
                Design Elements
                <br />
                <span className="text-brand-200">ERP System</span>
              </h1>
            </div>
            <p className="text-brand-200 text-lg leading-relaxed">
              Streamline your operations with our enterprise resource planning
              solution. Manage projects, finances, and clients — all in one place.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {["bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-cyan-400"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} ring-2 ring-brand-700`} />
                ))}
              </div>
              <p className="text-brand-300 text-sm">
                Used by 50+ businesses
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── Right Panel (Form) ──────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center bg-surface-muted p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[420px]"
            onKeyDown={handleKeyDown}
          >
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-8 bg-white rounded-xl p-1.5 shadow-lg ring-1 ring-gray-100">
                <img src="/logo.png" alt="Design Elements Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-float p-8 border border-gray-100 mb-6">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Inline Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="mb-4">
                <label className="label" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    className="input pl-10"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0" htmlFor="login-password">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    className="input pl-10"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                onClick={handleLogin}
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-base shadow-lg shadow-brand-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin mr-2">◌</span>
                ) : (
                  <LogIn size={18} />
                )}
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-[11px] text-center text-slate-400 font-medium">
                🔒 Secured with bcrypt password hashing &amp; JWT authentication.
                <br />
                Contact your System Administrator for account credentials.
              </p>
            </div>

          </motion.div>
        </div>
      </div>

      {/* ─── DIGITAL PARTNER FOOTER ────────────────── */}
      <div className="w-full shrink-0 z-50">
        <a
          href="https://resonira.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0b0920] py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 border-t border-indigo-900/30 hover:bg-[#110e30] transition-colors cursor-pointer group flex-wrap"
        >
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-[#e6dbad] group-hover:text-yellow-200 transition-colors">OUR DIGITAL PARTNER</h3>
          <div className="hidden sm:block w-px h-10 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
          <div className="flex items-center gap-3">
            {/* Logo Icon Mockup */}
            <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-lg overflow-hidden shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
              <span className="text-lg font-black text-white relative z-10">R</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-300 rounded-full blur-[2px] opacity-60"></div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline leading-none">
                <span className="text-lg sm:text-xl font-medium text-blue-400 tracking-tight group-hover:text-blue-300 transition-colors">Reson</span>
                <span className="text-lg sm:text-xl font-medium text-purple-400 tracking-tight group-hover:text-purple-300 transition-colors">ira</span>
              </div>
              <span className="text-[8px] sm:text-[10px] text-white tracking-[0.3em] font-medium mt-0.5 group-hover:text-slate-200 transition-colors">TECHNOLOGIES</span>
              <span className="text-[5px] sm:text-[6px] text-slate-400 tracking-widest mt-0.5 uppercase leading-none group-hover:text-slate-300 transition-colors">TRUSTED IT. SMARTER AI. LASTING IMPACT</span>
            </div>
          </div>
        </a>

        {/* Bottom Copyright Bar */}
        <div className="bg-white py-2 px-6 flex flex-col md:flex-row justify-between items-center text-[9px] sm:text-[10px] text-slate-600 border-t border-slate-200">
          <p>© Copyright Design Elements ERP 2026 All Rights Reserved.</p>
          <p className="mt-1 md:mt-0 font-medium">
            Designed & Developed by <a href="https://resonira.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all">Resonira Technologies</a> - +91 91542 89324
          </p>
        </div>
      </div>
    </div>
  );
}