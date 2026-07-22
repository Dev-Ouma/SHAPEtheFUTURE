"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, RefreshCw, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { API_URL, getAdminAuthHeaders } from "@/lib/api";

export default function ForceChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const res = await fetch(`${API_URL}/auth/force-change-password`, {
        method: "POST",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const text = await res.text();
      let data: Record<string, unknown> = {};
      if (text) {
        try { data = JSON.parse(text); } catch {
          setError("Backend returned an invalid response.");
          return;
        }
      }

      if (res.ok) {
        toast.success("Password updated successfully!");
        router.push("/admin");
      } else {
        setError(String(data.message || "Failed to update password"));
      }
    } catch {
      setError("Cannot reach the API. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-darker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 -mr-64 -mt-64 rotate-45" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/20 -ml-32 -mb-32 rotate-45" />

      <div className="w-full max-w-md bg-white border-b-8 border-primary relative z-10 shadow-2xl">
        <div className="p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 bg-[#ff7f50] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
              <Lock className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-black text-primary-darker uppercase tracking-wider mb-2">Update Password</h2>
            <p className="text-xs text-slate-500 text-center font-medium leading-relaxed">
              Your account requires a mandatory password update. Please set a new secure password to proceed to the dashboard.
            </p>
          </div>

          {error && (
             <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 flex items-center space-x-3 text-red-600">
                <AlertCircle size={18} />
                <span className="text-[10px] uppercase font-black tracking-widest">{error}</span>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none p-5 pl-14 pr-14 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none p-5 pl-14 pr-14 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-primary-darker text-white p-6 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-[#ff7f50] hover:text-white transition-all disabled:bg-slate-300 group shadow-xl"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Save & Proceed</span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-12 text-[10px] text-white/30 uppercase font-black tracking-widest">
        Property of the Open University of Kenya © {new Date().getFullYear()}
      </p>
    </div>
  );
}
