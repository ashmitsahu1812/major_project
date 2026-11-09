import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "FACULTY") navigate("/faculty");
      else navigate("/student");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.success(`Loaded credentials for ${demoEmail.split("@")[0]}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">Welcome back</h3>
        <p className="text-xs text-slate-400 mt-1">
          Sign in to access your real-time attendance dashboard.
        </p>
      </div>

      {/* Demo credentials */}
      <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 block">
          Quick fill — demo credentials:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDemoCredentials("admin@edupulse.com", "admin123")}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials("faculty1@edupulse.com", "faculty123")}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Faculty
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials("student1@edupulse.com", "student123")}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Student
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@edupulse.com"
              required
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/60 transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs text-brand-400 hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/60 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center"
        >
          {loading ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  fill="currentColor"
                />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-4">
        New to EduPulse?{" "}
        <Link to="/register" className="text-brand-400 font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
