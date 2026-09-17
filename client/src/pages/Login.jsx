import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Store, UserCog, ShieldCheck, Eye, EyeOff } from "lucide-react";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      // Save token & user
      localStorage.setItem("token", response.data.token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      const userRole = response.data.user?.role;

      // Smart redirection based on role
      if (userRole === "owner") {
        navigate("/owner/dashboard");
      } else if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/owner/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);

      let errorMsg = error.response?.data?.message;
      if (!errorMsg) {
        if (error.message === "Network Error" || !error.response) {
          errorMsg = "Unable to connect to the backend server. Please verify the server is running on port 5000.";
        } else {
          errorMsg = "Login failed. Please check your credentials.";
        }
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ===== LEFT BRANDING PANEL (hidden on mobile) ===== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Brand */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Store size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-wide">
                MANISHA TRADERS
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Wholesale Distribution Platform
              </p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mt-10">
            Manage your entire<br />
            <span className="text-amber-400">wholesale business</span><br />
            from one place.
          </h2>

          <p className="text-slate-400 mt-5 text-base leading-relaxed max-w-sm">
            Track orders, manage inventory, review retailer accounts, and gain
            AI-powered insights — all in a single powerful dashboard.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative space-y-2.5">
          {[
            "Real-time inventory & stock alerts",
            "Wholesale order pipeline management",
            "AI-powered business analytics",
            "Role-based access for your team",
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2.5">
              <ShieldCheck size={15} className="text-amber-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RIGHT LOGIN PANEL ===== */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile-only logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Store size={18} className="text-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-wide">
                MANISHA TRADERS
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

            {/* HEADING */}
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome back
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Sign in to your Owner or Admin account
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠</span>
                {error}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 pr-11 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2 mt-2"
              >
                <LogIn size={16} />
                {loading ? "Verifying Credentials..." : "Sign In to Account"}
              </button>

            </form>

            {/* DIVIDER */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                New to Manisha Traders?
              </span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* SIGN UP REDIRECT CARDS */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Retailer Sign Up */}
              <Link
                to="/register?role=customer"
                className="group flex flex-col items-center gap-1.5 py-3.5 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100/80 hover:border-blue-300 text-blue-700 text-xs font-bold transition text-center"
              >
                <Store size={20} className="group-hover:scale-110 transition-transform" />
                <span>Retailer Sign Up</span>
              </Link>

              {/* Admin Sign Up */}
              <Link
                to="/register?role=admin"
                className="group flex flex-col items-center gap-1.5 py-3.5 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-700 text-xs font-bold transition text-center"
              >
                <UserCog size={20} className="group-hover:scale-110 transition-transform" />
                <span>Admin Sign Up</span>
              </Link>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Staff / Admin applications require owner approval before access is granted.
            </p>

          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;