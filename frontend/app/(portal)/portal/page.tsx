"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  BookOpen, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles
} from "lucide-react";

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    gpa: "3.82",
    credits: "45/120",
    balance: "KES 30,000",
    nextDeadline: "May 10",
  });

  const activeClasses = [
    { title: "Introduction to Data Science", time: "Mon 10:00 AM", location: "Online (Moodle)", code: "DS101" },
    { title: "Algorithms & Data Structures", time: "Wed 02:00 PM", location: "Live Session", code: "CS102" },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <section className="bg-primary-darker p-12 text-white border-b-8 border-secondary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rotate-45" />
        <div className="relative z-10">
          <p className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-4">Academic Year 2024/2025</p>
          <h2 className="text-4xl md:text-6xl font-black mb-6 font-serif ">Good morning, Student.</h2>
          <div className="flex flex-wrap gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Status: Active</span>
             </div>
             <div className="flex items-center space-x-2 border-l border-white/10 pl-6">
                <span>Programme: Bachelor of Data Science</span>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { name: "Current GPA", value: stats.gpa, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
          { name: "Credits Earned", value: stats.credits, icon: BookOpen, color: "text-secondary", bg: "bg-secondary/5" },
          { name: "Outstanding Fees", value: stats.balance, icon: CreditCard, color: "text-red-600", bg: "bg-red-50" },
          { name: "Next Deadline", value: stats.nextDeadline, icon: Clock, color: "text-primary", bg: "bg-primary/5" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border border-slate-200 group hover:border-[#ff7f50] transition-all">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
               <stat.icon size={24} />
            </div>
            <p className="text-3xl font-black text-primary-darker tracking-tighter mb-1">{stat.value}</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{stat.name}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Course Schedule */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-darker">Today's Schedule</h3>
              <Link href="/portal/academics" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center hover:underline">
                Fall Timetable <ArrowUpRight size={14} className="ml-1" />
              </Link>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              {activeClasses.map((cls, i) => (
                <div key={i} className="bg-white border border-slate-200 p-8 flex items-center justify-between group hover:border-secondary transition-all">
                   <div className="flex items-center space-x-6">
                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-50 border border-slate-100 group-hover:bg-secondary group-hover:text-white transition-colors">
                         <span className="text-[10px] font-black uppercase">{cls.time.split(' ')[0]}</span>
                         <span className="text-xs font-black">{cls.time.split(' ')[1]}</span>
                      </div>
                      <div>
                         <h4 className="font-black text-primary-darker uppercase tracking-widest text-sm mb-1">{cls.title}</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                            <span className="text-primary mr-2">{cls.code}</span>
                            <span>• {cls.location}</span>
                         </p>
                      </div>
                   </div>
                   <button className="bg-primary-darker text-white p-4 font-black uppercase tracking-widest text-[9px] hover:bg-[#ff7f50] hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      Join Session
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* Notifications & Action Centre */}
        <div className="space-y-8">
           <div className="bg-white border border-slate-200 p-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-darker mb-8 border-b border-slate-50 pb-4">Campus Alerts</h3>
              <div className="space-y-8">
                 <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                       <AlertCircle size={20} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">Financial Notice</p>
                       <p className="text-xs font-bold text-primary-darker uppercase leading-tight">Exam registration closes in 48 hours for students with balances.</p>
                       <Link href="/portal/finance" className="text-[9px] font-black uppercase tracking-widest text-primary underline mt-2 block">Clear Balance</Link>
                    </div>
                 </div>
                 <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                       <CheckCircle2 size={20} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-green-500 mb-1">Academic Status</p>
                       <p className="text-xs font-bold text-primary-darker uppercase leading-tight">Your semester 1 marks have been officially uploaded.</p>
                       <Link href="/portal/academics" className="text-[9px] font-black uppercase tracking-widest text-primary underline mt-2 block">View Grades</Link>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-secondary p-10 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rotate-12 transition-transform group-hover:scale-150" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center space-x-3">
                 <Calendar size={18} />
                 <span>Upcoming Deadlines</span>
              </h3>
              <div className="space-y-6">
                 <div className="border-l-4 border-white/20 pl-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">May 10</p>
                    <p className="text-xs font-black uppercase">Data Science Assignment 1</p>
                 </div>
                 <div className="border-l-4 border-white/20 pl-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">May 15</p>
                    <p className="text-xs font-black uppercase">End of Semester Exams</p>
                 </div>
              </div>
           </div>

           {/* AI Success Predictor */}
           <div className="bg-white border-8 border-slate-900 p-10 space-y-8 shadow-[15px_15px_0px_#037b90]">
              <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 bg-primary flex items-center justify-center text-white">
                    <Sparkles size={18} />
                 </div>
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary-darker">Success Analytics</h3>
              </div>

              <div className="flex flex-col items-center justify-center py-6 space-y-6">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full rotate-[-90deg]">
                       <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                       <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * 0.12} className="text-primary" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black text-primary-darker">88%</span>
                       <span className="text-[8px] font-black uppercase text-slate-400">Score</span>
                    </div>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-darker mb-1">High Probability</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Based on VLE Activity</p>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                 <button className="w-full py-4 bg-primary-darker text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-colors">
                    View Full Success Map
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
