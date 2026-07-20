"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { getHeroSlides, getSettings, resolveImageUrl } from "@/lib/api";
import VirtualTourModal from "./VirtualTourModal";
import DiscoverySearch from "./DiscoverySearch";
import { useLocale, useTranslations } from "next-intl";
import { LocalizedHtml, LocalizedText } from "@/components/LocalizedCms";

type HeroProps = {
  initialSlides?: any[];
  initialSettings?: Record<string, any>;
};

function buildFallbackSlide(
  settingsData: Record<string, any>,
  t: (key: string) => string,
) {
  return {
    id: "fallback",
    tagline: settingsData.home_hero_tagline || t("heroTaglineFallback"),
    title: settingsData.home_hero_title || t("heroTitleFallback"),
    description: settingsData.home_hero_description || t("heroDescFallback"),
    image_url: settingsData.home_hero_image || "/hero-campus.png",
    cta_text: settingsData.cta_apply_label || t("adApplyNow"),
    cta_link: settingsData.cta_apply_url || "/admissions",
  };
}

const Hero = ({ initialSlides, initialSettings }: HeroProps = {}) => {
  const locale = useLocale();
  const t = useTranslations("Home");
  const hasServerSlides =
    Array.isArray(initialSlides) && initialSlides.length > 0;
  const hasServerSettings =
    !!initialSettings && Object.keys(initialSettings).length > 0;
  const seededSlides = hasServerSlides
    ? initialSlides!
    : hasServerSettings
      ? [buildFallbackSlide(initialSettings!, t)]
      : [];
  const [slides, setSlides] = useState<any[]>(seededSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(seededSlides.length === 0);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<any>(initialSettings || {});
  const [isPaused, setIsPaused] = useState(false);
  const { scrollY } = useScroll();
  const searchY = useTransform(scrollY, [0, 500], [0, 300]);
  const searchOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const searchScale = useTransform(scrollY, [0, 500], [1, 0.9]);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);

  const SLIDE_DURATION = 8000; // 8 seconds

  useEffect(() => {
    if (hasServerSlides) {
      setSettings(initialSettings || {});
      setSlides(initialSlides!);
      setLoading(false);
      return;
    }

    if (hasServerSettings) {
      setSettings(initialSettings!);
      setSlides([buildFallbackSlide(initialSettings!, t)]);
      setLoading(false);
      return;
    }

    const fetchHeroData = async () => {
      setLoading(true);
      const [slidesData, settingsData] = await Promise.all([
        getHeroSlides(locale),
        getSettings(locale),
      ]);
      setSettings(settingsData || {});

      if (slidesData && slidesData.length > 0) {
        setSlides(slidesData);
      } else {
        setSlides([buildFallbackSlide(settingsData || {}, t)]);
      }
      setLoading(false);
    };

    fetchHeroData();
  }, [locale, t, hasServerSlides, hasServerSettings, initialSlides, initialSettings]);

  useEffect(() => {
    if (slides.length > 1 && !isPaused) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [slides, currentIndex, isPaused]);

  const startAutoPlay = () => {
    stopAutoPlay();
    
    // If we were paused, we need to adjust the start time to resume from where we were
    const initialElapsed = (progress / 100) * SLIDE_DURATION;
    startTimeRef.current = Date.now() - initialElapsed;
    
    autoPlayRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        nextSlide();
      }
    }, 100);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const nextSlide = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Skeleton only while a client fetch is still pending with no slides yet.
  if (loading && slides.length === 0) {
    return (
      <div className="relative h-screen flex items-center overflow-hidden bg-primary-darker group">
        <div className="absolute inset-0 z-0 bg-slate-800 animate-pulse" />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl space-y-8">
            <div className="w-48 h-10 bg-slate-700 rounded-lg animate-pulse" />
            <div className="w-full h-32 bg-slate-700 rounded-lg animate-pulse" />
            <div className="w-2/3 h-20 bg-slate-700 rounded-lg animate-pulse" />
            <div className="flex gap-6 pt-4">
              <div className="w-40 h-16 bg-slate-700 rounded-lg animate-pulse" />
              <div className="w-40 h-16 bg-slate-700 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <section 
      className="relative h-screen flex items-center overflow-hidden bg-primary-darker group" 
      id="hero-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background — skip enter animation on first slide so LCP is not delayed */}
      <AnimatePresence mode="wait">
        <motion.div
           key={currentSlide.id + "_bg"}
           initial={currentIndex === 0 ? false : { scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           exit={{ scale: 0.95, opacity: 0 }}
           transition={{ duration: 1.2, ease: "easeOut" }}
           className="absolute inset-0 z-0"
        >
          {currentSlide.video_url && currentSlide.video_type === 'youtube' ? (
             <div className="w-full h-full relative overflow-hidden">
                <iframe 
                  src={`https://www.youtube.com/embed/${getYoutubeId(currentSlide.video_url)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeId(currentSlide.video_url)}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0`}
                  className="w-full h-[120%] -top-[10%] absolute border-none pointer-events-none scale-110"
                  allow="autoplay"
                />
             </div>
          ) : currentSlide.video_url ? (
            <video
              src={resolveImageUrl(currentSlide.video_url)}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Image 
              src={resolveImageUrl(currentSlide.image_url)}
              alt={currentSlide.title?.replace(/<[^>]*>?/gm, '') || t("slideAltFallback")}
              fill
              priority={currentIndex === 0}
              fetchPriority={currentIndex === 0 ? "high" : "auto"}
              className="object-cover"
              sizes="100vw"
              quality={currentIndex === 0 ? 80 : 75}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-darker/95 via-primary-darker/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-primary-darker/80 via-transparent to-transparent opacity-80"></div>
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="max-w-4xl lg:w-2/3 text-center lg:text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id + "_content"}
              initial={currentIndex === 0 ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {currentSlide.tagline && (
                <LocalizedText
                  locale={locale}
                  swSource={currentSlide.tagline_sw}
                  as="span"
                  className="inline-block bg-secondary px-6 py-2 text-white text-[10px] font-black tracking-[0.4em] uppercase mb-8 shadow-xl shadow-secondary/20"
                >
                  {currentSlide.tagline}
                </LocalizedText>
              )}
              
              <LocalizedHtml
                locale={locale}
                swSource={currentSlide.title_sw}
                as="h1"
                html={currentSlide.title || ""}
                className="text-[clamp(1.5rem,4vw+1rem,3.5rem)] font-black text-white leading-[1.05] mb-6 md:mb-8 font-serif"
              />
              
              <LocalizedText
                locale={locale}
                swSource={currentSlide.description_sw}
                as="p"
                className="text-base md:text-xl text-slate-300 mb-8 md:mb-12 leading-relaxed max-w-2xl font-medium mx-auto lg:mx-0"
              >
                {currentSlide.description}
              </LocalizedText>

              <div className="flex flex-col xl:flex-row flex-wrap gap-4 md:gap-6 justify-center lg:justify-start">
                {currentSlide.cta_link && (
                  <Link href={currentSlide.cta_link} className="w-full xl:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary flex items-center justify-center space-x-4 text-xs md:text-sm font-black uppercase tracking-widest px-8 md:px-12 h-16 md:h-20 shadow-2xl shadow-primary/40 border-b-4 border-white/20 w-full whitespace-nowrap"
                    >
                      <span>{currentSlide.cta_text || t("heroExploreMore")}</span>
                      <ArrowRight size={20} />
                    </motion.button>
                  </Link>
                )}
                
                <Link href="/virtual-tour" className="w-full xl:w-auto">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/5 backdrop-blur-md text-white border border-white/10 px-8 md:px-12 h-16 md:h-20 font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center space-x-4 hover:bg-white/10 transition-all group/btn w-full whitespace-nowrap"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                      <Play size={16} fill="white" className="ml-1" />
                    </div>
                    <span>{t("heroInstitutionalIntro")}</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Discovery Search on the Right */}
        <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-end z-20 mt-12 lg:mt-0">
          <motion.div 
            style={{ 
              y: searchY,
              opacity: searchOpacity,
              scale: searchScale
            }}
            className="w-full max-w-sm relative"
          >
            <div className="mb-6 w-full text-left bg-white/5 backdrop-blur-sm border-l-4 border-secondary p-4">
              <h3 className="text-white text-xl font-black uppercase tracking-tighter leading-none mb-1">
                {t("heroDiscoverTitle")} <span className="text-secondary">{t("heroDiscoverAccent")}</span>
              </h3>
              <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">{t("heroDiscoverSubtitle")}</p>
            </div>
            <DiscoverySearch theme="glass" animate={true} layout="vertical" />
          </motion.div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-12 left-6 lg:left-12 z-20 flex items-end space-x-12">
         {/* Index Indicator */}
         <div className="flex items-center space-x-4">
            <span className="text-4xl font-serif font-black text-primary">0{currentIndex + 1}</span>
            <div className="w-12 h-[1px] bg-white/20" />
            <span className="text-xl font-bold text-white/40">0{slides.length}</span>
         </div>

         {/* Navigation Dots with Progress */}
         <div className="flex space-x-4 pb-2">
            {slides.map((_, idx) => (
               <button 
                  key={idx}
                  onClick={() => { stopAutoPlay(); setCurrentIndex(idx); }}
                  className="relative w-16 h-1 bg-white/10 overflow-hidden"
               >
                  {idx === currentIndex && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="absolute inset-y-0 left-0 bg-primary"
                    />
                  )}
               </button>
            ))}
         </div>
      </div>

      {/* Interactive Immersion Zones (Left/Right) */}
      <button 
         onClick={prevSlide}
         className="absolute left-0 top-0 bottom-0 w-24 lg:w-48 z-30 group/prev outline-none"
      >
          <div className="absolute inset-0 opacity-0 group-hover/prev:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
             <div className="absolute inset-0 bg-white/5 animate-pulse" />
          </div>
      </button>

      <button 
         onClick={nextSlide}
         className="absolute right-0 top-0 bottom-0 w-24 lg:w-48 z-30 group/next outline-none"
      >
          <div className="absolute inset-0 opacity-0 group-hover/next:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
             <div className="absolute inset-0 bg-white/5 animate-pulse" />
          </div>
      </button>

      {/* Visual Overlay elements */}
      <div className="absolute right-0 top-0 bottom-0 w-32 border-l border-white/5 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
