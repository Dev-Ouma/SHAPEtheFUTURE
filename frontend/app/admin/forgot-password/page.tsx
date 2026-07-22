"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowRight, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to request password reset.");
      }
    } catch (err) {
      setError("Connection failure. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-darker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
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
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Account Recovery</h2>
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
                    <h3 className="text-sm font-black uppercase tracking-widest text-teal-700">Link Dispatched</h3>
                    <p className="text-xs text-teal-600 mt-2">If an account matches <span className="font-bold">{email}</span>, a secure password reset link has been sent to it.</p>
                  </div>
               </div>
               <Link href="/admin/login" className="w-full bg-slate-100 text-slate-500 p-6 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-slate-200 hover:text-primary-darker transition-all shadow-sm">
                 <ArrowRight size={20} className="rotate-180" />
                 <span>Back to Login</span>
               </Link>
             </div>
          ) : (
            <form onSubmit={handleRequest} className="space-y-8">
              <p className="text-xs text-slate-500 text-center font-medium leading-relaxed mb-6">
                Enter your administrative academic email. We'll send you a secure link to reset your credentials.
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Academic Email</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-none p-5 pl-14 font-bold text-primary-darker focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="admin@ouk.ac.ke"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 text-white p-6 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-amber-600 transition-all disabled:bg-slate-300 group shadow-xl"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
                <Link href="/admin/login" className="block text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                  Return to Login
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
