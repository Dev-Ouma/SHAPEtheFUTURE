"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  CreditCard, 
  Globe, 
  BookOpen, 
  CheckCircle2, 
  Users, 
  Layers,
  Award,
  ArrowRight,
  Share2,
  Printer,
  ChevronRight,
  Mail
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { resolveImageUrl } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import SafeImage from "@/components/ui/SafeImage";
import { useTranslations } from "next-intl";

interface ShortCourse {
  id: string;
  title: string;
  title_sw?: string;
  code: string;
  slug: string;
  about: string;
  about_sw?: string;
  overview: string;
  overview_sw?: string;
  duration: string;
  cost: string;
  image_url?: string;
  mode_of_delivery: string;
  level: string;
  skills_gained?: string;
  skills_gained_sw?: string;
  target_audience?: string;
  target_audience_sw?: string;
  learning_method?: {
    name: string;
    name_sw?: string;
  };
  school?: {
    name: string;
    name_sw?: string;
    slug: string;
  };
  department?: {
    name: string;
    name_sw?: string;
  };
  modules?: Array<{
    id: string;
    title: string;
    description?: string;
    order: number;
  }>;
}

export default function ShortCourseDetailClient({ 
  course,
  relatedCourses = [],
  relatedProgrammes = []
}: { 
  course: ShortCourse;
  relatedCourses?: ShortCourse[];
  relatedProgrammes?: any[];
}) {
  const t = useTranslations("ShortCourses");

  return (
    <React.Fragment>
      <div className="space-y-16">
        {/* Academic Breadcrumbs */}
        <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Link href="/" className="hover:text-primary transition-colors">{t("home")}</Link>
          <ChevronRight size={12} />
          <span className="text-primary-darker">{t("academics")}</span>
          <ChevronRight size={12} />
          <Link href="/academics/professional-development-courses" className="hover:text-primary transition-colors">
            {t("catalogTitle")}
          </Link>
          <ChevronRight size={12} />
          <span className="text-primary">{course.title}</span>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-20">
          {/* Overview & About */}
          <section className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-xl font-black text-primary-darker border-l-8 border-primary pl-6 tracking-tight uppercase">
                {t("courseNarrative")}
              </h2>
              <p className="text-2xl font-serif text-primary-darker leading-relaxed italic">
                {course.overview}
              </p>
            </div>
            
            <div className="prose prose-xl prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(course.about || "") }} />
            </div>
          </section>

          {/* Skills & Outcomes */}
          {course.skills_gained && (
            <section className="bg-primary-darker p-12 lg:p-16 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 -mr-32 -mt-32 rounded-full blur-3xl transition-all group-hover:bg-[#ff7f50] hover:text-white" />
               <div className="relative z-10 space-y-10">
                  <div className="flex items-center space-x-4">
                     <Award className="text-primary" size={28} />
                     <h3 className="text-xl font-black uppercase tracking-widest">{t("skillsAcquired")}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {course.skills_gained.split(',').map((skill, idx) => (
                       <div key={idx} className="flex items-start space-x-4 p-4 border border-white/10 bg-white/5">
                          <CheckCircle2 className="text-primary shrink-0" size={18} />
                          <span className="font-bold text-sm tracking-tight">{skill.trim()}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </section>
          )}

          {/* Structure & Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             {/* Target Audience */}
             <div className="space-y-8 p-10 bg-slate-50 border-t-4 border-slate-200">
                <div className="flex items-center space-x-4">
                   <Users className="text-primary" size={24} />
                   <h4 className="font-black uppercase tracking-widest text-xs">{t("targetAudience")}</h4>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {course.target_audience}
                </p>
             </div>

             {/* Course Structure - High Fidelity Timeline */}
             <div className="col-span-1 md:col-span-2 space-y-12">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                   <div className="flex items-center space-x-4">
                      <Layers className="text-primary" size={24} />
                      <h4 className="font-black uppercase tracking-widest text-xs">{t("curriculumStructure")}</h4>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                     {t("learningUnits", { count: course.modules?.length || 0 })}
                   </span>
                </div>

                 <div className="space-y-12 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-1 before:bg-slate-100">
                   {course.modules?.map((mod, idx) => (
                     <div key={mod.id} className="relative pl-16 group">
                        <div className="absolute left-0 top-0 w-12 h-12 bg-white border-4 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:border-[#ff7f50] group-hover:text-primary transition-all shadow-sm">
                           {idx + 1}
                        </div>
                        <div className="space-y-4">
                           <h5 className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                             {mod.title}
                           </h5>
                           <div className="text-slate-500 font-medium leading-relaxed prose prose-slate max-w-none">
                              {mod.description}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Learning Method Explanation */}
          <section className="p-12 border-2 border-slate-50">
             <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-primary">{t("deliveryMechanism")}</h3>
             <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="w-16 h-16 bg-primary-darker flex items-center justify-center text-primary shrink-0">
                   <Globe size={32} />
                </div>
                <div className="space-y-4">
                   <p className="text-xl font-black uppercase tracking-tighter">
                     {course.learning_method?.name}
                   </p>
                   <p className="text-slate-500 font-medium leading-relaxed">
                     {t("deliveryBody", {
                       mode: (course.mode_of_delivery || "").toLowerCase(),
                       method: (course.learning_method?.name || "").toLowerCase(),
                     })}
                   </p>
                </div>
             </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
           <div className="sticky top-32 space-y-10">
              {/* Enrollment CTA */}
              <div className="bg-primary p-12 text-white space-y-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full" />
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary">{t("certAdmission")}</p>
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{t("applyEnrollment")}</h3>
                 </div>
                 <p className="text-primary-foreground/70 font-medium text-sm leading-relaxed">
                   {t("applyBody")}
                 </p>
                 <button className="w-full bg-white text-primary py-5 font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 hover:bg-secondary hover:text-white transition-all shadow-xl">
                    <span>{t("enrollNow")}</span>
                    <ArrowRight size={18} />
                 </button>
              </div>

              {/* Share & Tools */}
              <div className="p-8 bg-slate-50 border border-slate-100 flex items-center justify-between">
                 <div className="flex items-center space-x-6">
                    <button className="text-slate-400 hover:text-primary transition-colors"><Share2 size={18} /></button>
                    <button className="text-slate-400 hover:text-primary transition-colors"><Printer size={18} /></button>
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{t("institutionalTools")}</span>
              </div>

              {/* Faculty Info */}
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("hostInstitution")}</h4>
                 <div className="p-8 border-2 border-slate-100 space-y-4">
                    <div className="space-y-1">
                       <p className="font-black text-primary-darker uppercase text-sm tracking-tight">
                         {course.school?.name}
                       </p>
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                         {course.department?.name}
                       </p>
                    </div>
                    <Link href={`/programmes?school=${course.school?.slug}`}>
                       <p className="text-xs font-bold text-slate-400 flex items-center space-x-2 hover:text-primary transition-colors cursor-pointer">
                          <span>{t("browseFaculty")}</span>
                          <ArrowRight size={12} />
                       </p>
                    </Link>
                 </div>
              </div>
           </div>
       </div>
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
         <section className="space-y-12">
            <div className="flex items-end justify-between border-b-2 border-slate-100 pb-8">
               <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">{t("discoveryAffirmation")}</h3>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">{t("alsoInterested")}</h2>
               </div>
               <Link href="/academics/professional-development-courses">
                  <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center space-x-2">
                     <span>{t("viewAllCerts")}</span>
                     <ArrowRight size={14} />
                  </button>
               </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {relatedCourses.map(rel => (
                 <Link key={rel.id} href={`/academics/professional-development-courses/${rel.slug}`}>
                    <div className="group space-y-6 cursor-pointer">
                       <div className="aspect-video bg-primary-darker relative overflow-hidden shadow-lg border-b-4 border-transparent group-hover:border-[#ff7f50] transition-all">
                          <SafeImage
                            src={resolveImageUrl(rel.image_url) || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop`}
                            className="object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                            alt={rel.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                       </div>
                       <div className="space-y-2">
                          <h4 className="font-black uppercase tracking-tight group-hover:text-primary transition-colors text-sm">{rel.title}</h4>
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{rel.duration}</span>
                             <span className="text-[9px] font-black uppercase tracking-widest text-primary">{rel.cost}</span>
                          </div>
                       </div>
                    </div>
                 </Link>
               ))}
            </div>
         </section>
      )}

      {/* Related Academic Programmes (Academic Affirmation) */}
      {relatedProgrammes.length > 0 && (
         <section className="bg-primary-darker p-12 lg:p-20 text-white space-y-16 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 -mr-96 -mb-96 rounded-full blur-[100px] transition-all group-hover:bg-[#ff7f50] hover:text-white" />
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
               <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">{t("pathwayAffirmation")}</h3>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">{t("bridgeDegree")}</h2>
               </div>
               <Link href="/programmes">
                  <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all flex items-center space-x-3">
                     <span>{t("exploreCatalog")}</span>
                     <ArrowRight size={16} />
                  </button>
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
               {relatedProgrammes.map(prog => (
                 <Link key={prog.id} href={`/programmes/${prog.id}`}>
                    <div className="group bg-white/5 border border-white/10 p-8 space-y-8 hover:bg-white/10 transition-all cursor-pointer">
                       <div className="aspect-[4/3] bg-slate-800 overflow-hidden relative">
                          <SafeImage
                            src={resolveImageUrl(prog.programme_image) || `https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop`}
                            className="object-cover opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                            alt={prog.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <span className="text-[9px] font-black uppercase tracking-widest text-primary">{prog.programme_code || t("degreeUnit")}</span>
                             <h4 className="text-xl font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{prog.title}</h4>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                             <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                                <Clock size={12} />
                                <span>{prog.duration || "4 Years"}</span>
                             </div>
                             <ArrowRight size={16} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                       </div>
                    </div>
                 </Link>
               ))}
            </div>
         </section>
      )}

      {/* Lead Generation footer */}
      <section className="bg-slate-50 p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12">
         <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tighter">{t("stillQuestions")}</h2>
            <p className="text-slate-500 font-medium">{t("advisorsReady")}</p>
         </div>
         <div className="flex items-center gap-6">
            <button className="px-8 py-4 bg-white border-2 border-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all flex items-center space-x-3">
               <Mail size={16} />
               <span>{t("talkAdvisor")}</span>
            </button>
            <button className="px-8 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all flex items-center space-x-3 shadow-xl">
               <span>{t("downloadBrochure")}</span>
               <ArrowRight size={16} />
            </button>
         </div>
      </section>
    </div>
    </React.Fragment>
  );
}
