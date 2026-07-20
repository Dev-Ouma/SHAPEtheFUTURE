"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Award, FileCheck, ExternalLink, Calendar, GraduationCap, Clock, ChevronRight, Library } from "lucide-react";

export default function StudentAcademicsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for Phase 2 initialization
    const mockCourses = [
      { id: "1", title: "Introduction to Data Science", code: "DS101", credits: 3, status: "ongoing", progress: 65, grade: "-" },
      { id: "2", title: "Algorithms & Data Structures", code: "CS102", credits: 4, status: "ongoing", progress: 40, grade: "-" },
      { id: "3", title: "Web Technologies", code: "CS201", credits: 3, status: "completed", progress: 100, grade: "A" },
      { id: "4", title: "Database Management Systems", code: "CS301", credits: 4, status: "completed", progress: 100, grade: "B+" },
    ];
    setCourses(mockCourses);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-12 pb-24">
      {/* Programme Hero */}
      <section className="bg-primary-darker p-12 text-white border-b-8 border-secondary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rotate-45" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="space-y-4">
              <div className="flex items-center space-x-3">
                 <span className="bg-secondary text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">Ongoing Programme</span>
                 <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Year 2, Semester 1</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-serif uppercase tracking-tight">Bachelor of Data Science</h2>
              <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <div className="flex items-center space-x-2">
                    <Clock size={14} className="text-secondary" />
                    <span>Completion: 45%</span>
                 </div>
                 <div className="flex items-center space-x-2">
                    <Award size={14} className="text-secondary" />
                    <span>GPA: 3.82</span>
                 </div>
              </div>
           </div>
           <button className="bg-white text-primary-darker px-8 py-4 font-black uppercase tracking-widest text-xs flex items-center space-x-3 hover:bg-secondary hover:text-white transition-all shadow-2xl">
              <span>Degree Audit</span>
              <FileCheck size={18} />
           </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Course Modules */}
        <div className="lg:col-span-2 space-y-8">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-darker border-b border-slate-100 pb-4">Current & Past Modules</h3>
           <div className="grid grid-cols-1 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white border border-slate-200 p-8 group hover:border-secondary transition-all">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                            <BookOpen size={20} />
                         </div>
                         <div>
                            <h4 className="font-black text-primary-darker uppercase tracking-widest text-sm">{course.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{course.code} • {course.credits} Credits</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Grade</p>
                         <p className={`text-xl font-black ${course.grade === '-' ? 'text-slate-300' : 'text-primary'}`}>{course.grade}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                         <span>Syllabus Coverage</span>
                         <span>{course.progress}%</span>
                      </div>
                      <div className="h-1 bg-slate-50 relative overflow-hidden">
                         <div 
                            className={`h-full transition-all duration-1000 ${course.status === 'completed' ? 'bg-green-500' : 'bg-secondary'}`}
                            style={{ width: `${course.progress}%` }}
                         />
                      </div>
                   </div>

                   {course.status === 'ongoing' && (
                     <div className="mt-8 flex justify-end">
                        <Link href={`/portal/academics/course/${course.id}`} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors">
                           <span>Access Materials</span>
                           <ChevronRight size={14} />
                        </Link>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>

        {/* Calendar & Deadlines */}
        <div className="space-y-8">
           <div className="bg-white border border-slate-200 p-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-secondary mb-8 border-b border-slate-50 pb-4">Upcoming Deadlines</h3>
              <div className="space-y-8">
                 {[
                   { title: "Data Visualization Assignment", date: "May 10", time: "23:59", type: "Assignment" },
                   { title: "Mid-Semester Examinations", date: "May 15", time: "All Day", type: "Exam" },
                   { title: "Algorithms Quiz 2", date: "May 18", time: "14:00", type: "Quiz" },
                 ].map((event, i) => (
                   <div key={i} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-darker text-white flex flex-col items-center justify-center shrink-0">
                         <span className="text-[10px] uppercase font-black">{event.date.split(' ')[0]}</span>
                         <span className="text-sm font-black">{event.date.split(' ')[1]}</span>
                      </div>
                      <div>
                         <p className="text-[8px] font-black uppercase tracking-widest text-secondary mb-1">{event.type}</p>
                         <p className="font-bold text-primary-darker text-xs uppercase leading-tight">{event.title}</p>
                         <p className="text-[10px] text-slate-400 font-bold mt-1">{event.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-primary p-10 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rotate-12" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center space-x-3">
                 <Library size={18} />
                 <span>E-Learning Portals</span>
              </h3>
              <ul className="space-y-4">
                 <li>
                    <Link href="https://moodle.ouk.ac.ke" target="_blank" className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest hover:text-secondary transition-colors group">
                       <span>Student Moodle Dashboard</span>
                       <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                 </li>
                 <li className="pt-4 border-t border-white/10">
                    <Link href="#" className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest hover:text-secondary transition-colors group">
                       <span>Institutional Repository</span>
                       <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
