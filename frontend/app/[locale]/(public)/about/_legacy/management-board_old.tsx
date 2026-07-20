"use client";

import React from "react";
import PageLayout from "@/components/PageLayout";
import PersonnelGrid from "@/components/sections/PersonnelGrid";
import { 
  Briefcase, 
  Workflow, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  Cpu
} from "lucide-react";
import Link from "next/link";

export default function ManagementBoardPage() {
  const breadcrumbs = [
    { title: "About", link: "/about" },
    { title: "University Management Board", link: "/about/management-board" }
  ];

  return (
    <PageLayout
      title="Board Leadership"
      summary="The University Management Board translates institutional strategy into operational reality, ensuring seamless digital services."
      breadcrumbs={breadcrumbs}
      bannerImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"
      isWide={true}
    >
      <div className="space-y-24">
        {/* Main Personnel Section */}
        <section>
          <PersonnelGrid executiveType="University Management Board" title="Management Board Members" />
        </section>

        {/* Operational Excellence Section */}
        <section className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24 py-32 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none text-secondary">
              <Cpu size={500} />
           </div>
           
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
              <div className="space-y-8">
                 <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Operational Leadership</span>
                 <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter font-serif leading-[0.9]">
                    Execution <br/> <span className="text-secondary italic lowercase">at the</span> <br/> Speed of Tech.
                 </h2>
                 <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
                    The Management Board translates institutional strategy into operational reality, ensuring seamless digital services and academic excellence for every student.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { title: "Academic Admin", desc: "Overseeing the registration, examinations, and student lifecycle management." },
                   { title: "Digital Infrastructure", desc: "Maintaining the virtual campus and learning management systems." },
                   { title: "Quality Assurance", desc: "Setting pedagogical standards for online and distance learning delivery." },
                   { title: "Global Partnerships", desc: "Managing collaborations with industry and international academic bodies." }
                 ].map((item, i) => (
                   <div key={i} className="bg-white/5 border border-white/10 p-8 space-y-4 hover:bg-white/10 transition-colors">
                      <div className="w-8 h-px bg-secondary" />
                      <h4 className="font-black uppercase tracking-tight text-white">{item.title}</h4>
                      <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Core Functions Section (Reused pattern) */}
        <section className="py-20">
           <div className="mb-20">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-4">The OUK Workflow</span>
              <h2 className="text-5xl font-black uppercase tracking-tighter text-primary-darker font-serif">University Ecosystem</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { 
                  title: "Digital Portal", 
                  desc: "Access the OUK Student Portal for registration and financial records.",
                  icon: <Cpu className="text-secondary" size={32} />,
                  link: "/portal"
                },
                { 
                  title: "Virtual Campus", 
                  desc: "Enter our world-class learning management system to start your studies.",
                  icon: <Workflow className="text-primary" size={32} />,
                  link: "https://lms.ouk.ac.ke"
                },
                { 
                  title: "Institutional Services", 
                  desc: "Learn about the administrative support available to students and staff.",
                  icon: <Briefcase className="text-slate-400" size={32} />,
                  link: "/about"
                }
              ].map((func, i) => (
                <Link key={i} href={func.link} className="group py-12 px-10 bg-slate-50 border border-slate-100 space-y-8 hover:bg-white hover:shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-2 transition-all duration-500 rounded-sm">
                   <div className="w-16 h-16 bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      {func.icon}
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-primary-darker">{func.title}</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{func.desc}</p>
                   </div>
                   <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-secondary transition-colors">
                      <span>Learn More</span>
                      <ChevronRight size={14} />
                   </div>
                </Link>
              ))}
           </div>
        </section>
      </div>
    </PageLayout>
  );
}
