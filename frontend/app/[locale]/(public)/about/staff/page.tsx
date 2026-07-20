"use client";

import React, { useEffect, useState, Suspense } from "react";
import { 
  Search, Filter, Users, School as SchoolIcon, 
  MapPin, Mail, ChevronRight, RefreshCw,
  LayoutGrid, List, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import { getStaffDirectory, getSchools, getStaffTypes, resolveImageUrl } from "@/lib/api";
import { useTranslations } from "next-intl";

const ALL_SCHOOLS = "__all_schools__";
const ALL_ROLES = "__all_roles__";

const MOCK_STAFF = [
  {
    id: "v-01",
    full_name: "Prof. Elijah Omwenga",
    honorific_title: "Prof.",
    leadership_position: "Vice-Chancellor",
    profile_slug: "prof-elijah-omwenga",
    is_featured: true,
    is_public: true,
    profile_image_url: "https://images.unsplash.com/photo-1544168190-79c17527004f?q=80&w=2576&auto=format&fit=crop",
    executive_type: { name: "University Leadership" },
    staff_type: { name: "Executive" },
    school: { name: "Office of the VC" },
    department: { name: "Administration" },
    expertise: ["Digital Transformation", "ODL Policy", "Institutional Strategy"]
  },
  {
    id: "d-01",
    full_name: "Dr. Jane Kamau",
    honorific_title: "Dr.",
    leadership_position: "Dean, School of Science & Tech",
    profile_slug: "dr-jane-kamau",
    is_featured: true,
    is_public: true,
    profile_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop",
    executive_type: { name: "Academic Leadership" },
    staff_type: { name: "Faculty" },
    school: { name: "Science & Technology" },
    department: { name: "Computer Science" },
    expertise: ["Artificial Intelligence", "Cybersecurity", "Ethics in Tech"]
  },
  {
    id: "f-01",
    full_name: "Prof. David Mutua",
    honorific_title: "Prof.",
    leadership_position: "Director, Research & Innovation",
    profile_slug: "prof-david-mutua",
    is_featured: false,
    is_public: true,
    profile_image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2574&auto=format&fit=crop",
    executive_type: { name: "Academic Leadership" },
    staff_type: { name: "Research" },
    school: { name: "Postgraduate Studies" },
    department: { name: "Innovation Hub" },
    expertise: ["Renewable Energy", "Sustainable Tech", "Grant Management"]
  },
  {
    id: "f-02",
    full_name: "Dr. Sarah Ahmed",
    honorific_title: "Dr.",
    leadership_position: "Senior Lecturer",
    profile_slug: "dr-sarah-ahmed",
    is_featured: false,
    is_public: true,
    profile_image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2561&auto=format&fit=crop",
    executive_type: null,
    staff_type: { name: "Faculty" },
    school: { name: "Education & ODL" },
    department: { name: "Pedagogy" },
    expertise: ["Instructional Design", "E-Learning", "Digital Assessment"]
  }
];

const CustomDropdown = ({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label || value;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[220px]" ref={containerRef}>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-4">{label}</p>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-100 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary-darker flex items-center justify-between hover:bg-slate-200 transition-all border border-transparent shadow-sm group"
      >
        <span className="truncate pr-4">{selectedLabel}</span>
        <ChevronRight size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-slate-400 group-hover:text-primary"}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden py-4 ring-1 ring-slate-900/5"
          >
            <div className="max-h-[320px] overflow-y-auto px-2 space-y-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`w-full text-left px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors ${value === opt.value ? "text-primary bg-primary/5" : "text-slate-500"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StaffDirectoryPage = () => {
  const t = useTranslations("Staff");
  const [members, setMembers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [staffTypes, setStaffTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(ALL_SCHOOLS);
  const [selectedType, setSelectedType] = useState(ALL_ROLES);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    const init = async () => {
      try {
        const [mems, schs, types] = await Promise.all([
          getStaffDirectory(undefined, undefined, undefined, 100),
          getSchools(),
          getStaffTypes()
        ]);
        
        let staffData = Array.isArray(mems) ? mems : (mems as any).data || [];
        
        // Merge with Mock Data if real data is empty or short
        if (staffData.length < 5) {
          staffData = [...MOCK_STAFF, ...staffData];
        }
        
        setMembers(staffData);
        setSchools(schs);
        setStaffTypes(types);
      } catch (err) {
        console.error("Failed to load directory", err);
        setMembers(MOCK_STAFF); // Fallback to mock on error
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filteredMembers = members.filter(m => {
    const memName = m.full_name || "";
    const memLeader = m.leadership_position || "";
    const memExpertise = (m.expertise || []).join(" ");
    
    const matchesSearch = memName.toLowerCase().includes(search.toLowerCase()) || 
                          memLeader.toLowerCase().includes(search.toLowerCase()) ||
                          memExpertise.toLowerCase().includes(search.toLowerCase());
    const matchesSchool = selectedSchool === ALL_SCHOOLS || m.school?.name === selectedSchool;
    const matchesType = selectedType === ALL_ROLES || m.staff_type?.name === selectedType;
    return matchesSearch && matchesSchool && matchesType && (m.is_public !== false);
  });

  const featuredStaff = filteredMembers.filter(m => m.is_featured);
  const regularStaff = filteredMembers.filter(m => !m.is_featured);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden bg-primary-darker">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-end">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-8"
            >
              <div className="flex items-center space-x-6 mb-12">
                <div className="w-16 h-1 bg-primary" />
                <span className="text-secondary font-black uppercase tracking-[0.5em] text-[11px]">{t("eyebrow")}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight mb-8 font-serif">
                {t("title")} <span className="text-primary italic">{t("titleAccent")}</span>
              </h1>
              <p className="text-slate-400 text-2xl font-medium max-w-2xl leading-relaxed">
                {t("body")}
              </p>
            </motion.div>

            <div className="lg:col-span-4 pb-2">
               <div className="grid grid-cols-2 gap-12 border-l border-white/10 pl-12">
                  <div>
                    <p className="text-5xl font-black text-white tracking-tighter tabular-nums">85+</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("statFaculty")}</p>
                  </div>
                  <div>
                    <p className="text-5xl font-black text-primary tracking-tighter tabular-nums">12+</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("statSchools")}</p>
                  </div>
                  <div>
                    <p className="text-5xl font-black text-white tracking-tighter tabular-nums">140+</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("statProjects")}</p>
                  </div>
                  <div>
                    <p className="text-5xl font-black text-secondary tracking-tighter tabular-nums">98%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("statDigital")}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Filter Bar */}
      <section className="sticky top-20 z-40 bg-white/90 backdrop-blur-2xl border-y border-slate-200 shadow-xl shadow-slate-900/5">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-100 border-2 border-transparent focus:border-primary/20 rounded-2xl text-sm font-bold transition-all placeholder:text-slate-400 outline-none"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              <CustomDropdown 
                label={t("schoolLabel")}
                value={selectedSchool}
                options={[
                  { value: ALL_SCHOOLS, label: t("allSchools") },
                  ...schools.map((s) => ({ value: s.name, label: s.name })),
                ]}
                onChange={setSelectedSchool}
              />

              <CustomDropdown 
                label={t("roleLabel")}
                value={selectedType}
                options={[
                  { value: ALL_ROLES, label: t("allRoles") },
                  ...staffTypes.map((st) => ({ value: st.name, label: st.name })),
                ]}
                onChange={setSelectedType}
              />

              <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-3.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-white shadow-lg text-primary" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-3.5 rounded-xl transition-all ${viewMode === "list" ? "bg-white shadow-lg text-primary" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <main className="container mx-auto px-6 py-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-8">
            <RefreshCw className="animate-spin text-primary" size={72} strokeWidth={1.5} />
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-400 animate-pulse">{t("orchestrating")}</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-40 bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50">
            <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-full mx-auto mb-10">
               <Users size={40} className="text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-primary-darker uppercase tracking-tighter mb-4">{t("emptyTitle")}</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 text-lg">{t("emptyBody")}</p>
            <button 
              onClick={() => { setSearch(""); setSelectedSchool(ALL_SCHOOLS); setSelectedType(ALL_ROLES); }} 
              className="bg-primary text-white py-6 px-16 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all"
            >
              {t("resetProtocols")}
            </button>
          </div>
        ) : (
          <div className="space-y-32">
            {/* Featured Section */}
            {featuredStaff.length > 0 && (
              <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                  <div className="max-w-xl">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-1 bg-primary" />
                      <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">{t("registry01")}</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-primary-darker font-serif leading-none flex items-center gap-6">
                      {t("leadershipTitle")} <br/> {t("leadershipTitleAccent")} <Sparkles className="text-amber-500" size={40} />
                    </h2>
                  </div>
                  <p className="text-slate-500 font-medium max-w-sm text-lg leading-relaxed border-l-2 border-slate-100 pl-8">{t("leadershipBody")}</p>
                </div>
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "space-y-8"}>
                  {featuredStaff.map((member, i) => (
                    <StaffCard key={member.id} member={member} i={i} viewMode={viewMode} />
                  ))}
                </div>
              </section>
            )}

            {/* General Directory */}
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                  <div className="max-w-xl">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-1 bg-slate-300" />
                      <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">{t("registry02")}</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-primary-darker font-serif leading-none">
                      {t("directoryTitle")} <br/> {t("directoryTitleAccent")}
                    </h2>
                  </div>
                  <p className="text-slate-500 font-medium max-w-sm text-lg leading-relaxed border-l-2 border-slate-100 pl-8">{t("directoryBody")}</p>
              </div>
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "space-y-6"}>
                {regularStaff.map((member, i) => (
                  <StaffCard key={member.id} member={member} i={i} viewMode={viewMode} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Institutional Support Section */}
      <section className="bg-primary-darker py-32 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-40 opacity-5 pointer-events-none">
          <SchoolIcon size={500} strokeWidth={1} />
        </div>
        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
           <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter font-serif mb-12 italic leading-none">
             {t("ctaTitle")} <br/> <span className="text-primary not-italic">{t("ctaTitleAccent")}</span>
           </h2>
           <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
             {t("ctaBody")}
           </p>
           <div className="flex justify-center flex-wrap gap-8">
              <Link href="/careers">
                <button className="bg-primary !text-white py-6 px-16 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                  {t("facultyVacancies")}
                </button>
              </Link>
              <Link href="/research">
                <button className="bg-white/5 border border-white/10 hover:bg-white/10 !text-white py-6 px-16 text-[10px] font-black uppercase tracking-widest transition-all">
                  {t("researchPortal")}
                </button>
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
};

const StaffCard = ({ member, i, viewMode }: { member: any, i: number, viewMode: "grid" | "list" }) => {
  const t = useTranslations("Staff");
  const imageUrl = resolveImageUrl(member.profile_image_url) || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop";
  const expertise = member.expertise || ["Scholarly Research", "Digital Pedagogy"];

  if (viewMode === "list") {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.05 }}
        className="group bg-white rounded-2xl border border-slate-100 p-3 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center justify-between"
      >
        <Link href={`/about/staff/${member.profile_slug}`} className="flex items-center space-x-6 flex-1">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
              <img 
                src={imageUrl} 
                alt={member.full_name} 
                className="standard-image transition-transform duration-700 group-hover:scale-110" 
              />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h4 className="text-lg font-black text-primary-darker uppercase tracking-tighter group-hover:text-primary transition-colors">{member.full_name}</h4>
              {member.is_featured && <Sparkles size={14} className="text-amber-500" />}
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#ff7f50]">{member.leadership_position || member.staff_type?.name}</p>
            <div className="hidden md:flex flex-wrap gap-2 pt-0.5">
              {expertise.slice(0, 2).map((tag: string, idx: number) => (
                <span key={idx} className="text-[7px] font-bold uppercase tracking-widest text-slate-400">
                  • {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden lg:block px-10 border-l border-slate-100">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{t("school")}</p>
             <p className="text-xs font-bold text-primary-darker uppercase tracking-tighter">{member.school?.name || "Corporate"}</p>
          </div>
        </Link>
        <Link href={`/about/staff/${member.profile_slug}`} className="p-4 rounded-2xl bg-slate-50 text-slate-300 group-hover:text-white group-hover:bg-primary transition-all">
          <ChevronRight size={20} />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05, duration: 0.5 }}
      className="group"
    >
      <Link href={`/about/staff/${member.profile_slug}`} className="block h-full bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={member.full_name} 
            className="standard-image grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
             <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                <span>{t("viewFullIdentity")}</span>
                <ChevronRight size={14} />
             </span>
          </div>
        </div>

        <div className="p-8 space-y-4">
           <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff7f50] mb-2">
                  {member.executive_type?.name || member.staff_type?.name || "Faculty Member"}
                </p>
                <h3 className="text-xl font-black text-primary-darker uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
                  {member.honorific_title && <span>{member.honorific_title} </span>}
                  {member.full_name}
                </h3>
              </div>
              {member.is_featured && <Sparkles size={16} className="text-amber-500" />}
           </div>
           
           <p className="text-[11px] font-medium text-slate-500 leading-tight line-clamp-2">
             {member.leadership_position || member.department?.name || "Open University of Kenya"}
           </p>

           <div className="flex flex-wrap gap-2 pt-2">
              {expertise.slice(0, 2).map((tag: string, idx: number) => (
                <span key={idx} className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                  {tag}
                </span>
              ))}
           </div>

           <div className="pt-6 mt-2 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-primary transition-colors" />
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary-darker transition-colors">
                   {member.school?.name || "OUK Governance"}
                 </p>
              </div>
              <ChevronRight size={16} className="text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
           </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default StaffDirectoryPage;
