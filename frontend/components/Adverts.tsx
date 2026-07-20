"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getAdverts, resolveImageUrl, extractYoutubeId } from "@/lib/api";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

type AdvertsProps = { initialAdverts?: any[] };

const Adverts = ({ initialAdverts }: AdvertsProps = {}) => {
  const t = useTranslations("Home");
  const locale = useLocale();
  const hasServerData = Array.isArray(initialAdverts);
  const [adverts, setAdverts] = useState<any[]>(
    Array.isArray(initialAdverts) ? initialAdverts : [],
  );
  const [loading, setLoading] = useState(!hasServerData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (hasServerData) {
      setAdverts(Array.isArray(initialAdverts) ? initialAdverts : []);
      setLoading(false);
      return;
    }
    const fetchAdverts = async () => {
      try {
        const data = await getAdverts(locale);
        if (data && data.length > 0) {
          const activeAds = data.filter((ad: any) => ad.is_active !== false);
          setAdverts(activeAds);
        }
      } catch (error) {
        console.error("Failed to fetch adverts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdverts();
  }, [locale, hasServerData, initialAdverts]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % (adverts.length || 1));
  }, [adverts.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + (adverts.length || 1)) % (adverts.length || 1));
  }, [adverts.length]);

  useEffect(() => {
    if (adverts.length > 1 && !isPaused) {
      const timer = setInterval(nextSlide, 12000); // 12 seconds for better readability
      return () => clearInterval(timer);
    }
  }, [adverts.length, nextSlide, isPaused]);

  if (loading) return null;

  const displayAds = adverts.length > 0 ? adverts : [
    {
      id: 'ad-1',
      title: t("adRegistrationTitle"),
      content: t("adRegistrationBody"),
      image_url: "/ad-registration.png",
      button_text: t("adApplyNow"),
      button_link: "https://portal.ouk.ac.ke",
      theme_color: "#1e234a"
    },
    {
      id: 'ad-2',
      title: t("adAcademicTitle"),
      content: t("adAcademicBody"),
      image_url: "https://images.unsplash.com/photo-1523050853064-85583a697f90?q=80&w=1920",
      button_text: t("adExploreHub"),
      button_link: "/academic-affairs",
      theme_color: "#0f3a3d"
    },
    {
      id: 'ad-3',
      title: t("adTourTitle"),
      content: t("adTourBody"),
      image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1920",
      button_text: t("adStartTour"),
      button_link: "/about/campus",
      theme_color: "#4a1e1e"
    }
  ];

  const currentAd = displayAds[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <section 
      className="bg-white py-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-6 relative group/carousel">
        <div className="overflow-hidden border border-slate-100 relative min-h-[200px] md:min-h-[240px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentAd.id || currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 }
              }}
              className="flex flex-col md:flex-row w-full absolute inset-0"
            >
              {/* Image/Media Side */}
              <div className="md:w-5/12 relative h-32 md:h-auto overflow-hidden bg-black">
                {currentAd.media_type === 'video' ? (
                  <video 
                    src={currentAd.id?.toString().startsWith('ad-') ? currentAd.image_url : resolveImageUrl(currentAd.image_url)} 
                    className="w-full h-full object-cover"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                  />
                ) : currentAd.media_type === 'youtube' ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYoutubeId(currentAd.image_url)}?autoplay=1&mute=1&loop=1&playlist=${extractYoutubeId(currentAd.image_url)}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1`}
                      className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 border-none"
                      allow="autoplay; encrypted-media"
                    />
                  </div>
                ) : (
                  <Image
                    src={currentAd.id?.toString().startsWith('ad-') ? currentAd.image_url : resolveImageUrl(currentAd.image_url)}
                    alt={currentAd.title}
                    fill
                    className="object-cover transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 45vw"
                  />
                )}
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              </div>

               {/* Content Side */}
              <div 
                className="flex-1 p-8 md:p-10 flex flex-col justify-center text-white relative text-center md:text-left items-center md:items-start"
                style={{ backgroundColor: currentAd.theme_color || '#1e234a' }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                
                <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="flex flex-col items-center md:items-start"
                >
                  <h2 className="text-xl md:text-3xl font-black mb-3 leading-tight uppercase tracking-tighter font-sans">
                    {currentAd.title}
                  </h2>
                  <p className="text-white/80 text-[13px] md:text-base mb-8 leading-relaxed font-medium max-w-xl line-clamp-2">
                    {currentAd.content}
                  </p>
                  {currentAd.button_text && (() => {
                    const href = currentAd.button_link || "#";
                    const isExternal = /^https?:\/\//i.test(href) || href.startsWith("//");
                    const className = "inline-flex items-center space-x-4 bg-secondary hover:bg-secondary/90 text-white px-8 py-4 font-black uppercase tracking-widest text-[11px] transition-all transform hover:-translate-y-1 shadow-lg";
                    const style = { backgroundColor: currentAd.button_color || undefined };
                    if (isExternal || currentAd.open_in_new_tab) {
                      return (
                        <a
                          href={href}
                          target={currentAd.open_in_new_tab ? "_blank" : "_self"}
                          rel={currentAd.open_in_new_tab ? "noopener noreferrer" : undefined}
                          className={className}
                          style={style}
                        >
                          <span>{currentAd.button_text}</span>
                          <ArrowRight size={14} />
                        </a>
                      );
                    }
                    return (
                      <Link href={href.startsWith("/") ? href : `/${href}`} className={className} style={style}>
                        <span>{currentAd.button_text}</span>
                        <ArrowRight size={14} />
                      </Link>
                    );
                  })()}
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {displayAds.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-black/20 hover:bg-black/40 text-white backdrop-blur-md rounded-full transition-all opacity-0 group-hover/carousel:opacity-100"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 bg-black/20 hover:bg-black/40 text-white backdrop-blur-md rounded-full transition-all opacity-0 group-hover/carousel:opacity-100"
              >
                <ChevronRight size={24} />
              </button>

              {/* Progress Dots */}
              <div className="absolute bottom-6 right-10 z-20 flex space-x-3">
                {displayAds.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 transition-all duration-500 rounded-full ${
                      idx === currentIndex ? "w-8 bg-secondary" : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Adverts;
