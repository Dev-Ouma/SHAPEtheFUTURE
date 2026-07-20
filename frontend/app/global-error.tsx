"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical layout failure:", error);
  }, [error]);

  return (
    <html lang="en-GB">
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-primary-darker flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-8">
             <div className="flex justify-center">
                <AlertCircle size={64} className="text-primary" />
             </div>
             <div className="space-y-4">
                <h1 className="text-2xl font-black text-white uppercase tracking-widest font-serif">
                   Critical System <span className="text-primary">Failure</span>
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                   The institutional core layout encountered a fatal disruption. This usually indicates a breaking change in the global infrastructure.
                </p>
             </div>
             <button
                onClick={() => reset()}
                className="w-full bg-primary text-white py-4 font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 hover:bg-[#ff7f50] hover:text-white transition-all shadow-2xl"
             >
                <RefreshCw size={14} />
                <span>Reset Application Core</span>
             </button>
             {error.digest && (
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                   Recovery Hash: {error.digest}
                </p>
             )}
          </div>
        </div>
      </body>
    </html>
  );
}
