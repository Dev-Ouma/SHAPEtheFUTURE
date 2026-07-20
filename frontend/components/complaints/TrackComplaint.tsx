"use client";

import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { postApi } from "@/lib/api";

export default function TrackComplaint() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await postApi('/complaints/track', { 
        reference_number: ticketNumber.trim(), 
        email: email.trim() 
      });

      if (response && response.id) {
         setResult({
           reference: response.reference_number,
           status: response.status,
           date: new Date(response.created_at).toLocaleDateString(),
           department: response.department?.name || "Pending Assignment",
           priority: response.priority
         });
      } else {
         setError("We could not find a complaint matching that reference and email combination.");
      }
    } catch (err: any) {
      if (err.status === 400 || err.status === 404) {
         setError("We could not find a complaint matching that reference and email combination.");
      } else {
         setError("An error occurred while tracking your complaint. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleTrack} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Reference Number</label>
          <input
            type="text"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="e.g. OUK-CMP-2026-..."
            className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium transition-all"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Used for verification (leave blank if anonymous)"
            className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !ticketNumber}
          className="w-full bg-primary hover:bg-primary-darker text-white px-5 py-3 rounded-sm transition-colors flex items-center justify-center font-bold"
        >
          {loading ? <><Loader2 size={18} className="animate-spin mr-2" /> Tracking...</> : <><Search size={18} className="mr-2" /> Track Status</>}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-sm border border-red-100">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Status</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              {result.status}
            </span>
          </div>
          <div className="space-y-3">
             <div>
               <p className="text-[10px] uppercase font-bold text-slate-400">Reference</p>
               <p className="text-sm font-black text-primary-darker">{result.reference}</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
                 <p className="text-xs font-bold text-slate-700">{result.department}</p>
               </div>
               <div>
                 <p className="text-[10px] uppercase font-bold text-slate-400">Date Submitted</p>
                 <p className="text-xs font-bold text-slate-700">{result.date}</p>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
