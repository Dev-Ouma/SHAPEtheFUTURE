"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin console error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#0f6e7e]/10 flex items-center justify-center">
          <AlertTriangle size={28} className="text-[#0f6e7e]" />
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0f6e7e]">
            Admin Console
          </p>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            This admin view hit an unexpected error. You can retry the page or return to the dashboard.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-400 pt-1">
              Ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-5 bg-[#0f6e7e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0b5662] transition-colors"
          >
            <RefreshCw size={14} />
            Try again
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-5 border border-slate-200 bg-white text-slate-700 text-[10px] font-black uppercase tracking-widest hover:border-[#0f6e7e]/40 transition-colors"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
