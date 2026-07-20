"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw,
  Building2,
  X,
  Check,
  ExternalLink
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi, resolveImageUrl } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function SchoolsManagement() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: ""
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const data = await getApi('/schools');
      setSchools(data || []);
    } catch (err) {
      toast.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (school: any = null) => {
    if (school) {
      window.location.href = `/admin/schools/${school.id}`;
    } else {
      window.location.href = `/admin/schools/new`;
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-primary-darker mb-2 font-serif ">Academic Schools</h2>
          <p className="text-slate-500 font-medium tracking-tight">Manage the foundational academic pillars of the university.</p>
        </div>
        <button 
           onClick={() => handleOpenModal()}
           className="bg-[#037b90] hover:bg-[#ff7f50] transition-all text-white py-4 px-10 flex items-center space-x-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-[#037b90]/10"
        >
          <Plus size={18} />
          <span>Add New School</span>
        </button>
      </div>

      <div className="flex items-center justify-between bg-white p-6 border border-slate-200">
         <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Search schools..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-slate-50 border-none p-4 pl-12 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none placeholder:uppercase placeholder:text-[10px]"
            />
         </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <RefreshCw className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {schools?.map((school: any) => (
              <div key={school.id} className="bg-white border border-slate-200 p-8 hover:border-[#ff7f50] transition-all group flex flex-col justify-between relative overflow-hidden">
                 {school.is_featured && (
                     <div className="absolute top-0 right-0 p-4">
                        <div className="bg-[#037b90] hover:bg-[#ff7f50] hover:text-white transition-all text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Featured</div>
                     </div>
                 )}
                 <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                       <div className="w-12 h-12 bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-colors">
                          {school.logo_url ? <img src={resolveImageUrl(school.logo_url)} className="w-full h-full object-contain" alt="" /> : <Building2 size={24} />}
                       </div>
                       <div>
                          <h4 className="text-xl font-black uppercase tracking-tight text-primary-darker">{school.name}</h4>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">/{school.slug}</span>
                       </div>
                    </div>
                    <div className="flex space-x-2">
                       <button onClick={() => handleOpenModal(school)} className="p-3 bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                          <Edit size={16} />
                       </button>
                    </div>
                 </div>
                 
                 <div className="mt-6 flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                       {school.dean?.profile_image_url ? <img src={resolveImageUrl(school.dean.profile_image_url)} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400">?</div>}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                       {school.dean ? `DEAN: ${school.dean.full_name}` : "NO DEAN ASSIGNED"}
                    </span>
                 </div>

                 <p className="mt-4 text-sm text-slate-500 line-clamp-2 leading-relaxed h-10">
                   {school.description || "No description provided."}
                 </p>
                 <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <div className="flex space-x-4">
                       <span>{school.programmes?.length || 0} programmes</span>
                       <span>{school.departments?.length || 0} departments</span>
                    </div>
                    <button onClick={() => handleOpenModal(school)} className="flex items-center space-x-2 hover:text-primary transition-colors">
                       <span>Edit Hub</span>
                       <ExternalLink size={12} />
                    </button>
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
