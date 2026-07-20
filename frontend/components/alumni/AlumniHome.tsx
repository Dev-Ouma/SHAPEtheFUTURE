"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { 
  Users, 
  Handshake, 
  Briefcase, 
  Calendar, 
  ChevronRight, 
  ArrowRight,
  Search,
  Award,
  Globe,
  Quote,
  HelpCircle,
  Mail,
  Linkedin,
  Clock,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { API_URL, getSettings, postApi, resolveImageUrl } from "@/lib/api";
import { toast } from "react-hot-toast";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale, useTranslations } from "next-intl";

export default function AlumniHome() {
  const t = useTranslations("Alumni");
  const locale = useLocale();
  const [stats, setStats] = useState<any>(null);
  const [featuredAlumni, setFeaturedAlumni] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!subscribeEmail) return;
    setIsSubscribing(true);
    try {
      await postApi('/subscriptions/subscribe', { email: subscribeEmail });
      toast.success(t("subscribeSuccess"));
      setSubscribeEmail("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("subscribeFail"));
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, featuredRes, eventsRes, storiesRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/alumni/stats`).then((r) => r.json()),
          fetch(`${API_URL}/alumni/profiles/featured`).then((r) => r.json()),
          fetch(
            `${API_URL}/alumni/events?locale=${encodeURIComponent(locale)}`,
          ).then((r) => r.json()),
          fetch(`${API_URL}/alumni/stories`).then((r) => r.json()),
          getSettings(locale),
        ]);
        setStats(statsRes);
        setFeaturedAlumni(Array.isArray(featuredRes) ? featuredRes : []);
        setUpcomingEvents(Array.isArray(eventsRes) ? eventsRes : []);
        setStories(Array.isArray(storiesRes) ? storiesRes : []);
        setSettings(
          settingsRes && typeof settingsRes === "object" ? settingsRes : {},
        );
      } catch (error) {
        console.error("Failed to fetch alumni data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locale]);

  const quickActions = [
    { title: t("qaFindAlumni"), icon: Search, href: "/alumni/community/directory", color: "#1e234a" },
    { title: t("qaExploreCareers"), icon: Briefcase, href: "/alumni/opportunities/jobs", color: "#0f3a3d" },
    { title: t("qaBecomeMentor"), icon: Handshake, href: "/alumni/community/mentorship", color: "#4a1e1e" },
    { title: t("qaRegisterEvent"), icon: Calendar, href: "/alumni/connect/events", color: "#d2a021" },
    { title: t("qaDonate"), icon: Heart, href: "/alumni/connect/donate", color: "#7c1d1d" },
  ];

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
  ];

  return (
    <div className="space-y-0">
      {/* 🟦 HERO SECTION */}
      <section className="bg-primary-darker py-32 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05]" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end md:gap-8 gap-6">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-serif leading-[0.85] italic shrink-0 order-last md:order-first">
                   {t("heroTitle")} <br/> <span className="text-secondary not-italic">{t("heroTitleAccent")}</span>
                </h1>
                <div className="inline-flex items-center space-x-3 text-secondary order-first md:order-last md:pb-2">
                  <div className="w-12 h-px bg-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t("heroEyebrow")}</span>
                </div>
              </div>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg border-l-4 border-slate-800 pl-8">
                 {t("heroBody")}
              </p>
              <div className="flex flex-wrap gap-6">
                <Link href="/alumni/join" className="px-10 py-5 bg-secondary text-white font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-2xl">
                   {t("joinNetwork")}
                </Link>
                <Link href="/alumni/opportunities" className="px-10 py-5 border-2 border-white/10 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-primary-darker transition-all">
                   {t("exploreOpportunities")}
                </Link>
              </div>
            </div>
            <div className="relative group aspect-[4/3]">
               <div className="absolute -inset-4 bg-secondary/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
               <SafeImage
                 src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1920"
                 className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 border border-white/10 relative z-10 object-cover"
                 alt="Alumni"
                 fill
                 priority
                 sizes="(max-width: 1024px) 100vw, 50vw"
               />
            </div>
          </div>
        </div>
      </section>

      {/* ⚡ QUICK ACTIONS */}
      <section className="-mt-16 relative z-30 mb-24">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
               {quickActions.map((action, i) => (
                 <Link 
                   key={i} 
                   href={action.href}
                   className="p-8 bg-white border border-slate-100 shadow-xl hover:-translate-y-2 transition-all group flex flex-col items-center text-center space-y-6"
                 >
                    <div className="p-4 bg-slate-50 text-slate-400 group-hover:text-white transition-all rounded-full" style={{"--hover-bg": action.color} as any}>
                       <style jsx>{`div:hover { background-color: var(--hover-bg) !important; }`}</style>
                       <action.icon size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-darker">{action.title}</span>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      {/* 📘 ABOUT SECTION */}
      <section className="py-24 bg-white overflow-hidden">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-24 items-center">
               <div className="lg:w-1/2 space-y-12">
                  <div className="space-y-6">
                     <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("aboutEyebrow")}</h2>
                     <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary-darker leading-none">{t("aboutTitle")} <br/> {t("aboutTitleAccent")}</h3>
                  </div>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed">
                     {t("aboutBody")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                     <div className="space-y-4">
                        <Award size={32} className="text-secondary" />
                        <h4 className="text-lg font-black uppercase tracking-tight text-primary-darker">{t("globalCommunity")}</h4>
                        <p className="text-sm text-slate-400 font-medium">{t("globalCommunityBody")}</p>
                     </div>
                     <div className="space-y-4">
                        <Handshake size={32} className="text-secondary" />
                        <h4 className="text-lg font-black uppercase tracking-tight text-primary-darker">{t("giveBackTitle")}</h4>
                        <p className="text-sm text-slate-400 font-medium">{t("giveBackBody")}</p>
                     </div>
                  </div>
               </div>
               <div className="lg:w-1/2 relative aspect-[4/3]">
                  <div className="absolute top-0 right-0 p-32 bg-slate-50 -mr-20 -mt-20 rounded-full blur-3xl opacity-50" />
                  <SafeImage
                    src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1920"
                    className="rounded-3xl shadow-2xl relative z-10 grayscale object-cover"
                    alt={t("communityAlt")}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
               </div>
            </div>
         </div>
      </section>

      {/* 📊 COMMUNITY STATISTICS */}
      <section className="py-24 bg-primary-darker text-white overflow-hidden relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 text-left">
               {[
                 { label: t("statRegistered"), value: stats?.alumniRegistered || "12,000+", icon: Users },
                 { label: t("statCountries"), value: stats?.countriesRepresented || "35+", icon: Globe },
                 { label: t("statMentors"), value: stats?.activeMentors || "250+", icon: Handshake },
                 { label: t("statEvents"), value: stats?.eventsHosted || "120+", icon: Calendar },
               ].map((stat, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="space-y-4"
                 >
                    <div className="flex justify-start text-secondary">
                       <stat.icon size={32} />
                    </div>
                    <div className="text-4xl md:text-5xl font-black font-serif italic text-white">{stat.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 🌟 FEATURED ALUMNI */}
      <section className="py-32 bg-slate-50 overflow-hidden">
         <div className="container mx-auto px-6 max-w-7xl space-y-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
               <div className="space-y-6">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("featuredEyebrow")}</h2>
                  <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary-darker leading-none italic">
                     {t("featuredTitle")} <span className="text-secondary not-italic">{t("featuredTitleAccent")}</span>
                  </h3>
               </div>
               <Link href="/alumni/community/directory" className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center space-x-3 group border-b-2 border-primary pb-2">
                  <span>{t("viewDirectory")}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {featuredAlumni.map((alum, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -10 }}
                   className="bg-white border border-slate-100 shadow-xl overflow-hidden group"
                 >
                    <div className="aspect-square relative overflow-hidden">
                       <SafeImage
                         src={resolveImageUrl(alum.image_url)}
                         alt={alum.name}
                         fill
                         sizes="(max-width: 768px) 100vw, 33vw"
                         className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                       />
                       <div className="absolute bottom-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={alum.linkedIn} target="_blank" className="p-3 bg-primary text-white rounded-full hover:bg-secondary transition-all">
                             <Linkedin size={16} />
                          </Link>
                       </div>
                    </div>
                    <div className="p-10 space-y-6">
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">{alum.programme} • {alum.graduationYear}</p>
                          <h4 className="text-2xl font-black uppercase tracking-tight text-primary-darker">{alum.name}</h4>
                          <p className="text-xs font-bold text-slate-400 italic">{alum.employer}</p>
                       </div>
                       <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed border-l-2 border-slate-100 pl-4">
                          {alum.bio}
                       </p>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 🤝 MENTORSHIP & NETWORKING */}
      <section className="py-32 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="bg-primary-darker text-white overflow-hidden shadow-2xl flex flex-col lg:flex-row">
               <div className="lg:w-1/3 p-16 space-y-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-secondary">
                  <Handshake size={64} className="text-white" />
                  <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">{t("mentorTitle")}</h3>
                  <p className="text-white/80 font-medium">{t("mentorBody")}</p>
                  <Link href="/alumni/community/mentorship" className="inline-flex px-8 py-4 bg-primary-darker text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-all shadow-xl">
                     {t("registerMentor")}
                  </Link>
               </div>
               <div className="flex-1 p-16 grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-6">
                     <div className="p-4 bg-white/5 w-fit border border-white/10">
                        <Users size={24} className="text-secondary" />
                     </div>
                     <h4 className="text-xl font-black uppercase tracking-tight">{t("industryExperts")}</h4>
                     <p className="text-slate-400 text-sm font-medium leading-relaxed">{t("industryExpertsBody")}</p>
                  </div>
                  <div className="space-y-6">
                     <div className="p-4 bg-white/5 w-fit border border-white/10">
                        <Clock size={24} className="text-secondary" />
                     </div>
                     <h4 className="text-xl font-black uppercase tracking-tight">{t("flexibleSessions")}</h4>
                     <p className="text-slate-400 text-sm font-medium leading-relaxed">{t("flexibleSessionsBody")}</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 💼 CAREER OPPORTUNITIES & STORIES */}
      <section className="py-32 bg-white overflow-hidden">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
               {/* Careers */}
               <div className="space-y-16">
                  <div className="space-y-6">
                     <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("careersEyebrow")}</h2>
                     <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-darker italic">{t("careersTitle")} <span className="text-secondary not-italic">{t("careersTitleAccent")}</span></h3>
                  </div>
                  <div className="space-y-6">
                     {[
                       { title: t("jobTitle1"), company: "Google", type: t("jobType1"), color: "#4285F4" },
                       { title: t("jobTitle2"), company: "UNESCO", type: t("jobType2"), color: "#00703C" },
                       { title: t("jobTitle3"), company: "CrowdStrike", type: t("jobType3"), color: "#FF0000" },
                     ].map((job, i) => (
                       <div key={i} className="p-8 border border-slate-100 hover:border-primary transition-all flex items-center justify-between group cursor-pointer bg-slate-50/30">
                          <div className="space-y-2">
                             <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400" style={{color: job.color}}>{job.type}</span>
                             <h4 className="text-xl font-black uppercase tracking-tight text-primary-darker">{job.title}</h4>
                             <p className="text-xs font-bold text-slate-400">{job.company}</p>
                          </div>
                          <ArrowRight size={20} className="text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-2" />
                       </div>
                     ))}
                  </div>
                  <Link href="/alumni/opportunities/jobs" className="inline-flex text-[10px] font-black uppercase tracking-widest text-primary border-b-2 border-primary pb-2 hover:text-secondary hover:border-secondary transition-all">
                     {t("viewPostings")}
                  </Link>
               </div>

               {/* Stories */}
               <div className="space-y-16">
                  <div className="space-y-6">
                     <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("storiesEyebrow")}</h2>
                     <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-darker italic">{t("storiesTitle")} <span className="text-secondary not-italic">{t("storiesTitleAccent")}</span></h3>
                  </div>
                  <div className="space-y-12">
                     {stories.map((story, i) => (
                       <div key={i} className="flex gap-8 group cursor-pointer">
                          <div className="relative w-40 h-40 shrink-0 overflow-hidden shadow-xl border-4 border-white">
                             <SafeImage
                               src={resolveImageUrl(story.image_url)}
                               alt={story.title}
                               fill
                               sizes="160px"
                               className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                             />
                          </div>
                          <div className="space-y-4">
                             <Quote size={24} className="text-secondary opacity-20" />
                             <h4 className="text-xl font-black uppercase tracking-tight text-primary-darker group-hover:text-secondary transition-colors leading-tight">{story.title}</h4>
                             <p className="text-xs text-slate-400 font-medium italic">— By {story.alumni?.name}</p>
                             <button className="text-[10px] font-black uppercase tracking-widest text-primary-darker hover:text-secondary transition-all flex items-center space-x-2">
                                <span>{t("readJourney")}</span>
                                <ChevronRight size={14} />
                             </button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 📅 UPCOMING EVENTS */}
      <section className="py-32 bg-slate-50">
         <div className="container mx-auto px-6 max-w-7xl space-y-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
               <div className="space-y-6">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("eventsEyebrow")}</h2>
                  <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary-darker leading-none italic">
                     {t("eventsTitle")} <span className="text-secondary not-italic">{t("eventsTitleAccent")}</span>
                  </h3>
               </div>
               <Link href="/alumni/connect/events" className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center space-x-3 group border-b-2 border-primary pb-2">
                  <span>{t("fullCalendar")}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {upcomingEvents.map((event, i) => (
                 <div key={i} className="bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row group">
                    <div className="md:w-2/5 relative overflow-hidden min-h-[220px]">
                       <SafeImage
                         src={resolveImageUrl(event.image_url)}
                         alt={event.title || "Event"}
                         fill
                         sizes="(max-width: 768px) 100vw, 40vw"
                         className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                       />
                       <div className="absolute top-6 left-6 p-4 bg-primary text-white text-center shadow-2xl">
                          <span className="block text-xl font-black leading-none">{new Date(event.date).getDate()}</span>
                          <span className="block text-[8px] font-bold uppercase tracking-widest opacity-60">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                       </div>
                    </div>
                    <div className="p-10 flex-1 flex flex-col justify-between space-y-8">
                       <div className="space-y-4">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">{event.location}</span>
                          <h4 className="text-2xl font-black uppercase tracking-tight text-primary-dark leading-tight">{event.title}</h4>
                          <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">{event.description}</p>
                       </div>
                       <a href={event.rsvp_link} target="_blank" rel="noopener noreferrer" className="w-fit px-8 py-4 bg-slate-50 text-primary-dark text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark hover:text-white transition-all border border-slate-100">
                          {t("rsvpToday")}
                       </a>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ❓ FAQ SECTION */}
      <section className="py-32 bg-white overflow-hidden relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-96 bg-slate-50 rounded-full blur-[160px] opacity-50" />
         <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-24">
            <div className="text-left space-y-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("faqEyebrow")}</h2>
               <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary-dark">{t("faqTitle")}</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               {faqs.map((faq, i) => (
                 <div key={i} className="p-10 bg-slate-50 border border-slate-100 space-y-6 group hover:bg-white hover:shadow-2xl transition-all">
                    <div className="flex items-center space-x-4">
                       <HelpCircle size={24} className="text-secondary" />
                       <h4 className="text-lg font-black uppercase tracking-tight text-primary-dark">{faq.q}</h4>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed pl-10 border-l-2 border-slate-100 group-hover:border-secondary transition-all">{faq.a}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 📞 CONTACT & CTA */}
      <section className="py-32 bg-slate-50 border-t border-slate-200">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
               <div className="space-y-12">
                  <div className="space-y-6">
                     <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-dark italic">{t("supportTitle")} <span className="text-secondary not-italic">{t("supportTitleAccent")}</span></h3>
                     <p className="text-xl text-slate-500 font-medium leading-relaxed">{t("supportBody")}</p>
                  </div>
                  <div className="space-y-8">
                     <div className="flex items-center space-x-6">
                        <div className="p-4 bg-white shadow-xl text-primary rounded-full"><Mail size={20}/></div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("officialEmail")}</p>
                           <p className="text-lg font-black text-primary-dark">{settings.alumni_support_email || "alumni.office@ouk.ac.ke"}</p>
                        </div>
                     </div>
                     <div className="flex items-center space-x-6">
                        <div className="p-4 bg-white shadow-xl text-primary rounded-full"><Globe size={20}/></div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("headquarters")}</p>
                           <p className="text-lg font-black text-primary-dark">{settings.alumni_support_office || "Technopolis Development Authority, OUK Hub"}</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-white p-12 shadow-2xl space-y-8 border-t-8 border-secondary">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-primary-dark">{t("newsletterTitle")}</h4>
                  <p className="text-sm text-slate-400 font-medium">{t("newsletterBody")}</p>
                  <div className="space-y-4">
                     <input 
                       type="email" 
                       value={subscribeEmail}
                       onChange={(e) => setSubscribeEmail(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                       placeholder={t("emailPlaceholder")} 
                       className="w-full p-6 bg-slate-50 border border-slate-100 outline-none focus:border-primary-dark transition-all text-sm font-bold uppercase tracking-widest disabled:opacity-50"
                       disabled={isSubscribing}
                     />
                     <button 
                       onClick={handleSubscribe}
                       disabled={isSubscribing}
                       className="w-full py-6 bg-primary-dark text-white font-black uppercase tracking-widest text-[11px] hover:bg-secondary transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                     >
                        {isSubscribing ? <span className="animate-pulse">{t("subscribing")}</span> : t("subscribeNow")}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
