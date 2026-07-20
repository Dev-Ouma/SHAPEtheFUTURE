"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Info, Map, Camera, Users, Award, Building } from "lucide-react";
import { useTranslations } from "next-intl";

interface VirtualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  videoType?: "upload" | "youtube";
  title?: string;
  description?: string;
}

const VirtualTourModal = ({ 
  isOpen, 
  onClose, 
  videoUrl = "/videos/intro.mp4", 
  videoType = "upload",
  title,
  description,
}: VirtualTourModalProps) => {
  const t = useTranslations("VirtualTour");
  const [activeView, setActiveView] = useState<"video" | "tour">("video");
  const displayTitle = title || t("modalFallbackTitle");
  const displayDescription = description || t("modalFallbackDesc");

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-darker/95 backdrop-blur-xl p-4 md:p-10"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-7xl aspect-video bg-black shadow-2xl overflow-hidden rounded-2xl border border-white/10 flex flex-col"
          >
            {/* Header / Controls */}
            <div className="absolute top-0 inset-x-0 z-20 p-8 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="space-y-2 pointer-events-auto">
                <motion.h2 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter font-serif italic"
                >
                  {displayTitle}
                </motion.h2>
                <motion.p 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 }}
                   className="text-slate-400 text-sm font-medium tracking-wide max-w-xl"
                >
                  {displayDescription}
                </motion.p>
              </div>
              <button 
                onClick={onClose}
                className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all pointer-events-auto border border-white/10"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 relative bg-black flex items-center justify-center">
              {videoType === "youtube" ? (
                <iframe 
                  src={`https://www.youtube.com/embed/${getYoutubeId(videoUrl)}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={videoUrl}
                  autoPlay
                  controls
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Virtual Tour Overlays (Optional Experience Enhancers) */}
            <div className="absolute bottom-10 inset-x-0 z-20 flex justify-center items-center gap-4 px-8 pointer-events-none">
               <div className="flex bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-full pointer-events-auto shadow-2xl">
                  {[
                    { id: 'video', icon: Play, label: t("tabCinema") },
                    { id: 'campus', icon: Building, label: t("tabCampus") },
                    { id: 'innovation', icon: Camera, label: t("tabVrHub") },
                    { id: 'map', icon: Map, label: t("tabGlobal") },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id as any)}
                      className={`flex items-center space-x-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === item.id ? 'bg-secondary text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <item.icon size={16} />
                      <span className="hidden md:inline">{item.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Sidebar Stats (Minimalist Virtual Tour Feel) */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 space-y-8 hidden lg:block pointer-events-none">
               {[
                 { icon: Users, val: "5k+", label: t("modalScholars") },
                 { icon: Award, val: "Top 10", label: t("modalInnovation") },
                 { icon: Info, val: "24/7", label: t("modalAccess") },
               ].map((stat, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.5 + (i * 0.1) }}
                   className="text-right pointer-events-auto"
                 >
                   <div className="flex items-center justify-end space-x-4 mb-1">
                      <span className="text-2xl font-black text-white tracking-tighter">{stat.val}</span>
                      <stat.icon size={18} className="text-secondary" />
                   </div>
                   <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                 </motion.div>
               ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VirtualTourModal;
