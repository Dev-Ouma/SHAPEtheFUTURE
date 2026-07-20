"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Eye, ArrowRight } from "lucide-react";
import { getApi, patchApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import ProgrammeDetailClient from "@/components/ProgrammeDetailClient";
import Link from "next/link";

export default function PreviewProgramme() {
  const { id } = useParams();
  const router = useRouter();
  
  const [programme, setProgramme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const data = await getApi(`/programmes/${id}`);
      if (data) {
        setProgramme(data);
      }
    } catch (err) {
      toast.error("Failed to load programme preview");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setProcessing(true);
    try {
      await patchApi(`/programmes/${id}/status`, { status: newStatus });
      toast.success(`Programme successfully updated to ${newStatus}`);
      router.push('/admin/programmes');
    } catch (err) {
      toast.error("Failed to update status. Ensure you have the right permissions.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400 animate-pulse">Loading Preview...</div>;
  if (!programme) return <div className="p-20 text-center text-slate-400">Programme not found.</div>;

  return (
    <div className="space-y-0 pb-0 bg-white min-h-screen relative z-10">
      {/* Action Bar (Admin) */}
      <div className="bg-white border-b-2 border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 shadow-sm gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-primary-darker uppercase tracking-tighter flex items-center gap-2">
              <Eye size={20} className="text-primary" />
              Programme Review & Preview
            </h2>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">
              Current Status: <span className="text-primary">{programme.status || "DRAFT"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleStatusUpdate("DRAFT")}
            disabled={processing}
            className="px-6 py-3 border-2 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <XCircle size={16} />
            Reject / Return to Draft
          </button>
          <button 
            onClick={() => handleStatusUpdate("PUBLISHED")}
            disabled={processing}
            className="px-6 py-3 bg-green-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {processing ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Approve & Publish to Public
          </button>
        </div>
      </div>

      {/* Actual Preview Content (Mimics public view) */}
      <div className="w-full">
        {/* High-Fidelity Header Mimic */}
        <header className="bg-primary-darker pt-24 pb-32 px-6 border-b-8 border-primary relative overflow-hidden">
          {/* Background Accents */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 -mr-96 -mt-96 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 -ml-48 -mb-48 rounded-full blur-[80px]" />
          
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end mt-8">
              <div className="space-y-10">
                <div className="flex items-center space-x-6">
                  <span className="bg-primary-darker text-white border border-white/10 px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                    {programme.level || "Degree"}
                  </span>
                  <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                    CODE: {programme.programme_code || "OUK-BDS-01"}
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight font-serif max-w-xl italic">
                  {programme.title}
                </h1>

                <div className="flex flex-wrap gap-12 pt-10">
                  <div className="border-l border-secondary/30 pl-6">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Duration</p>
                    <p className="text-white font-black uppercase tracking-tight">{programme.duration || "4 Years"}</p>
                  </div>
                  <div className="border-l border-secondary/30 pl-6">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Mode of Study</p>
                    <p className="text-white font-black uppercase tracking-tight">{programme.mode_of_delivery?.join(' & ') || "Online"}</p>
                  </div>
                  <div className="border-l border-secondary/30 pl-6">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Academic School</p>
                    <div className="text-white font-black uppercase tracking-tight flex items-center">
                      <span>{programme.school?.name || "Science & Technology"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 space-y-8">
                  <p className="text-slate-400 font-medium text-lg leading-relaxed">
                    Join a world-class institutional environment designed for the digital age. This programme offers a direct pathway to global career outcomes through technology-enabled learning.
                  </p>
                  <div className="flex items-center space-x-3 text-primary font-black uppercase tracking-[0.2em] text-[9px]">
                    <span className="w-10 h-0.5 bg-primary" />
                    <span>Accredited Academic Pathway</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Interactive Main Content Section */}
        <section className="py-24 container mx-auto px-6 max-w-7xl -mt-20 relative z-20">
          <ProgrammeDetailClient programme={programme} />
        </section>
      </div>
    </div>
  );
}
