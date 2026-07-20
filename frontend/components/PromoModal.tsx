"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { getAdverts, getPrograms, resolveImageUrl } from "@/lib/api";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

type PromoModalProps = {
  initialAdverts?: any[];
  initialPrograms?: any[];
};

export default function PromoModal({
  initialAdverts,
  initialPrograms,
}: PromoModalProps = {}) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [advert, setAdvert] = useState<any>(null);
  const hasServerData =
    Array.isArray(initialAdverts) || Array.isArray(initialPrograms);

  useEffect(() => {
    const hasSeenPromo = localStorage.getItem("ouk_promo_seen");
    if (hasSeenPromo) return;

    const buildOptions = (adsData: any[], progsList: any[]) => {
      const options: any[] = [];
      if (adsData && adsData.length > 0) {
        const activeAds = adsData.filter((ad: any) => ad.is_active !== false);
        options.push(
          ...activeAds.map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            content: ad.content,
            button_text: ad.button_text || t("promoLearnMore"),
            button_link: ad.button_link,
            image_url: ad.image_url,
            theme_color: ad.theme_color,
            open_in_new_tab: ad.open_in_new_tab,
            type: "Featured",
          })),
        );
      }
      if (progsList && progsList.length > 0) {
        options.push(
          ...progsList.map((prog: any) => ({
            id: prog.id,
            title: prog.title || prog.name,
            content:
              prog.overview || prog.description || prog.title || prog.name,
            button_text: t("promoViewProgramme"),
            button_link: `/programmes/${prog.slug || prog.id}`,
            image_url:
              prog.programme_image || prog.image_url || "/ad-registration.png",
            theme_color: "#1e234a",
            open_in_new_tab: false,
            type: "Programme",
          })),
        );
      }
      return options;
    };

    const openLater = () => {
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    };

    if (hasServerData) {
      const options = buildOptions(
        Array.isArray(initialAdverts) ? initialAdverts : [],
        Array.isArray(initialPrograms) ? initialPrograms : [],
      );
      if (options.length > 0) {
        setAdvert(options[Math.floor(Math.random() * options.length)]);
      }
      return openLater();
    }

    const fetchPromo = async () => {
      try {
        const [adsData, progsData] = await Promise.all([
          getAdverts(locale).catch(() => []),
          getPrograms({ limit: 5, locale }).catch(() => ({ data: [] })),
        ]);
        const progsList = Array.isArray(progsData?.data)
          ? progsData.data
          : Array.isArray(progsData)
            ? progsData
            : [];
        const options = buildOptions(
          Array.isArray(adsData) ? adsData : [],
          progsList,
        );
        if (options.length > 0) {
          setAdvert(options[Math.floor(Math.random() * options.length)]);
        }
      } catch (error) {
        console.error("Failed to fetch promo options:", error);
      }
    };

    let cleanup: (() => void) | undefined;
    fetchPromo().then(() => {
      cleanup = openLater();
    });
    return () => cleanup?.();
  }, [locale, t, hasServerData, initialAdverts, initialPrograms]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("ouk_promo_seen", "true");
  };

  const handleAction = () => {
    localStorage.setItem("ouk_promo_seen", "true");
    if (advert?.button_link) {
      const href = String(advert.button_link);
      const isExternal = /^https?:\/\//i.test(href) || href.startsWith("//");
      if (advert.open_in_new_tab || isExternal) {
        window.open(href, advert.open_in_new_tab ? "_blank" : "_self");
      } else {
        router.push(href.startsWith("/") ? href : `/${href}`);
      }
    }
    setIsOpen(false);
  };

  // Default fallback content if no advert is fetched but we still want to show something
  const displayAd = advert || {
    title: t("promoFallbackTitle"),
    content: t("promoFallbackBody"),
    button_text: t("adApplyNow"),
    button_link: "https://portal.ouk.ac.ke",
    image_url: "/ad-registration.png", // Use a generic fallback or the one from Adverts
    theme_color: "#0f3a3d"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] flex flex-col md:flex-row rounded-xl overflow-hidden max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/10 hover:bg-white/30 md:bg-black/5 md:hover:bg-black/10 text-white md:text-slate-500 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300"
                aria-label={t("promoClose")}
              >
                <X size={20} />
              </button>

              {/* Image Side */}
              <div className="w-full md:w-1/2 h-56 md:h-auto min-h-[300px] relative bg-slate-100 overflow-hidden group">
                {(() => {
                  let finalImageUrl = displayAd.id ? resolveImageUrl(displayAd.image_url) : displayAd.image_url;
                  
                  // Extract youtube thumbnail if someone pasted a youtube video link in the CMS
                  if (finalImageUrl) {
                    const ytMatch = finalImageUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                    if (ytMatch && ytMatch[1]) {
                      finalImageUrl = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
                    }
                  }

                  return (
                    <Image
                      src={finalImageUrl || "/ad-registration.png"}
                      alt={displayAd.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-900/10" />
                
                {/* Featured Badge */}
                <div className="absolute top-6 left-6 flex items-center space-x-2 bg-gradient-to-r from-secondary to-orange-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>{displayAd.type === 'Programme' ? t("promoFeaturedProgramme") : t("promoAnnouncement")}</span>
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full md:w-1/2 flex flex-col relative bg-white max-h-[calc(90vh-14rem)] md:max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="p-8 sm:p-10 md:p-12 flex-1 flex flex-col justify-center">
                  
                  {/* Decorative background accent */}
                  <div 
                    className="absolute top-0 right-0 w-40 h-40 opacity-5 pointer-events-none rounded-bl-full"
                    style={{ backgroundColor: displayAd.theme_color || '#1e234a' }}
                  />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <h2 
                      className="text-3xl md:text-4xl font-black mb-5 leading-[1.1] tracking-tight text-primary font-sans"
                    >
                      {displayAd.title}
                    </h2>
                    
                    <div className="w-12 h-1.5 mb-6 rounded-full" style={{ backgroundColor: displayAd.theme_color || '#ea580c' }} />
                    
                    <p className="text-slate-600 text-sm md:text-[15px] mb-8 leading-relaxed font-medium">
                      {displayAd.content}
                    </p>

                    <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-4 items-center">
                      <button
                        onClick={handleAction}
                        className="w-full sm:w-auto flex-1 inline-flex justify-center items-center space-x-3 text-white px-8 py-4 rounded-lg font-black uppercase tracking-widest text-[11px] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden"
                        style={{ 
                          background: displayAd.button_color 
                            ? `linear-gradient(135deg, ${displayAd.button_color}, ${displayAd.button_color}dd)` 
                            : 'linear-gradient(135deg, #ea580c, #c2410c)',
                          boxShadow: displayAd.button_color ? `0 10px 25px -5px ${displayAd.button_color}66` : '0 10px 25px -5px rgba(234, 88, 12, 0.4)'
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative z-10">{displayAd.button_text || t("promoLearnMore")}</span>
                        <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                      </button>
                      
                      <button
                        onClick={handleClose}
                        className="w-full sm:w-auto inline-flex justify-center items-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-colors duration-300 border border-slate-200"
                      >
                        {t("promoMaybeLater")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
