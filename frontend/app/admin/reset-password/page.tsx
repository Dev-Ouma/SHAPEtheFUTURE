"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, RefreshCw, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

function AdminResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing password reset token. Please request a new link.");
    }
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to reset password. The link may have expired.");
      }
    } catch (err) {
      setError("Connection failure. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-darker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 -mr-64 -mt-64 rotate-45" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/20 -ml-32 -mb-32 rotate-45" />

      <div className="w-full max-w-md bg-white border-b-8 border-amber-500 relative z-10 shadow-2xl">
        <div className="p-12">
          <div className="flex flex-col items-center mb-12">
            <Link href="/" className="flex items-center space-x-2 mb-8">
              <div className="w-12 h-12 bg-amber-500 flex items-center justify-center">
                <span className="text-white font-black text-2xl uppercase">U</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl leading-none text-primary-darker">OUK</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Open University of Kenya</span>
              </div>
            </Link>
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Set New Password</h2>
          </div>

          {error && (
             <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 flex items-center space-x-3 text-red-600">
                <AlertCircle size={18} />
                <span className="text-[10px] uppercase font-black tracking-widest">{error}</span>
             </div>
          )}

          {success ? (
             <div className="space-y-8">
               <div className="mb-8 p-6 bg-teal-50 border border-teal-200 shadow-sm flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-2">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-teal-700">Password Updated</h3>
                    <p className="text-xs text-teal-600 mt-2">Your credentials have been securely updated. You can now use your new password to access the system.</p>
                  </div>
               </div>
               <Link href="/admin/login" className="w-full bg-primary-darker text-white p-6 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-[#ff7f50] transition-all shadow-xl">
                 <span>Proceed to Login</span>
                 <ArrowRight size={20} />
               </Link>
             </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">New Secure Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-none p-5 pl-14 pr-14 font-bold text-primary-darker focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                    disabled={!token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-amber-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border-none p-5 pl-14 font-bold text-primary-darker focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                    disabled={!token}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-amber-500 text-white p-6 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-amber-600 transition-all disabled:bg-slate-300 group shadow-xl"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>Update Credentials</span>
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
                <Link href="/admin/login" className="block text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                  Cancel and Return
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <p className="mt-12 text-[10px] text-white/30 uppercase font-black tracking-widest">
        Property of the Open University of Kenya © {new Date().getFullYear()}
      </p>
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-primary-darker"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <AdminResetPasswordContent />
    </React.Suspense>
  );
}
