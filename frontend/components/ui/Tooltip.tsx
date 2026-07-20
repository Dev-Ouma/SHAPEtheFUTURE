"use client";

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top, // Viewport relative for 'fixed' position
        left: rect.left,
        width: rect.width
      });
    }
  };

  const handleMouseEnter = () => {
    updateCoords();
    setIsVisible(true);
  };

  return (
    <div 
      ref={triggerRef}
      className="inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {mounted && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              style={{
                position: 'fixed', // Use fixed to ensure it stays relative to viewport if needed, though portal handles body anchoring
                top: coords.top,
                left: coords.left + (coords.width / 2),
                transform: 'translateX(-50%) translateY(calc(-100% - 12px))',
                zIndex: 999999,
                pointerEvents: 'none'
              }}
              className="absolute"
            >
              <div className="px-5 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl shadow-[0_25px_60px_-15px_rgba(3,123,144,0.4)] whitespace-nowrap border border-white/20 relative backdrop-blur-sm">
                {content}
                {/* Tooltip Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-8 border-transparent border-t-primary drop-shadow-lg" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;
