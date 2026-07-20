"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTestimonials, resolveImageUrl } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from '@/components/ui/SafeImage';
import { useLocale, useTranslations } from 'next-intl';

const SQRT_5000 = Math.sqrt(5000);

interface TestimonialData {
  id: string;
  content: string;
  author: string;
  author_role: string;
  image_url: string;
  tempId?: string | number; // Stable key for AnimatePresence reorder
}

interface TestimonialCardProps {
  position: number;
  testimonial: TestimonialData;
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize 
}, ref) => {
  const isCenter = position === 0;

  return (
    <div
      ref={ref}
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter 
          ? "z-10 bg-primary text-white border-primary" 
          : "z-0 bg-white text-slate-800 border-slate-200 hover:border-primary/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : Math.abs(position) === 1 ? (position > 0 ? 15 : -15) : (position > 0 ? 30 : -30)}px)
          rotate(${isCenter ? 0 : position > 0 ? 2.5 * position : -2.5 * Math.abs(position)}deg)
          scale(${isCenter ? 1 : 1 - (Math.abs(position) * 0.1)})
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px rgba(0,0,0,0.1)" : "0px 0px 0px 0px transparent"
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-slate-100"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2
        }}
      />
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative w-16 h-16 overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
          <SafeImage
            src={resolveImageUrl(testimonial.image_url) || "https://i.pravatar.cc/150?u=" + testimonial.id}
            alt={testimonial.author}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div>
          <h4 className={cn("font-black uppercase text-xs tracking-widest", isCenter ? "text-white" : "text-primary")}>
            {testimonial.author}
          </h4>
          <p className={cn("text-[10px] font-bold uppercase tracking-widest", isCenter ? "text-white/60" : "text-slate-400")}>
            {testimonial.author_role}
          </p>
        </div>
      </div>

      <Quote size={32} className={cn("mb-4 opacity-20", isCenter ? "text-white" : "text-primary")} />
      
      <h3 className={cn(
        "text-lg sm:text-xl font-bold leading-tight mb-4",
        isCenter ? "text-white" : "text-slate-800"
      )}>
        "{testimonial.content}"
      </h3>
    </div>
  );
});

TestimonialCard.displayName = "TestimonialCard";

type TestimonialsProps = { initialTestimonials?: any[] };

const withStableTempId = (item: any, index: number, rotation = 0): TestimonialData => ({
  ...item,
  tempId: `${item.id ?? item.author ?? index}-r${rotation}`,
});

const Testimonials: React.FC<TestimonialsProps> = ({
  initialTestimonials,
} = {}) => {
  const t = useTranslations('Home');
  const locale = useLocale();
  const hasServerData =
    Array.isArray(initialTestimonials) && initialTestimonials.length > 0;
  const [cardSize, setCardSize] = useState(365);
  const [rotation, setRotation] = useState(0);
  const [testimonialsList, setTestimonialsList] = useState<TestimonialData[]>(
    () =>
      Array.isArray(initialTestimonials)
        ? initialTestimonials.map((item, index) => withStableTempId(item, index, 0))
        : [],
  );
  const [loading, setLoading] = useState(!hasServerData);

  useEffect(() => {
    if (hasServerData) {
      setRotation(0);
      setTestimonialsList(
        (initialTestimonials || []).map((item, index) =>
          withStableTempId(item, index, 0),
        ),
      );
      setLoading(false);
      return;
    }
    const fetchTestimonials = async () => {
      try {
        const data = await getTestimonials(locale);
        if (data && data.length > 0) {
          setRotation(0);
          setTestimonialsList(
            data.map((item: any, index: number) => withStableTempId(item, index, 0)),
          );
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, [locale, hasServerData, initialTestimonials]);

  const handleMove = (steps: number) => {
    if (testimonialsList.length === 0) return;
    const newList = [...testimonialsList];
    const nextRotation = rotation + 1;
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push(withStableTempId(item, newList.length, nextRotation));
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift(withStableTempId(item, 0, nextRotation));
      }
    }
    setRotation(nextRotation);
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (loading || testimonialsList.length === 0) return null;

  return (
    <section className="bg-slate-50 py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 mb-16 text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block"
        >
          {t('testimonialsEyebrow')}
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-primary-darker uppercase tracking-tighter"
        >
          {t('testimonialsTitle')} <span className="text-secondary font-serif italic">{t('testimonialsTitleAccent')}</span>
        </motion.h2>
      </div>

      <div
        className="relative w-full overflow-hidden"
        style={{ height: 650 }}
      >
        <AnimatePresence mode='popLayout'>
          {testimonialsList.map((testimonial, index) => {
            const position = testimonialsList.length % 2
              ? index - Math.floor(testimonialsList.length / 2)
              : index - (testimonialsList.length / 2);
            
            // Limit visible cards to 5 total (Center + 2 on each side)
            if (Math.abs(position) > 2) return null;

            return (
              <TestimonialCard
                key={testimonial.tempId}
                testimonial={testimonial}
                handleMove={handleMove}
                position={position}
                cardSize={cardSize}
              />
            );
          })}
        </AnimatePresence>

        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-4 z-20">
          <button
            onClick={() => handleMove(-1)}
            className={cn(
              "flex h-16 w-16 items-center justify-center text-2xl transition-all shadow-lg",
              "bg-white border-2 border-slate-100 text-primary hover:bg-primary hover:text-white hover:border-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
            aria-label={t('prevTestimonial')}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => handleMove(1)}
            className={cn(
              "flex h-16 w-16 items-center justify-center text-2xl transition-all shadow-lg",
              "bg-white border-2 border-slate-100 text-primary hover:bg-primary hover:text-white hover:border-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
            aria-label={t('nextTestimonial')}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
