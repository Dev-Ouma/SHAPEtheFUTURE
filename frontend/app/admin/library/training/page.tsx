"use client";

import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Loader2, 
  Video, 
  Users, 
  Clock, 
  Edit, 
  Trash2,
  MonitorPlay,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getAdminLibraryWorkshops, getAdminLibraryTutorials, deleteApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import PermissionGate from '@/components/admin/PermissionGate';
import { usePermission } from '@/hooks/useAdminPermissions';

export default function LibraryTrainingAdmin() {
  return (
    <PermissionGate permission={['knowledge_hub.view', 'knowledge_hub.manage']}>
      <LibraryTrainingAdminInner />
    </PermissionGate>
  );
}

function LibraryTrainingAdminInner() {
  const { can: canManage } = usePermission('knowledge_hub.manage');
  const [activeTab, setActiveTab] = useState<'workshops' | 'tutorials'>('workshops');
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wsData, tutData] = await Promise.all([
        getAdminLibraryWorkshops(),
        getAdminLibraryTutorials()
      ]);
      setWorkshops(Array.isArray(wsData) ? wsData : []);
      setTutorials(Array.isArray(tutData) ? tutData : []);
    } catch (error) {
      console.error("Failed to fetch training data:", error);
      toast.error("Failed to load workshops and tutorials");
      setWorkshops([]);
      setTutorials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteWorkshop = async (id: string) => {
    if (!canManage) {
      toast.error('You need knowledge_hub.manage permission to remove workshops');
      return;
    }
    if (!window.confirm("Are you sure you want to delete this workshop?")) return;
    try {
      await deleteApi(`/library/training/workshops/${id}`);
      toast.success("Workshop removed.");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete workshop.");
    }
  };

  const handleDeleteTutorial = async (id: string) => {
    if (!canManage) {
      toast.error('You need knowledge_hub.manage permission to remove tutorials');
      return;
    }
    if (!window.confirm("Are you sure you want to delete this tutorial?")) return;
    try {
      await deleteApi(`/library/training/tutorials/${id}`);
      toast.success("Tutorial removed.");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete tutorial.");
    }
  };

  const filteredWorkshops = workshops.filter(ws => ws.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredTutorials = tutorials.filter(tut => tut.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="bg-primary-darker p-12 text-white relative shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl font-black mb-4 font-serif tracking-tighter italic">Library <span className="text-primary not-italic">Training</span></h2>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
              Manage the institution's academic competency calendar and self-paced learning repositories.
            </p>
          </div>
          {canManage && (
          <Link 
            href={activeTab === 'workshops' ? '/admin/library/training/workshops/new' : '/admin/library/training/tutorials/new'}
            className="bg-primary text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-all flex items-center gap-3"
          >
             <Plus size={16} />
             Add New {activeTab === 'workshops' ? 'Workshop' : 'Tutorial'}
          </Link>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-white px-12 pt-6">
         <button 
           onClick={() => setActiveTab('workshops')}
           className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'workshops' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
         >
           Live Workshops
         </button>
         <button 
           onClick={() => setActiveTab('tutorials')}
           className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'tutorials' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
         >
           Self-Paced Tutorials
         </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 border border-slate-100 shadow-sm">
        <div className="relative flex-grow max-w-md">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
           <input 
             type="text" 
             placeholder={`Search ${activeTab}...`}
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest border border-slate-100 outline-none focus:border-primary transition-colors"
           />
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchData} className="p-4 bg-slate-50 text-slate-400 hover:text-primary transition-colors border border-slate-100">
              <RefreshCw size={18} />
           </button>
           <div className="h-6 w-px bg-slate-100 mx-2" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total: {activeTab === 'workshops' ? filteredWorkshops.length : filteredTutorials.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 space-y-4">
           <Loader2 className="animate-spin text-primary" size={48} />
           <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Syncing Educational Vault...</p>
        </div>
      ) : (
        <div className="pb-20">
          {activeTab === 'workshops' ? (
            <div className="space-y-6">
               {filteredWorkshops.map((ws) => (
                 <div key={ws.id} className="group bg-white border border-slate-100 p-10 flex flex-col xl:flex-row items-center justify-between gap-12 hover:border-primary/20 hover:shadow-2xl transition-all relative overflow-hidden">
                    {/* Visual Accent */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-colors" />

                    <div className="flex items-center gap-10 lg:w-1/3 w-full">
                       <div className="w-20 h-20 bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-primary-darker group-hover:text-white transition-all duration-500 shadow-sm relative">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">{new Date(ws.date).toLocaleString('en-US', { month: 'short' })}</p>
                          <p className="text-3xl font-black tracking-tighter tabular-nums leading-none">{new Date(ws.date).getDate()}</p>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-primary">{ws.type}</span>
                          </div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter text-primary-darker group-hover:text-primary transition-colors italic leading-tight line-clamp-2">
                            {ws.title}
                          </h3>
                       </div>
                    </div>

                    <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-10 w-full xl:w-auto">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timing</p>
                          <div className="flex items-center gap-4 text-primary-darker font-bold text-[11px] uppercase tracking-widest bg-slate-50 p-3 border border-slate-100 group-hover:border-primary/10 transition-colors">
                             <Clock size={14} className="text-primary" />
                             <span>{ws.time}</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Moderator</p>
                          <div className="flex items-center gap-4 text-primary-darker font-bold text-[11px] uppercase tracking-widest bg-slate-50 p-3 border border-slate-100 group-hover:border-primary/10 transition-colors">
                             <Users size={14} className="text-primary" />
                             <span className="truncate">{ws.speaker}</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Capacity</p>
                          <div className="bg-slate-50 p-3 border border-slate-100 group-hover:border-primary/10 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                               <p className="text-[10px] font-black text-primary-darker uppercase">{ws.available_slots}/{ws.total_slots}</p>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Slots Left</p>
                            </div>
                            <div className="w-full h-1 bg-slate-200 overflow-hidden">
                               <div 
                                 className="h-full bg-primary transition-all duration-1000" 
                                 style={{ width: `${(ws.available_slots / ws.total_slots) * 100}%` }} 
                                />
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                       {canManage ? (
                         <>
                           <Link href={`/admin/library/training/workshops/${ws.id}`} className="flex-grow xl:flex-grow-0 p-4 bg-primary-darker text-white hover:bg-primary transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest group/btn shadow-xl shadow-slate-900/10">
                             <Edit size={16} className="group-hover/btn:rotate-12 transition-transform" />
                             <span className="xl:hidden">Edit Session</span>
                           </Link>
                           <button onClick={() => handleDeleteWorkshop(ws.id)} className="p-4 border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-500 transition-all flex items-center justify-center group/del">
                             <Trash2 size={16} className="group-hover/del:scale-110 transition-transform" />
                           </button>
                         </>
                       ) : (
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">View only</span>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {filteredTutorials.map((tut) => (
                 <div key={tut.id} className="group bg-white border border-slate-100 p-10 hover:border-primary/20 hover:shadow-xl transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-200 group-hover:text-primary transition-colors">
                          <MonitorPlay size={24} />
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20 px-3 py-1 bg-primary/5">{tut.category}</span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-primary-darker group-hover:text-primary transition-colors italic mb-4 flex-grow">
                      {tut.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-6 mb-8">
                       <Clock size={12} />
                       <span>{tut.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          {canManage ? (
                            <>
                              <Link href={`/admin/library/training/tutorials/${tut.id}`} className="p-3 bg-slate-50 border border-slate-100 text-slate-400 hover:text-primary transition-all">
                                 <Edit size={14} />
                              </Link>
                              <button onClick={() => handleDeleteTutorial(tut.id)} className="p-3 bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-500 transition-all">
                                 <Trash2 size={14} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">View only</span>
                          )}
                       </div>
                       <a href={tut.video_url} target="_blank" className="p-3 bg-primary-darker text-white hover:bg-primary transition-all">
                          <ExternalLink size={14} />
                       </a>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {((activeTab === 'workshops' && filteredWorkshops.length === 0) || (activeTab === 'tutorials' && filteredTutorials.length === 0)) && (
             <div className="py-32 text-center bg-white border-2 border-dashed border-slate-100">
                <Search size={64} className="mx-auto text-slate-100 mb-6" />
                <h3 className="text-xl font-black uppercase tracking-tighter font-serif text-primary-darker italic">No {activeTab} matched</h3>
                <p className="text-slate-400 font-medium">Try a different search term or add a new entry.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
