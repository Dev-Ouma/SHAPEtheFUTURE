"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  FileText,
  Clock,
  MessageSquare,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { getApi, patchApi } from "@/lib/api";
import { useAlert } from "@/context/AlertContext";
import { toast } from "react-hot-toast";
import PermissionGate from "@/components/admin/PermissionGate";
import { useAdminUser } from "@/hooks/useAdminPermissions";

export default function ContentApprovals() {
  return (
    <PermissionGate permission="governance.manage">
      <ContentApprovalsInner />
    </PermissionGate>
  );
}

function ContentApprovalsInner() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const { user } = useAdminUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getApi(`/governance/pending`);
      setItems(response || []);
    } catch (error) {
      toast.error("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type: string, id: string, title: string) => {
    showAlert({
      title: "Approve Content?",
      message: `Are you sure you want to approve "${title}"? It will be published immediately.`,
      onConfirm: async () => {
        try {
          await patchApi(`/governance/status/${type}/${id}`, { 
            status: 'PUBLISHED',
            approverId: user?.id || null
          });
          toast.success("Content approved and published.");
          fetchData();
        } catch (error) {
          toast.error("Failed to approve content");
        }
      }
    });
  };

  const handleReject = async (type: string, id: string, title: string) => {
     // A simple alert here, though in a real app it would be a modal for notes
     const reason = window.prompt(`Provide a reason for rejecting "${title}":`);
     if (reason !== null) {
        try {
           await patchApi(`/governance/status/${type}/${id}`, { 
             status: 'DRAFT',
             reviewNotes: reason,
             approverId: user?.id || null 
           });
           toast.success("Content rejected and sent back to draft.");
           fetchData();
        } catch (error) {
           toast.error("Failed to reject content");
        }
     }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto w-full pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 border border-slate-200 shadow-sm">
        <div className="space-y-3">
           <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <ShieldAlert size={14} />
              <span>Governance & Compliance</span>
           </div>
          <h2 className="text-3xl md:text-4xl font-black text-primary-darker tracking-tighter">Content Approvals</h2>
          <p className="text-slate-500 font-medium text-sm max-w-xl">Review and approve pending content submissions before they are published to the public portal.</p>
        </div>
        <button onClick={fetchData} className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white py-3 px-6 flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl shadow-sm group">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <RefreshCw className="animate-spin text-primary" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Synchronising Workflow...</p>
        </div>
      ) : items.length === 0 ? (
         <div className="py-40 text-center bg-white border border-slate-200 shadow-sm">
            <CheckCircle className="mx-auto text-green-400 mb-6" size={64} />
            <p className="text-slate-400 uppercase font-black tracking-[0.4em] text-xs ">All Caught Up</p>
            <p className="text-slate-300 text-[10px] mt-2 font-bold uppercase tracking-widest">There is no pending content requiring your approval.</p>
         </div>
      ) : (
         <div className="bg-white border border-slate-200 divide-y divide-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
            {items.map((item) => (
               <div key={item.id} className="group hover:bg-slate-50 transition-colors p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Status Icon */}
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-none border bg-yellow-50 border-yellow-100 text-yellow-600">
                     <Clock size={20} />
                  </div>

                  {/* Primary Info */}
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-black text-primary-darker uppercase tracking-tight truncate group-hover:text-primary transition-colors">{item.title}</h4>
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border border-yellow-200 text-yellow-600 bg-yellow-50">
                           Pending Review
                        </span>
                     </div>
                     <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <FileText size={12} className="text-primary" /> {item.entity_type}
                        </span>
                        {item.author && (
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-l border-slate-200 pl-6">
                              <MessageSquare className="text-primary" size={12} /> By {item.author.full_name}
                           </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-l border-slate-200 pl-6">
                           <Clock size={12} className="text-primary" /> Last updated: {new Date(item.updated_at).toLocaleDateString()}
                        </span>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 mt-4 md:mt-0">
                     <Link 
                       href={`/${item.entity_type === 'program' ? 'programmes' : item.entity_type === 'news' ? 'news' : ''}/${item.slug}`} 
                       target="_blank"
                       className="px-4 py-3 flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm text-[9px] font-black uppercase tracking-widest"
                     >
                       <Eye size={14} /> Preview
                     </Link>
                     <button 
                       onClick={() => handleApprove(item.entity_type, item.id, item.title)}
                       className="px-4 py-3 flex items-center gap-2 bg-green-500 border border-green-600 text-white hover:bg-green-600 transition-all shadow-sm text-[9px] font-black uppercase tracking-widest"
                     >
                       <CheckCircle size={14} /> Approve
                     </button>
                     <button 
                       onClick={() => handleReject(item.entity_type, item.id, item.title)}
                       className="px-4 py-3 flex items-center gap-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-all shadow-sm text-[9px] font-black uppercase tracking-widest"
                     >
                       <XCircle size={14} /> Reject
                     </button>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}
