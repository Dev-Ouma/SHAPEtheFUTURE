"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your preferred error reporting service
    console.error("Root Application Crash:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 relative">
        <div className="flex justify-center">
             <AlertTriangle size={32} className="text-slate-300" />
        </div>

        <div className="space-y-3">
          <h1 className="text-xl font-bold text-primary-darker uppercase tracking-widest">
            Synchronisation <span className="font-normal opacity-50">Delay</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            The application encountered a temporary layout mismatch. Attempting a recovery usually restores the clean interface.
          </p>
        </div>

        <div className="flex flex-col space-y-3 pt-4">
          <button
            onClick={() => reset()}
            className="w-full bg-primary text-white py-4 font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 hover:bg-[#ff7f50] hover:text-white transition-all shadow-lg"
          >
            <RefreshCw size={14} />
            <span>Restore Interface</span>
          </button>
          
          <Link
            href="/"
            className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-primary transition-colors pt-4 mx-auto"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
