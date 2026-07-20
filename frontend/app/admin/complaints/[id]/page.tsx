"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  Mail, 
  ShieldCheck, 
  AlertTriangle,
  FileText,
  Download,
  MoreVertical,
  History,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  Save,
  Info,
  ExternalLink,
  Calendar,
  RefreshCw,
  Zap,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { getApi, putApi, postApi } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import LegacyAdminFallbackBanner from "@/components/admin/LegacyAdminFallbackBanner";
import { motion, AnimatePresence } from "framer-motion";
import UserAssignmentOverlay from "@/components/admin/UserAssignmentOverlay";

export default function ComplaintDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [responseText, setResponseText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200); // Max 200px
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [responseText]);

  const getSLAHealth = () => {
    if (!complaint?.sla_due_date) return null;
    const due = new Date(complaint.sla_due_date).getTime();
    const now = new Date().getTime();
    const diff = due - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (complaint.status === 'Resolved') return { label: 'SLA Fulfilled', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={12} /> };
    if (days < 0) return { label: 'Overdue', color: 'bg-red-50 text-red-600 border-red-100', icon: <AlertTriangle size={12} /> };
    if (days <= 1) return { label: 'Critical Window', color: 'bg-orange-50 text-orange-600 border-orange-100', icon: <Clock size={12} /> };
    return { label: `${days} Days Remaining`, color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <Calendar size={12} /> };
  };

  const slaHealth = getSLAHealth();
  
  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const data = await getApi(`/complaints/admin/${id}`);
      setComplaint(data);
    } catch (err) {
      toast.error("Failed to load case data");
      router.push("/admin/complaints");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      await putApi(`/complaints/admin/${id}/status`, { status: newStatus });
      toast.success(`Case status orchestrated to: ${newStatus}`);
      fetchComplaint();
    } catch (err) {
      toast.error("Status update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResponse = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!responseText.trim()) return;
    
    setActionLoading(true);
    try {
       await postApi(`/complaints/admin/${id}/responses`, {
         message: responseText,
         is_internal: isInternal
       });
       setResponseText("");
       toast.success(isInternal ? "Internal note added" : "Public response orchestrated");
       fetchComplaint();
    } catch (err) {
       toast.error("Failed to send response");
    } finally {
       setActionLoading(false);
    }
  };

  const handleAssign = async (staffId: string) => {
    if (!staffId) return;
    setActionLoading(true);
    try {
       await putApi(`/complaints/admin/${id}/assign`, { staff_id: staffId });
       toast.success("Case successfully assigned to officer");
       setIsAssignmentOpen(false);
       fetchComplaint();
    } catch (err) {
       toast.error("Assignment orchestration failed");
    } finally {
       setActionLoading(false);
    }
  };

  const handleSuggestResponse = async () => {
    setIsSuggesting(true);
    try {
      const data = await getApi(`/complaints/admin/${id}/suggest-response`);
      if (data?.suggestion) {
        setResponseText(data.suggestion);
        setIsInternal(false);
        toast.success("AI suggestion generated!");
      }
    } catch (err: any) {
      toast.error("Failed to generate AI suggestion");
    } finally {
      setIsSuggesting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <div className="animate-spin text-primary rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 pb-40">
      <LegacyAdminFallbackBanner message="Legacy grievance case detail. The same case may also appear in the ICT Service Desk after migration." />
      <div className="space-y-12">
        
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-8">
            <Link href="/admin/complaints" className="p-4 bg-white border border-slate-200 rounded-[1.5rem] text-slate-400 hover:text-primary transition-all shadow-sm">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-4 mb-2">
                 <span className="text-[10px] font-black text-primary font-mono bg-primary hover:bg-[#ff7f50] hover:text-white transition-all/5 px-3 py-1 rounded-full uppercase">{complaint.reference_number}</span>
                 <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                   complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                 }`}>
                   {complaint.status}
                 </span>
                 {slaHealth && (
                   <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${slaHealth.color}`}>
                      {slaHealth.icon}
                      {slaHealth.label}
                   </div>
                 )}
              </div>
              <h2 className="text-4xl font-black text-primary-darker font-serif lowercase tracking-tighter capitalize ">Case Resolution Hub</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <select 
               className="bg-white border border-slate-200 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary shadow-sm"
               value={complaint.status}
               onChange={(e) => updateStatus(e.target.value)}
               disabled={actionLoading}
             >
                {['Submitted', 'Acknowledged', 'Under Review', 'In Progress', 'Resolved', 'Closed', 'Rejected'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Detailed Case Content */}
           <div className="lg:col-span-2 space-y-12">
              
              {/* The Narrative Section */}
              <div className="bg-white border border-slate-200 rounded-[3rem] p-12 space-y-10 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                 
                 <div className="space-y-10 relative z-10">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Subject Registry</span>
                       <h3 className="text-3xl font-black text-primary-darker group-hover:text-primary transition-colors font-serif lowercase tracking-tighter capitalize leading-tight">
                         {complaint.subject}
                       </h3>
                    </div>

                    <div className="p-10 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                       <MessageSquare size={14} className="absolute top-8 right-8 text-slate-200" />
                       <div 
                         className="text-lg text-slate-700 font-medium leading-relaxed italic"
                         dangerouslySetInnerHTML={{ __html: sanitizeHtml(complaint.description) }}
                       />
                    </div>

                    {complaint.attachment_urls && complaint.attachment_urls.length > 0 && (
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Supporting Evidence</h4>
                         <div className="flex flex-wrap gap-4">
                            {complaint.attachment_urls.map((url: string, i: number) => (
                              <Link 
                                key={i} href={url} target="_blank"
                                className="px-6 py-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-[#ff7f50] transition-all group shadow-sm"
                              >
                                 <FileText size={18} className="text-slate-400 group-hover:text-primary" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Attachment {i+1}</span>
                                 <ExternalLink size={12} className="opacity-40" />
                              </Link>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
              </div>

                    {/* Sticky Response Centre */}
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[40] w-full max-w-4xl px-6">
                       <div className="bg-primary-darker shadow-2xl shadow-primary/20 rounded-[2.5rem] p-4 md:p-6 border border-white/10 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                          <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
                             <div className="flex-1 w-full relative">
                                {/* AI Suggestion Button */}
                                <div className="absolute -top-10 left-2">
                                   <button 
                                     type="button"
                                     onClick={handleSuggestResponse}
                                     disabled={isSuggesting}
                                     className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/20 hover:bg-secondary/40 text-secondary-light rounded-full text-[9px] font-black uppercase tracking-widest transition-all backdrop-blur-sm"
                                   >
                                     <Sparkles size={10} className={isSuggesting ? "animate-pulse" : ""} />
                                     {isSuggesting ? "Drafting..." : "Suggest AI Response"}
                                   </button>
                                </div>
                                <textarea 
                                  ref={textareaRef}
                                  value={responseText}
                                  onChange={(e) => setResponseText(e.target.value)}
                                  placeholder={isInternal ? "Type internal audit note..." : "Draft public response to stakeholder..."}
                                  className="w-full bg-white/5 border border-white/10 p-4 rounded-3xl font-medium text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-sm custom-scrollbar"
                                  rows={1}
                                  style={{ maxHeight: '200px' }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleResponse(e as any);
                                    }
                                  }}
                                />
                             </div>
                             <div className="flex items-center gap-3 shrink-0">
                                <button 
                                  type="button" 
                                  onClick={() => setIsInternal(!isInternal)}
                                  className={`flex items-center gap-2 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isInternal ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "bg-white/10 text-white hover:bg-white/20"
                                  }`}
                                >
                                   {isInternal ? <ShieldAlert size={12} /> : <MessageSquare size={12} />}
                                   <span>{isInternal ? "Internal" : "Public"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleResponse}
                                  disabled={!responseText.trim() || actionLoading}
                                  className="bg-primary hover:bg-[#ff7f50] hover:text-white text-white py-3.5 px-8 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 disabled:opacity-50 active:scale-95 transition-all"
                                >
                                   {actionLoading ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />}
                                   <span>Send</span>
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Response List */}
                    <div className="space-y-10 pl-6 border-l-2 border-slate-50">
                       <AnimatePresence mode="popLayout">
                          {complaint.responses && complaint.responses.length > 0 ? (
                            complaint.responses.map((resp: any, i: number) => (
                               <motion.div 
                                 key={resp.id}
                                 initial={{ opacity: 0, x: -20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: i * 0.1 }}
                                 className={`relative p-10 rounded-[2.5rem] border ${
                                   resp.is_internal 
                                   ? "bg-slate-50 border-slate-200 border-dashed" 
                                   : "bg-white border-slate-100 shadow-xl shadow-slate-50"
                                 }`}
                               >
                                  {resp.is_internal && (
                                    <div className="absolute top-8 right-8 text-secondary flex items-center gap-2 opacity-50">
                                       <span className="text-[8px] font-black uppercase tracking-widest">Confidential Audit Note</span>
                                       <ShieldAlert size={12} />
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 mb-6">
                                     <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center">
                                        <User size={18} />
                                     </div>
                                     <div>
                                        <div className="flex items-center gap-2 mb-1">
                                           <p className="text-[10px] font-black uppercase tracking-widest text-primary-darker leading-none">
                                              {resp.responded_by?.full_name || "System Admin"}
                                           </p>
                                           {resp.responded_by?.role?.name && (
                                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                                ['Service Desk Manager', 'Grievance Manager'].includes(resp.responded_by.role.name)
                                                ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                                : 'bg-slate-50 text-slate-500 border-slate-100'
                                              }`}>
                                                 {resp.responded_by.role.name}
                                              </span>
                                           )}
                                        </div>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(resp.created_at).toLocaleString()}</span>
                                     </div>
                                  </div>
                                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{resp.message}</p>
                               </motion.div>
                            ))
                          ) : (
                             <div className="py-20 text-center opacity-40 uppercase font-black text-[10px] tracking-[0.3em]">No communication history detected</div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>

           {/* Side Details Container */}
           {/* Side Details Container */}
           <aside className="space-y-12">
              
              {/* Complainant Intel */}
              <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm space-y-8">
                 <div className="flex items-center gap-3">
                    <User className="text-secondary" size={24} />
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary-darker font-serif">Complainant Hub</h4>
                 </div>
                 
                 <div className="space-y-8">
                    {complaint.is_anonymous ? (
                      <div className="p-8 bg-primary-darker text-white rounded-[2rem] space-y-4">
                         <div className="flex items-center gap-3 text-primary">
                            <ShieldCheck size={24} />
                            <h5 className="text-sm font-black uppercase tracking-widest">Anonymous Entry</h5>
                         </div>
                         <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest leading-loose">
                           Stakeholder metadata stripped at submission. No PII is linked to this case record.
                         </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                         <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block px-2">Official Identity</span>
                            <div className="p-4 bg-slate-50 rounded-2xl font-black text-primary-darker text-sm">{complaint.full_name}</div>
                         </div>
                         <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block px-2">Contact Link</span>
                            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                               <span className="text-[10px] font-black text-slate-700 truncate">{complaint.email}</span>
                               <Mail size={14} className="text-slate-300" />
                            </div>
                         </div>
                         {complaint.identification_number && (
                           <div className="space-y-1">
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block px-2">ID Registry</span>
                              <div className="p-4 bg-slate-50 rounded-2xl font-mono text-[10px] font-black tracking-widest">{complaint.identification_number}</div>
                           </div>
                         )}
                      </div>
                    )}
                 </div>
              </div>

               {/* AI Intelligence Panel */}
               {(complaint.sentiment || (complaint.tags && complaint.tags.length > 0) || complaint.ai_confidence_score) && (
                 <div className="bg-gradient-to-br from-primary-darker to-[#1a4a6e] text-white p-8 rounded-[3rem] space-y-6">
                   <div className="flex items-center gap-3">
                     <Zap className="text-secondary" size={20} />
                     <h4 className="text-xs font-black uppercase tracking-widest">AI Analysis</h4>
                   </div>

                   {complaint.sentiment && (
                     <div className="space-y-1">
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/50 block">Detected Sentiment</span>
                       <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${
                         complaint.sentiment === "Urgent" ? "bg-red-500" :
                         complaint.sentiment === "Negative" ? "bg-amber-500" :
                         complaint.sentiment === "Positive" ? "bg-emerald-500" : "bg-white/20"
                       }`}>
                         {complaint.sentiment}
                       </div>
                     </div>
                   )}

                   {complaint.subcategory && (
                     <div className="space-y-1">
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/50 block">Sub-category</span>
                       <p className="text-sm font-bold">{complaint.subcategory}</p>
                     </div>
                   )}

                   {complaint.tags && complaint.tags.length > 0 && (
                     <div className="space-y-2">
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/50 block">AI Tags</span>
                       <div className="flex flex-wrap gap-1.5">
                         {complaint.tags.map((tag: string, i: number) => (
                           <span key={i} className="px-2.5 py-1 bg-white/10 border border-white/10 rounded-full text-[9px] font-black">
                             #{tag}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}

                   {complaint.keywords && complaint.keywords.length > 0 && (
                     <div className="space-y-2">
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/50 block">Key Entities</span>
                       <div className="flex flex-wrap gap-1.5">
                         {complaint.keywords.map((kw: string, i: number) => (
                           <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-white/70">
                             {kw}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}

                   {complaint.ai_confidence_score && (
                     <div className="space-y-2">
                       <span className="text-[8px] font-black uppercase tracking-widest text-white/50 block">Classification Confidence</span>
                       <div className="flex items-center gap-3">
                         <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.round(complaint.ai_confidence_score * 100)}%` }} />
                         </div>
                         <span className="text-sm font-black text-secondary">{Math.round(complaint.ai_confidence_score * 100)}%</span>
                       </div>
                     </div>
                   )}
                 </div>
               )}

               {/* Escalation Alert */}
               {complaint.is_escalated && (
                 <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl space-y-2">
                   <div className="flex items-center gap-2 text-orange-600">
                     <ShieldAlert size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Case Escalated</span>
                   </div>
                   {complaint.escalation_reason && (
                     <p className="text-xs text-orange-700 font-medium leading-relaxed">{complaint.escalation_reason}</p>
                   )}
                 </div>
               )}

         {/* SLA & Governance Registry */}
               <div className="bg-slate-50 border border-slate-200 p-10 rounded-[3rem] space-y-8">
                   <div className="flex items-center gap-3">
                     <History className="text-primary" size={24} />
                     <h4 className="text-xs font-black uppercase tracking-widest text-primary-darker font-serif">SLA Registry</h4>
                   </div>

                   <div className="space-y-6">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                         <span className="text-slate-400">Status</span>
                         <span className="text-primary">{complaint.status}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                         <span className="text-slate-400">Priority Level</span>
                         <span className={complaint.priority === 'Critical' ? 'text-red-500' : 'text-primary-darker'}>{complaint.priority}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                         <span className="text-slate-400">Institutional SLA</span>
                         <span className="text-primary-darker">{new Date(complaint.sla_due_date).toLocaleDateString()}</span>
                      </div>
                      <div className="h-px bg-slate-200" />
                      
                      {/* Assignment Controller */}
                      <div className="space-y-3">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Assigned Officer</span>
                         
                         {complaint.assigned_to ? (
                            <button 
                              onClick={() => setIsAssignmentOpen(true)}
                              className="w-full bg-white border border-slate-200 p-5 rounded-3xl flex items-center justify-between group hover:border-[#ff7f50] transition-all text-left shadow-sm"
                            >
                               <div className="flex items-center gap-4 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-[#ff7f50] hover:text-white transition-all">
                                     <User size={18} />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-primary-darker truncate">
                                        {complaint.assigned_to.full_name}
                                     </p>
                                     <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Click to reassign officer</span>
                                  </div>
                               </div>
                               <ChevronRight size={14} className="text-slate-200 group-hover:text-primary transition-all" />
                            </button>
                         ) : (
                             <div className="mt-2 p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2 text-orange-600">
                                   <Zap size={14} />
                                   <span className="text-[9px] font-black uppercase tracking-widest">Action Suggested</span>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold leading-relaxed px-1">Case is currently unassigned. Assigning an officer will orchestrate status to "In Progress".</p>
                                <button 
                                  onClick={() => setIsAssignmentOpen(true)}
                                  className="w-full py-3 bg-primary-darker text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all shadow-lg shadow-black/20"
                                >
                                  Assign Officer Now
                                </button>
                             </div>
                         )}
                      </div>
                   </div>
               </div>

               <UserAssignmentOverlay 
                 isOpen={isAssignmentOpen}
                 onClose={() => setIsAssignmentOpen(false)}
                 onAssign={handleAssign}
                 currentAssigneeId={complaint.assigned_to?.id}
               />

           </aside>
        </div>
      </div>
    </div>
  );
}
