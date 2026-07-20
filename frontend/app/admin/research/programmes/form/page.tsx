"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Briefcase, Calendar, DollarSign, Users, Layers, Activity, FileText } from 'lucide-react';
import { getApi, postApi, patchApi, getSchools, getStaffDirectory } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProgrammeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [schools, setSchools] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    overview: '',
    summary: '',
    status: 'active',
    start_date: '',
    end_date: '',
    lead_researcher_id: '',
    team_member_ids: [],
    school_id: '',
    department_id: '',
    funding_source: '',
    grant_amount: '',
    partners: '',
    objectives: '',
    methodology: '',
    expected_outcomes: '',
    impact: '',
    meta_title: '',
    meta_description: '',
    status_visibility: 'Published'
  });

  const [staffSearch, setStaffSearch] = useState("");

  const filteredStaff = staff.filter(m => 
    m.full_name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    m.job_title?.toLowerCase().includes(staffSearch.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsData, staffResponse] = await Promise.all([
          getSchools(),
          getStaffDirectory(undefined, undefined, undefined, 1000)
        ]);
        setSchools(schoolsData);
        setStaff(staffResponse);

        if (isEdit) {
          const programme = await getApi(`/research/programmes/${id}`);
          setFormData({
            ...programme,
            school_id: programme.school?.id || '',
            department_id: programme.department?.id || '',
            lead_researcher_id: programme.lead_researcher?.id || '',
            team_member_ids: programme.team_members?.map((m: any) => m.id) || [],
            start_date: programme.start_date ? new Date(programme.start_date).toISOString().split('T')[0] : '',
            end_date: programme.end_date ? new Date(programme.end_date).toISOString().split('T')[0] : '',
          });
        }
      } catch (e) {
        toast.error('Failed to initialize form');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        grant_amount: formData.grant_amount ? parseFloat(formData.grant_amount) : null
      };

      if (isEdit) {
        await patchApi(`/research/programmes/${id}`, payload);
        toast.success('Research Programme updated');
      } else {
        await postApi('/research/programmes', payload);
        toast.success('Research Programme initiated');
      }
      router.push('/admin/research/programmes');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save programme');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading focus area data...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary-darker hover:text-white transition-all shadow-sm rounded-none"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-primary-darker tracking-tight uppercase italic font-serif">
              {isEdit ? 'Modify Focus Pillar' : 'Initiate Research Pillar'}
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Strategic Research Programme v1.0</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/admin/research/programmes')}
            className="px-8 py-4 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all rounded-none"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="px-10 py-4 bg-[#037b90] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff7f50] transition-all shadow-xl shadow-[#037b90]/20 flex items-center gap-2 rounded-none"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? 'Commit Changes' : 'Launch Programme'}
          </button>
        </div>
      </div>

      <form className="space-y-12 pb-32">
        {/* Core Identity */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 flex items-center justify-center opacity-10 rotate-12">
              <Activity size={80} />
           </div>
           
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-[#037b90]/20 inline-block">
             Programme Identity
           </h2>

           <div className="grid grid-cols-1 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Programme Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none transition-all shadow-inner"
                  placeholder="Strategic research programme title..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Canonical Slug</label>
                  <input 
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none transition-all shadow-inner"
                    placeholder="programme-url-identifier"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Host School</label>
                  <select 
                    value={formData.school_id}
                    onChange={(e) => setFormData({...formData, school_id: e.target.value})}
                    className="w-full bg-slate-50 p-6 text-xs font-black uppercase tracking-widest border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none shadow-inner cursor-pointer appearance-none"
                  >
                    <option value="">Select Administrative School</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name || s.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Short Summary</label>
                <input 
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none transition-all shadow-inner"
                  placeholder="Elevator pitch (1-2 lines)..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Programme Overview</label>
                <textarea 
                  rows={6}
                  value={formData.overview}
                  onChange={(e) => setFormData({...formData, overview: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none transition-all shadow-inner"
                  placeholder="Detailed focus area narrative..."
                />
              </div>
           </div>
        </section>

        {/* Strategic Roadmap */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm relative overflow-hidden">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-[#037b90]/20 inline-block">
             Strategic Roadmap
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objectives</label>
                <textarea 
                  rows={4}
                  value={formData.objectives}
                  onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none transition-all shadow-inner"
                  placeholder="Key research goals..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Methodology</label>
                <textarea 
                  rows={4}
                  value={formData.methodology}
                  onChange={(e) => setFormData({...formData, methodology: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none transition-all shadow-inner"
                  placeholder="Approach and research methods..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expected Outcomes</label>
                <textarea 
                  rows={4}
                  value={formData.expected_outcomes}
                  onChange={(e) => setFormData({...formData, expected_outcomes: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none transition-all shadow-inner"
                  placeholder="Deliverables and outputs..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impact Statement</label>
                <textarea 
                  rows={4}
                  value={formData.impact}
                  onChange={(e) => setFormData({...formData, impact: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none transition-all shadow-inner"
                  placeholder="National and institutional significance..."
                />
              </div>
           </div>
        </section>

        {/* Personnel & Teams */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-[#037b90]/20 inline-block">
             Research Leadership
           </h2>

           <div className="grid grid-cols-1 gap-12">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Researcher</label>
                 <select 
                   value={formData.lead_researcher_id}
                   onChange={(e) => setFormData({...formData, lead_researcher_id: e.target.value})}
                   className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none shadow-inner appearance-none"
                 >
                    <option value="">Select Primary Lead</option>
                    {staff.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                 </select>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between gap-4 mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Associated Research Team</label>
                    <div className="relative w-full sm:w-64">
                       <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         value={staffSearch}
                         onChange={(e) => setStaffSearch(e.target.value)}
                         placeholder="Filter personnel..."
                         className="w-full bg-slate-100 border-none pl-10 pr-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-[#037b90] shadow-inner"
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-4 bg-slate-50 border border-slate-100 shadow-inner">
                    {filteredStaff.map(member => (
                       <label key={member.id} className={`flex items-center gap-3 p-3 bg-white border cursor-pointer hover:border-[#037b90]/30 transition-all select-none ${formData.team_member_ids.includes(member.id) ? 'border-[#037b90] ring-1 ring-[#037b90]/10' : 'border-slate-100'}`}>
                          <input 
                            type="checkbox"
                            checked={formData.team_member_ids.includes(member.id)}
                            onChange={(e) => {
                               const ids = e.target.checked 
                                ? [...formData.team_member_ids, member.id]
                                : formData.team_member_ids.filter((id: string) => id !== member.id);
                               setFormData({...formData, team_member_ids: ids});
                            }}
                            className="w-4 h-4 text-[#037b90] focus:ring-[#037b90] rounded-none"
                          />
                          <span className={`text-[10px] font-black uppercase tracking-widest line-clamp-1 ${formData.team_member_ids.includes(member.id) ? 'text-[#037b90]' : 'text-slate-600'}`}>
                            {member.full_name}
                          </span>
                       </label>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Resources & Timeline */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-[#037b90]/20 inline-block">
             Timeline & Funding
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date</label>
                       <input 
                         type="date"
                         value={formData.start_date}
                         onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                         className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none shadow-inner"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Completion</label>
                       <input 
                         type="date"
                         value={formData.end_date}
                         onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                         className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none shadow-inner"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                       {['active', 'completed', 'planned', 'archived'].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormData({...formData, status: s})}
                            className={`py-4 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.status === s ? 'bg-primary-darker border-slate-950 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                          >
                             {s}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2 pt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Visibility</label>
                    <select 
                       value={formData.status_visibility}
                       onChange={(e) => setFormData({...formData, status_visibility: e.target.value})}
                       className="w-full bg-slate-50 p-6 text-[10px] font-black uppercase tracking-widest border-none focus:ring-1 focus:ring-[#037b90]/20 shadow-inner appearance-none transition-all"
                    >
                       <option value="Published">Published to Portal</option>
                       <option value="Draft">Save as Draft</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Funding Body</label>
                    <input 
                      type="text"
                      value={formData.funding_source}
                      onChange={(e) => setFormData({...formData, funding_source: e.target.value})}
                      className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none shadow-inner"
                      placeholder="Organisation / Grant Name..."
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Appropriated Grant (KES)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input 
                         type="number"
                         value={formData.grant_amount}
                         onChange={(e) => setFormData({...formData, grant_amount: e.target.value})}
                         className="w-full bg-slate-50 p-6 pl-14 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none shadow-inner"
                         placeholder="Grant valuated amount..."
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Partners</label>
                    <textarea 
                       rows={3}
                       value={formData.partners}
                       onChange={(e) => setFormData({...formData, partners: e.target.value})}
                       className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-[#037b90]/20 outline-none transition-all shadow-inner"
                       placeholder="Collaborating institutions (one per line)..."
                    />
                 </div>
              </div>
           </div>
        </section>
      </form>
    </div>
  );
}
