"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

type FontSize = "normal" | "large" | "xlarge";

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  dyslexicFont: boolean;
  toggleDyslexicFont: () => void;
  isReading: boolean;
  readPage: () => void;
  stopReading: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [isReading, setIsReading] = useState(false);

  // Refs for scroll reading
  const readingElementRef = useRef<Element | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queueRef = useRef<string[]>([]);
  const speakingRef = useRef<boolean>(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Initialize from localStorage and load voices
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHighContrast(localStorage.getItem("ouk_access_contrast") === "true");
      setDyslexicFont(localStorage.getItem("ouk_access_dyslexic") === "true");
      const savedSize = localStorage.getItem("ouk_access_fontsize") as FontSize;
      if (savedSize) setFontSizeState(savedSize);

      // Load voices for natural speech
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Update DOM classes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (highContrast) root.classList.add("theme-high-contrast");
    else root.classList.remove("theme-high-contrast");
    if (dyslexicFont) root.classList.add("font-dyslexic");
    else root.classList.remove("font-dyslexic");
    root.classList.remove("text-base", "text-lg", "text-xl");
    if (fontSize === "large") root.classList.add("text-lg");
    if (fontSize === "xlarge") root.classList.add("text-xl");
  }, [highContrast, fontSize, dyslexicFont]);

  const toggleHighContrast = () => {
    const val = !highContrast;
    setHighContrast(val);
    localStorage.setItem("ouk_access_contrast", String(val));
  };
  const toggleDyslexicFont = () => {
    const val = !dyslexicFont;
    setDyslexicFont(val);
    localStorage.setItem("ouk_access_dyslexic", String(val));
  };
  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("ouk_access_fontsize", size);
  };

  const isReadingRef = useRef<boolean>(false);

  // Sync isReading state to ref for callbacks
  useEffect(() => {
    isReadingRef.current = isReading;
  }, [isReading]);

  const readNextElement = () => {
    if (!isReadingRef.current) return;
    
    let elements = Array.from(document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6, main p, main li, main blockquote'));
    if (elements.length === 0) {
      elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote'));
    }
    
    elements = elements.filter(el => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const text = (el as HTMLElement).innerText?.trim() || "";
      if (text.length < 5) return false;
      return true;
    });

    if (readingElementRef.current) {
      const currentIndex = elements.indexOf(readingElementRef.current);
      if (currentIndex !== -1 && currentIndex + 1 < elements.length) {
        const nextEl = elements[currentIndex + 1];
        // Scroll the next element into view. The scroll listener will automatically trigger readFocusedElement!
        nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setIsReading(false); // End of page
      }
    }
  };

  const getNaturalVoice = () => {
    const voices = voicesRef.current;
    if (!voices.length) return null;
    return voices.find(v => v.name.includes('Premium') || v.name.includes('Natural')) 
      || voices.find(v => v.name.includes('Google US English')) 
      || voices.find(v => v.name.includes('Google UK English Female'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
  };

  const speakNext = () => {
    if (queueRef.current.length === 0) {
      speakingRef.current = false;
      // Automatically continue to the next paragraph after a slightly longer pause
      setTimeout(() => {
        if (isReadingRef.current && !speakingRef.current) {
          readNextElement();
        }
      }, 600); // 600ms pause between paragraphs
      return;
    }
    speakingRef.current = true;
    const text = queueRef.current.shift();
    if (!text) {
      speakNext();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getNaturalVoice();
    if (voice) utterance.voice = voice;
    
    utterance.rate = 0.95; 
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setTimeout(() => {
        if (speakingRef.current && isReadingRef.current) speakNext();
      }, 350); 
    };
    utterance.onerror = () => {
      if (speakingRef.current && isReadingRef.current) speakNext();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const enqueueText = (text: string) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    sentences.forEach(sentence => {
      const clean = sentence.trim();
      if (clean.length > 0) queueRef.current.push(clean);
    });
    if (!speakingRef.current) {
      speakNext();
    }
  };

  const readFocusedElement = () => {
    let elements = Array.from(document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6, main p, main li, main blockquote'));
    if (elements.length === 0) {
      elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote'));
    }
    
    const windowHeight = window.innerHeight;
    const center = windowHeight / 2;
    
    let closest = null;
    let minDistance = Infinity;
    
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
      
      const text = (el as HTMLElement).innerText?.trim() || "";
      if (text.length < 5) continue; // Skip empty/tiny elements
      
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(center - elCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closest = el;
        }
      }
    }

    if (closest && closest !== readingElementRef.current) {
      // Highlight the element being read
      if (readingElementRef.current) {
        (readingElementRef.current as HTMLElement).style.outline = 'none';
        (readingElementRef.current as HTMLElement).style.backgroundColor = 'transparent';
      }
      (closest as HTMLElement).style.outline = '2px solid #0078D4';
      (closest as HTMLElement).style.outlineOffset = '4px';
      (closest as HTMLElement).style.backgroundColor = 'rgba(0, 120, 212, 0.05)';
      (closest as HTMLElement).style.borderRadius = '4px';
      (closest as HTMLElement).style.transition = 'all 0.3s ease';
      
      readingElementRef.current = closest;
      window.speechSynthesis.cancel();
      queueRef.current = [];
      speakingRef.current = false;
      enqueueText((closest as HTMLElement).innerText);
    }
  };

  const handleScroll = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      readFocusedElement();
    }, 400); // 400ms debounce ensures we wait for user to stop scrolling
  };

  useEffect(() => {
    if (isReading) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      readFocusedElement();
    } else {
      window.removeEventListener('scroll', handleScroll);
      window.speechSynthesis.cancel();
      queueRef.current = [];
      speakingRef.current = false;
      if (readingElementRef.current) {
        (readingElementRef.current as HTMLElement).style.outline = 'none';
        (readingElementRef.current as HTMLElement).style.backgroundColor = 'transparent';
        readingElementRef.current = null;
      }
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isReading]);

  const readPage = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setIsReading(true);
  };

  const stopReading = () => {
    setIsReading(false);
  };

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      toggleHighContrast,
      fontSize,
      setFontSize,
      dyslexicFont,
      toggleDyslexicFont,
      isReading,
      readPage,
      stopReading
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
