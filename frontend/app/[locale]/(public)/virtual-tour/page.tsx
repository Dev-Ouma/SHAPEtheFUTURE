"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Play, Users, Building, 
  Globe, Cpu, Zap, Shield, 
  ArrowRight, Milestone, GraduationCap, X
} from "lucide-react";
import { getSettings, resolveImageUrl, getIntroVideos } from "@/lib/api";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export default function VirtualTourPage() {
  const t = useTranslations("VirtualTour");
  const locale = useLocale();
  const [settings, setSettings] = useState<any>({});
  const [introVideos, setIntroVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const { scrollYProgress } = useScroll();
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 1.1]);

  useEffect(() => {
    const fetchData = async () => {
      const [settingsData, videosData] = await Promise.all([
        getSettings(locale),
        getIntroVideos()
      ]);
      setSettings(settingsData);
      setIntroVideos(videosData?.data || []);
    };
    fetchData();
  }, [locale]);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="bg-slate-50 min-h-screen overflow-hidden">
      {/* 🚀 1. HERO IMMERSION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-primary-darker">
        <motion.div 
          style={{ opacity: headerOpacity, scale: headerScale }}
          className="absolute inset-0 z-0"
        >
          {settings.intro_video_type === "youtube" ? (
            <div className="w-full h-full relative">
               <iframe 
                  src={`https://www.youtube.com/embed/${getYoutubeId(settings.intro_video_url)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeId(settings.intro_video_url)}&controls=0&rel=0&modestbranding=1`}
                  className="w-full h-[120%] -top-[10%] absolute border-none pointer-events-none scale-110"
                  allow="autoplay"
                />
            </div>
          ) : (
            <video 
              src={resolveImageUrl(settings.intro_video_url || "/videos/intro.mp4")}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-darker/90 via-primary-darker/40 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-darker/60 via-primary-darker/80 to-primary-darker" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-secondary px-6 py-2 text-white text-[10px] font-black tracking-[0.4em] uppercase mb-8"
          >
            {t("eyebrow")}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter font-serif italic leading-none mb-8"
          >
            {settings.intro_title || t("fallbackTitle")}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed mb-12"
          >
            {settings.intro_description || t("fallbackDescription")}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
             <button 
                onClick={() => setSelectedVideo({ video_url: settings.intro_video_url, video_type: settings.intro_video_type, title: settings.intro_title })}
                className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all animate-pulse"
             >
                <Play size={24} />
             </button>
          </motion.div>
        </div>
      </section>

      {/* 🎬 2. VIDEO GALLERY SECTION */}
      {introVideos.length > 0 && (
        <section className="py-24 bg-white">
           <div className="container mx-auto px-6">
              <div className="flex justify-between items-end mb-16">
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">{t("cinemaRoom")}</span>
                    <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter">{t("cinematicOverviews")}</h2>
                 </div>
                 <p className="text-slate-400 text-sm font-medium max-w-xs text-right">
                    {t("cinemaBody")}
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {introVideos.map((video, idx) => (
                    <motion.div 
                       key={video.id}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: idx * 0.1 }}
                       className="group relative aspect-video bg-slate-900 overflow-hidden cursor-pointer shadow-xl"
                       onClick={() => setSelectedVideo(video)}
                    >
                       {video.thumbnail_url ? (
                          <Image src={resolveImageUrl(video.thumbnail_url)} fill className="object-cover group-hover:scale-110 transition-transform duration-700" alt={video.title} />
                       ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                             <Play size={40} className="text-white/40" />
                          </div>
                       )}
                       <div className="absolute inset-0 group-hover:bg-black/10 transition-all" />
                       <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-primary-darker/95 via-primary-darker/50 to-transparent">
                          <h4 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-2">{video.title}</h4>
                          <p className="text-[11px] text-slate-200 font-medium line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                             {video.description || t("videoFallbackDesc")}
                          </p>
                          <div className="flex items-center space-x-2 text-[10px] text-primary font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
                             <Play size={12} fill="currentColor" />
                             <span>{t("watchNow")}</span>
                          </div>
                       </div>
                       <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center scale-0 group-hover:scale-100 transition-transform">
                          <Play size={16} fill="white" />
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* 📊 3. THE INTEL LAYER (STATS) */}
      <section id="discovery" className="relative z-20 pb-32">
        <div className="container mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
              {[
                { label: t("statActiveScholars"), val: "12,000+", icon: Users, color: "bg-primary" },
                { label: t("statGlobalPartners"), val: "85+", icon: Globe, color: "bg-primary-darker" },
                { label: t("statResearchPatents"), val: "240+", icon: Zap, color: "bg-secondary" },
                { label: t("statVirtualUnits"), val: "450+", icon: Building, color: "bg-slate-900" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`${stat.color} p-12 text-white h-[350px] flex flex-col justify-between group overflow-hidden relative`}
                >
                  <stat.icon size={48} className="opacity-20 group-hover:scale-125 transition-transform duration-700" />
                  <div>
                    <h3 className="text-4xl font-black tracking-tighter mb-2">{stat.val}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{stat.label}</p>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 🏙️ 4. DIGITAL CAMPUS - BENTO GRID */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                 <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="relative aspect-video bg-slate-100 overflow-hidden shadow-2xl"
                 >
                    <Image src="/hero-campus.png" fill className="object-cover" alt={t("altMainCampus")} />
                    <div className="absolute inset-0 bg-primary/20 hover:bg-transparent transition-all duration-700" />
                    <div className="absolute bottom-10 left-10 text-white z-10">
                       <span className="text-[10px] font-black uppercase tracking-widest bg-secondary px-4 py-1 mb-4 inline-block">{t("theHub")}</span>
                       <h3 className="text-3xl font-black uppercase tracking-tighter">{t("techNerveCenter")}</h3>
                    </div>
                 </motion.div>
              </div>
              <div className="lg:col-span-4 space-y-8">
                 <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-primary p-12 text-white h-full flex flex-col justify-center"
                 >
                    <Cpu size={40} className="mb-8" />
                    <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-secondary">{t("cyberPhysical")}</h4>
                    <p className="text-slate-300 leading-relaxed font-medium text-sm">
                       {t("cyberPhysicalBody")}
                    </p>
                 </motion.div>
              </div>
              
              <div className="lg:col-span-4">
                 <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 p-12 text-white h-full"
                 >
                    <Shield size={40} className="mb-8 text-secondary" />
                    <h4 className="text-xl font-black uppercase tracking-tight mb-4">{t("secureCredentials")}</h4>
                    <p className="text-slate-400 leading-relaxed font-medium text-sm">
                       {t("secureCredentialsBody")}
                    </p>
                 </motion.div>
              </div>
              <div className="lg:col-span-8">
                 <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="relative aspect-[21/9] bg-slate-100 overflow-hidden shadow-2xl"
                 >
                    <Image src="/innovation.png" fill className="object-cover" alt={t("altInnovationHub")} />
                    <div className="absolute inset-0 bg-primary-darker/30" />
                    <div className="absolute top-10 right-10 text-right">
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{t("innovationDistillery")}</h3>
                    </div>
                 </motion.div>
              </div>
           </div>
        </div>
      </section>

      {/* 🎓 5. SCHOLAR JOURNEY - VERTICAL STEPS */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6">
           <div className="flex flex-col items-center text-center mb-24">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">{t("pipeline")}</span>
              <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter">{t("scholarlyPath")}</h2>
           </div>
           
           <div className="max-w-4xl mx-auto space-y-12 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-200 -translate-x-1/2 hidden md:block" />
              
              {[
                { title: t("stepOnboarding"), icon: Cpu, time: t("step01"), desc: t("stepOnboardingDesc") },
                { title: t("stepLearning"), icon: GraduationCap, time: t("step02"), desc: t("stepLearningDesc") },
                { title: t("stepCollaboration"), icon: Globe, time: t("step03"), desc: t("stepCollaborationDesc") },
                { title: t("stepCareer"), icon: Milestone, time: t("step04"), desc: t("stepCareerDesc") },
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                   <div className="flex-1 text-center md:text-left">
                      <div className={`flex flex-col ${i % 2 === 1 ? 'md:items-end md:text-right' : 'md:items-start'}`}>
                         <span className="text-secondary font-black text-[10px] uppercase tracking-widest mb-2">{step.time}</span>
                         <h4 className="text-xl font-black text-primary-darker uppercase tracking-tight mb-4">{step.title}</h4>
                         <p className="text-slate-500 font-medium leading-relaxed max-w-sm text-sm">{step.desc}</p>
                      </div>
                   </div>
                   
                   <div className="w-16 h-16 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center relative z-10 shrink-0">
                      <step.icon size={24} className="text-primary" />
                   </div>
                   
                   <div className="flex-1" />
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* 🏁 6. CALL TO ACTION - IMMERSIVE FINALE */}
      <section className="relative h-[80vh] flex items-center justify-center bg-secondary overflow-hidden">
         <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)]" 
         />
         
         <div className="container mx-auto px-6 relative z-10 text-center text-white">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic font-serif leading-none mb-12">
               {t("readyTo")} <br/> <span className="text-primary-darker">{t("transcend")}</span>
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
               <Link href="/admissions" className="btn-primary bg-primary-darker px-12 py-6 text-[10px] font-black uppercase tracking-widest flex items-center space-x-4 shadow-2xl hover:scale-105 transition-all">
                  <span>{t("startApplication")}</span>
                  <ArrowRight size={20} />
               </Link>
               <Link href="/programmes" className="px-12 py-6 text-[10px] font-black uppercase tracking-widest border-2 border-white/20 hover:bg-white hover:text-secondary transition-all">
                  {t("browseCatalog")}
               </Link>
            </div>
         </div>
      </section>

      {/* CLEAN PLAYER MODAL */}
      <AnimatePresence>
         {selectedVideo && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-20"
            >
               <button 
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all"
               >
                  <X size={24} />
               </button>

               <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-6xl aspect-video bg-black shadow-2xl overflow-hidden relative border border-white/10"
               >
                  {selectedVideo.video_type === 'youtube' ? (
                     <iframe 
                        src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo.video_url)}?autoplay=1&controls=1&rel=0`}
                        className="w-full h-full border-none"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                     />
                  ) : (
                     <video 
                        src={resolveImageUrl(selectedVideo.video_url)}
                        autoPlay
                        controls
                        className="w-full h-full"
                     />
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black to-transparent pointer-events-none">
                     <h3 className="text-2xl font-black text-white uppercase tracking-tight">{selectedVideo.title}</h3>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
