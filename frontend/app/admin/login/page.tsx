"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Lock, ArrowRight, RefreshCw, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminUser } from "@/hooks/useAdminPermissions";
import { API_URL, probeAdminCookieSession } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = React.useState(false);
  // AdminAuthProvider wraps /admin/login too and only fetches /auth/me once
  // on mount, so it never learns about a login that happens via this form
  // (router.push is a client-side transition, not a remount). Without this
  // explicit refresh, the topbar shows stale/generic identity — and any
  // permission check that also depends on it — until a hard page reload.
  const { refresh: refreshAuthUser } = useAdminUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setSessionExpired(new URLSearchParams(window.location.search).get("session") === "expired");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        // Session is HttpOnly cookie only (set by API). Profile is cached for UI.
        localStorage.setItem("ouk_admin_user", JSON.stringify(data.user));
        // Drop any legacy dual-read Bearer left from earlier builds.
        localStorage.removeItem("ouk_admin_token");

        const cookieOk = await probeAdminCookieSession();
        try {
          sessionStorage.setItem("ouk_admin_cookie_ok", cookieOk ? "1" : "0");
        } catch {
          /* ignore */
        }
        if (!cookieOk) {
          setLoading(false);
          setError(
            "Secure session cookie was not accepted. Use http://localhost:3000 (not 127.0.0.1) and try again.",
          );
          return;
        }

        await refreshAuthUser();
        // Hold the form in its suspended state and let the success card play
        // out before navigating, so the login → dashboard handoff reads as
        // one continuous transition rather than an abrupt route change.
        setSuccess(true);
        setTimeout(() => {
          if (data.require_password_change) {
            router.push("/admin/force-change-password");
          } else {
            router.push("/admin");
          }
        }, 700);
      } else {
        setLoading(false);
        const msg = data.message || "Invalid credentials";
        if (msg.toLowerCase().includes("locked")) {
          setError(msg);
        } else if (msg === "PROVISIONED_PASSWORD_EXPIRED") {
          setError("EXPIRED");
        } else {
          setError(msg);
        }
      }
    } catch (err) {
      setLoading(false);
      setError("Connection failure. Check backend.");
    }
  };

  return (
    <div className="min-h-screen bg-primary-darker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
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
            className="w-full max-w-md bg-white border-b-8 border-primary relative z-10 shadow-2xl p-16 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="text-emerald-500" size={32} />
            </motion.div>
            <h2 className="text-lg font-black text-primary-darker uppercase tracking-wider mb-2">Access Granted</h2>
            <p className="text-xs text-slate-500 font-medium">Redirecting to your dashboard…</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md bg-white border-b-8 border-primary relative z-10 shadow-2xl"
          >
            <div className="p-12">
              <div className="flex flex-col items-center mb-12">
                <Link href="/" className="flex items-center justify-center mb-8">
                  <img
                    src="/images/OUK-EnhancedLogo.png"
                    alt="Open University of Kenya"
                    className="h-20 w-auto object-contain"
                  />
                </Link>
                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Administration Login</h2>
              </div>

              <AnimatePresence mode="wait">
                {sessionExpired && !error ? (
                  <motion.div
                    key="expired-session"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 flex items-center space-x-3 text-amber-700">
                      <AlertCircle size={18} />
                      <span className="text-[10px] uppercase font-black tracking-widest">Session expired — please sign in again.</span>
                    </div>
                  </motion.div>
                ) : null}
                {error === "EXPIRED" ? (
                  <motion.div
                    key="expired"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-8 p-6 bg-amber-50 border border-amber-200 shadow-sm flex flex-col items-center text-center space-y-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 mb-2">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-amber-700">Password Expired</h3>
                        <p className="text-xs text-amber-600 mt-2">Your temporarily provisioned password has expired for your security.</p>
                      </div>
                      <Link href="/admin/forgot-password" className="mt-2 w-full bg-amber-500 text-white p-4 text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors">
                        Request New Password Link
                      </Link>
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 flex items-center space-x-3 text-red-600">
                      <AlertCircle size={18} />
                      <span className="text-[10px] uppercase font-black tracking-widest">{error}</span>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <form onSubmit={handleLogin} className="space-y-8">
                {/* Disabling the fieldset visibly suspends the whole form the
                    moment it's submitted, instead of only the submit button,
                    so it's obvious an action is in flight. */}
                <fieldset disabled={loading} className={`space-y-8 transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Academic Email</label>
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border-none p-5 pl-14 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none transition-all disabled:cursor-not-allowed"
                        placeholder="admin@ouk.ac.ke"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Secure Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border-none p-5 pl-14 pr-14 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none transition-all disabled:cursor-not-allowed"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors disabled:cursor-not-allowed"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Link href="/admin/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-darker transition-colors">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                </fieldset>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={loading ? undefined : { scale: 0.97 }}
                  className="w-full bg-primary-darker text-white p-6 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-[#ff7f50] hover:text-white transition-all disabled:bg-slate-300 group shadow-xl"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      <span>Verifying…</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Dashboard</span>
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-12 text-[10px] text-white/30 uppercase font-black tracking-widest">
        Property of the Open University of Kenya © {new Date().getFullYear()}
      </p>
    </div>
  );
}
