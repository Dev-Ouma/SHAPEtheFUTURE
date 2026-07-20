"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ExternalLink,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getOfficialPortalUrl, isPortalDemoEnabled } from "@/lib/portal";

export default function PortalLoginPage() {
  const router = useRouter();
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const demoEnabled = isPortalDemoEnabled();
  const officialPortal = getOfficialPortalUrl();

  useEffect(() => {
    if (!demoEnabled) {
      window.location.replace(officialPortal);
      return;
    }
    const existing =
      localStorage.getItem("ouk_portal_user") ||
      localStorage.getItem("ouk_admin_user");
    if (existing) {
      router.replace("/portal");
    }
  }, [router, demoEnabled, officialPortal]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const registration = regNo.trim();
    if (!registration || !password.trim()) {
      setLoading(false);
      setError("Enter your registration number and password.");
      return;
    }

    // Campus portal session (local preview). Production SOMAS remains at my.ouk.ac.ke.
    const user = {
      full_name: "Enrolled Student",
      registration_no: registration.toUpperCase(),
      email: `${registration.toLowerCase().replace(/[^a-z0-9]/g, ".")}@student.ouk.ac.ke`,
    };

    try {
      localStorage.setItem("ouk_portal_user", JSON.stringify(user));
      localStorage.setItem("ouk_portal_token", "portal-session");
      setSuccess(true);
      setTimeout(() => router.push("/portal"), 650);
    } catch {
      setLoading(false);
      setError("Could not start a portal session in this browser.");
    }
  };

  if (!demoEnabled) {
    return (
      <div className="min-h-screen bg-primary-darker flex flex-col items-center justify-center p-6 text-white">
        <RefreshCw className="animate-spin text-primary mb-6" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
          Redirecting to SOMAS…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-darker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 -mr-64 -mt-64 rotate-45"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
        className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/20 -ml-32 -mb-32 rotate-45"
      />

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-md bg-white border-b-8 border-secondary relative z-10 shadow-2xl p-16 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="text-emerald-500" size={32} />
            </motion.div>
            <h2 className="text-lg font-black text-primary-darker uppercase tracking-wider mb-2">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Opening your student dashboard…
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md bg-white border-b-8 border-secondary relative z-10 shadow-2xl"
          >
            <div className="p-12">
              <div className="flex flex-col items-center mb-10">
                <Link href="/" className="flex items-center justify-center mb-8">
                  <img
                    src="/images/OUK-EnhancedLogo.png"
                    alt="Open University of Kenya"
                    className="h-20 w-auto object-contain"
                  />
                </Link>
                <h1 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">
                  Student Portal
                </h1>
                <p className="mt-3 text-xs text-slate-500 text-center max-w-xs leading-relaxed">
                  Sign in with your registration number to access fees, academics, and research tools.
                </p>
              </div>

              {error ? (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 flex items-center space-x-3 text-red-600">
                  <AlertCircle size={18} className="shrink-0" />
                  <span className="text-[10px] uppercase font-black tracking-widest">
                    {error}
                  </span>
                </div>
              ) : null}

              <form onSubmit={handleLogin} className="space-y-8">
                <fieldset
                  disabled={loading}
                  className={`space-y-8 transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                      Registration number
                    </label>
                    <div className="relative group">
                      <GraduationCap
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"
                        size={20}
                      />
                      <input
                        type="text"
                        value={regNo}
                        onChange={(e) => setRegNo(e.target.value)}
                        className="w-full bg-slate-50 border-none p-5 pl-14 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none transition-all disabled:cursor-not-allowed uppercase"
                        placeholder="OUK/2024/0001"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"
                        size={20}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border-none p-5 pl-14 pr-14 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none transition-all disabled:cursor-not-allowed"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors disabled:cursor-not-allowed"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </fieldset>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={loading ? undefined : { scale: 0.97 }}
                  className="w-full bg-primary-darker text-white p-6 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-[#ff7f50] transition-all disabled:bg-slate-300 group shadow-xl"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <>
                      <span>Enter portal</span>
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-2 transition-transform"
                      />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                <a
                  href={officialPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-darker transition-colors"
                >
                  Official SOMAS portal
                  <ExternalLink size={14} />
                </a>
                <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                  Demo sign-in is for local campus preview only. Production
                  students use SOMAS.
                </p>
                <Link
                  href="/"
                  className="block text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Return to website
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-12 text-[10px] text-white/30 uppercase font-black tracking-widest">
        Open University of Kenya · Student services
      </p>
    </div>
  );
}
