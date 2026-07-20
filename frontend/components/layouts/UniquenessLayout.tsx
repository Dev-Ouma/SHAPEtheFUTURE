"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { 
  Globe, 
  Laptop, 
  Wallet, 
  Briefcase, 
  ArrowRight,
  ChevronRight,
  Home
} from "lucide-react";
import Footer from "@/components/Footer";
import { useTranslations } from "next-intl";

interface UniquenessLayoutProps {
  page: any;
  breadcrumbs: { title: string; link: string }[];
  children?: React.ReactNode;
}

export default function UniquenessLayout({ page, breadcrumbs, children }: UniquenessLayoutProps) {
  const t = useTranslations("CmsLayouts");
  const tChrome = useTranslations("CmsChrome");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const defaultFeatures = [
    {
      icon: <Laptop size={40} className="text-secondary" />,
      title: t("featureDigitalTitle"),
      description: t("featureDigitalDesc")
    },
    {
      icon: <Wallet size={40} className="text-primary" />,
      title: t("featureAffordTitle"),
      description: t("featureAffordDesc")
    },
    {
      icon: <Globe size={40} className="text-secondary" />,
      title: t("featurePacingTitle"),
      description: t("featurePacingDesc")
    },
    {
      icon: <Briefcase size={40} className="text-primary" />,
      title: t("featureIndustryTitle"),
      description: t("featureIndustryDesc")
    }
  ];

  const features = page?.layout_data?.features || defaultFeatures;

  // Helper to resolve icon by name or use default search icon
  const getIcon = (title: string, originalIcon: any) => {
    if (originalIcon) return originalIcon;
    const lower = title.toLowerCase();
    if (lower.includes('digital') || lower.includes('learning')) return <Laptop size={40} className="text-secondary" />;
    if (lower.includes('affordability') || lower.includes('cost')) return <Wallet size={40} className="text-primary" />;
    if (lower.includes('pacing') || lower.includes('flexible')) return <Globe size={40} className="text-secondary" />;
    return <Briefcase size={40} className="text-primary" />;
  };

  const philosophyQuote = page?.layout_data?.philosophy || t("philosophyFallback");
  const philosophyAccent = page?.layout_data?.accent_text || t("philosophyAccentFallback");

  return (
    <div className="bg-white min-h-screen">
      {/* Cinematic Hero */}
      <div className="relative min-h-[600px] lg:min-h-[80vh] bg-primary-darker overflow-hidden flex items-start pt-32 lg:pt-48 pb-24">
         {/* Background Patterns */}
         <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-slate-900 to-slate-900" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent" />
         </div>
         
         <div className="container mx-auto px-6 relative z-10">
            <motion.div 
               initial="hidden"
               animate="visible"
               variants={containerVariants}
               className="max-w-4xl"
            >
               {/* Breadcrumbs */}
               <motion.nav variants={itemVariants} className="flex items-center space-x-3 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-12">
                  <Link href="/" className="hover:text-white transition-colors flex items-center space-x-1">
                     <Home size={12} />
                     <span>{tChrome("home")}</span>
                  </Link>
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                       <ChevronRight size={10} className="text-slate-600" />
                       <Link href={crumb.link} className={`hover:text-white transition-colors ${idx === breadcrumbs.length - 1 ? "text-white" : ""}`}>
                          {crumb.title}
                       </Link>
                    </React.Fragment>
                  ))}
               </motion.nav>

               <motion.div variants={itemVariants} className="mb-8">
                  <span className="inline-block py-2 px-4 border border-secondary/30 text-secondary font-black uppercase tracking-widest text-[10px] mb-6">
                    {page?.summary?.split('.')[0] || t("uniquenessBadgeFallback")}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter font-serif leading-[1.1] mb-6 drop-shadow-lg">
                     {page.title}
                  </h1>
               </motion.div>
               
               <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-2xl border-l-4 border-primary pl-6">
                  {page.content ? page.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..." : t("uniquenessHeroFallback")}
               </motion.p>
               
               <motion.div variants={itemVariants} className="mt-12 flex items-center space-x-6">
                  <Link href="/programmes" className="btn-primary py-5 px-10 text-xs font-black uppercase tracking-widest flex items-center space-x-3 group shadow-2xl shadow-primary/30">
                     <span>{t("exploreProgrammes")}</span>
                     <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
               </motion.div>
            </motion.div>
         </div>
      </div>

      {/* Feature Grid Section */}
      <section className="py-32 bg-slate-50 relative">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <motion.h2 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="text-4xl md:text-5xl font-black text-primary-darker uppercase tracking-tighter mb-6 font-serif "
               >
                 {t("differentLead")} <span className="text-secondary">{t("differentAccent")}</span>
               </motion.h2>
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="text-lg text-slate-500 font-medium"
               >
                 {page.summary || t("uniquenessSummaryFallback")}
               </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {features.map((feature: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    className="bg-white p-10 border border-slate-100 hover:border-[#ff7f50]/20 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-[#ff7f50] hover:text-white transition-colors duration-500" />
                     
                     <div className="relative z-10">
                        <div className="w-20 h-20 bg-primary-darker rounded-sm flex items-center justify-center mb-8 transform group-hover:-rotate-6 transition-transform duration-300">
                           {getIcon(feature.title, feature.icon)}
                        </div>
                        <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">
                           {feature.title}
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                           {feature.description}
                        </p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Philosophy Statement */}
      <section className="py-32 bg-primary-darker text-white relative border-t-8 border-secondary overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
         <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
               >
                  <Globe size={64} className="mx-auto text-primary mb-10 opacity-50" />
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-10 font-serif text-slate-300">
                     "{philosophyQuote}"
                  </h2>
                  <p className="text-primary font-black uppercase tracking-[0.3em] text-xs">
                     {philosophyAccent}
                  </p>
               </motion.div>
            </div>
         </div>
      </section>


      {/* Dynamic Content */}
      <div className="relative z-10">
        {children}
      </div>

      <Footer />
    </div>
  );
}
