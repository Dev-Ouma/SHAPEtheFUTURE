"use client";

import React from "react";
import PageLayout from "@/components/PageLayout";
import PersonnelGrid from "@/components/sections/PersonnelGrid";
import { 
  BookOpen, 
  Globe, 
  Zap, 
  ArrowRight, 
  ChevronRight,
  ShieldCheck,
  Compass
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function GoverningCouncilPage() {
  const breadcrumbs = [
    { title: "About", link: "/about" },
    { title: "Governing Council", link: "/about/governing-council" }
  ];

  return (
    <PageLayout
      title="Governance"
      summary="The University is governed through a double-layer of oversight: the Governing Council for strategy and the Management Board for operations."
      breadcrumbs={breadcrumbs}
      bannerImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2601&auto=format&fit=crop"
      isWide={true}
    >
      <div className="space-y-24">
        {/* Main Personnel Section */}
        <section>
          <PersonnelGrid executiveType="Governing Council" title="Governing Council Members" />
        </section>

        {/* Narrative Context Section */}
        <section className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24 py-32 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
              <ShieldCheck size={500} />
           </div>
           
           <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
              <div className="space-y-8">
                 <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Stewardship & Governance</span>
                 <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter font-serif leading-[0.9]">
                    Architects <br/> <span className="text-primary italic lowercase">of</span> <br/> Digital Future.
                 </h2>
                 <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
                    The Council ensures that the University remains true to its mission of democratising access to high-quality higher education through digital innovation and institutional transparency.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { title: "Strategic Oversight", desc: "Approving and monitoring the implementation of the University's Strategic Plan." },
                   { title: "Legal Compliance", desc: "Ensuring institutional compliance with the Universities Act and other regulatory frameworks." },
                   { title: "Fiscal Stewardship", desc: "Overseeing the financial health and resource mobilisation of the University." },
                   { title: "HR Governance", desc: "Appointing senior management and ensuring effective human resource policies." }
                 ].map((item, i) => (
                   <div key={i} className="bg-white/5 border border-white/10 p-8 space-y-4 hover:bg-white/10 transition-colors">
                      <div className="w-8 h-px bg-primary" />
                      <h4 className="font-black uppercase tracking-tight text-white">{item.title}</h4>
                      <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* University Ecosystem (Core Functions) */}
        <section className="py-20">
           <div className="mb-20">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-4">The OUK Network</span>
              <h2 className="text-5xl font-black uppercase tracking-tighter text-primary-darker font-serif">Core Functions</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { 
                  title: "Academic Horizons", 
                  desc: "Explore our diverse range of market-aligned degree and short course programmes.",
                  icon: <BookOpen className="text-primary" size={32} />,
                  link: "/academics"
                },
                { 
                  title: "Research & Innovation", 
                  desc: "Driving global impact through cutting-edge inquiry and digital technology development.",
                  icon: <Zap className="text-secondary" size={32} />,
                  link: "/research"
                },
                { 
                  title: "Global Impact", 
                  desc: "Connecting learners across 47 counties and beyond through our virtual campus.",
                  icon: <Globe className="text-slate-400" size={32} />,
                  link: "/admissions"
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
                   <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                      <span>Learn More</span>
                      <ChevronRight size={14} />
                   </div>
                </Link>
              ))}
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-primary flex flex-col items-center text-center space-y-10 rounded-sm">
           <Compass className="text-white opacity-20" size={80} strokeWidth={1} />
           <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter max-w-2xl px-6">
              Ready <span className="italic lowercase">to</span> Join the <br/> Future <span className="italic lowercase">of</span> Education?
           </h2>
           <Link href="/admissions" className="bg-primary text-white px-12 py-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-[#ff7f50] hover:text-white transition-all shadow-2xl">
              Apply for Admission
           </Link>
        </section>
      </div>
    </PageLayout>
  );
}
