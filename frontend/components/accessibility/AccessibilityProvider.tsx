"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type FontSize = "normal" | "large" | "xlarge";
export type ColorTheme = "default" | "high-contrast" | "dark" | "soft";
export type ColorFilter = "none" | "grayscale" | "invert" | "protanopia" | "deuteranopia" | "tritanopia";
export type LetterSpacing = "normal" | "wide" | "wider";
export type LineHeightPref = "normal" | "relaxed" | "loose";
export type CursorSize = "normal" | "large" | "xlarge";

export type AccessibilityPrefs = {
  colorTheme: ColorTheme;
  fontSize: FontSize;
  dyslexicFont: boolean;
  letterSpacing: LetterSpacing;
  lineHeight: LineHeightPref;
  reducedMotion: boolean;
  readingGuide: boolean;
  underlineLinks: boolean;
  bigCursor: CursorSize;
  colorFilter: ColorFilter;
  highlightFocus: boolean;
  textAlign: "default" | "left" | "justify";
};

const STORAGE_KEY = "shape_a11y_prefs_v1";

const DEFAULTS: AccessibilityPrefs = {
  colorTheme: "default",
  fontSize: "normal",
  dyslexicFont: false,
  letterSpacing: "normal",
  lineHeight: "normal",
  reducedMotion: false,
  readingGuide: false,
  underlineLinks: false,
  bigCursor: "normal",
  colorFilter: "none",
  highlightFocus: true,
  textAlign: "default",
};

type AccessibilityContextType = AccessibilityPrefs & {
  setPref: <K extends keyof AccessibilityPrefs>(key: K, value: AccessibilityPrefs[K]) => void;
  resetPrefs: () => void;
  /** @deprecated use colorTheme === 'high-contrast' */
  highContrast: boolean;
  toggleHighContrast: () => void;
  setFontSize: (size: FontSize) => void;
  toggleDyslexicFont: () => void;
  isReading: boolean;
  readPage: () => void;
  stopReading: () => void;
  readSelection: () => void;
  isListening: boolean;
  startVoiceNav: () => void;
  stopVoiceNav: () => void;
  voiceSupported: boolean;
  speechSupported: boolean;
  openPanel: boolean;
  setOpenPanel: (open: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

function loadPrefs(): AccessibilityPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    // Migrate legacy keys
    const migrated = { ...DEFAULTS };
    if (localStorage.getItem("ouk_access_contrast") === "true") migrated.colorTheme = "high-contrast";
    if (localStorage.getItem("ouk_access_dyslexic") === "true") migrated.dyslexicFont = true;
    const fs = localStorage.getItem("ouk_access_fontsize") as FontSize | null;
    if (fs) migrated.fontSize = fs;
    return migrated;
  } catch {
    return DEFAULTS;
  }
}

function applyDomClasses(prefs: AccessibilityPrefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;

  root.classList.remove(
    "theme-high-contrast",
    "theme-a11y-dark",
    "theme-a11y-soft",
    "font-dyslexic",
    "a11y-text-lg",
    "a11y-text-xl",
    "a11y-spacing-wide",
    "a11y-spacing-wider",
    "a11y-leading-relaxed",
    "a11y-leading-loose",
    "a11y-reduced-motion",
    "a11y-reading-guide",
    "a11y-underline-links",
    "a11y-cursor-large",
    "a11y-cursor-xlarge",
    "a11y-filter-grayscale",
    "a11y-filter-invert",
    "a11y-filter-protanopia",
    "a11y-filter-deuteranopia",
    "a11y-filter-tritanopia",
    "a11y-highlight-focus",
    "a11y-align-left",
    "a11y-align-justify",
    "text-lg",
    "text-xl",
  );

  if (prefs.colorTheme === "high-contrast") root.classList.add("theme-high-contrast");
  if (prefs.colorTheme === "dark") root.classList.add("theme-a11y-dark");
  if (prefs.colorTheme === "soft") root.classList.add("theme-a11y-soft");
  if (prefs.dyslexicFont) root.classList.add("font-dyslexic");
  if (prefs.fontSize === "large") {
    root.classList.add("a11y-text-lg", "text-lg");
  }
  if (prefs.fontSize === "xlarge") {
    root.classList.add("a11y-text-xl", "text-xl");
  }
  if (prefs.letterSpacing === "wide") root.classList.add("a11y-spacing-wide");
  if (prefs.letterSpacing === "wider") root.classList.add("a11y-spacing-wider");
  if (prefs.lineHeight === "relaxed") root.classList.add("a11y-leading-relaxed");
  if (prefs.lineHeight === "loose") root.classList.add("a11y-leading-loose");
  if (prefs.reducedMotion) root.classList.add("a11y-reduced-motion");
  if (prefs.readingGuide) root.classList.add("a11y-reading-guide");
  if (prefs.underlineLinks) root.classList.add("a11y-underline-links");
  if (prefs.bigCursor === "large") root.classList.add("a11y-cursor-large");
  if (prefs.bigCursor === "xlarge") root.classList.add("a11y-cursor-xlarge");
  if (prefs.colorFilter !== "none") root.classList.add(`a11y-filter-${prefs.colorFilter}`);
  if (prefs.highlightFocus) root.classList.add("a11y-highlight-focus");
  if (prefs.textAlign === "left") root.classList.add("a11y-align-left");
  if (prefs.textAlign === "justify") root.classList.add("a11y-align-justify");

  body?.setAttribute("data-a11y-theme", prefs.colorTheme);
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const readingElementRef = useRef<Element | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueRef = useRef<string[]>([]);
  const speakingRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const isReadingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const guideYRef = useRef(0);

  useEffect(() => {
    const loaded = loadPrefs();
    setPrefs(loaded);
    applyDomClasses(loaded);
    setHydrated(true);

    const speechOk = typeof window !== "undefined" && "speechSynthesis" in window;
    setSpeechSupported(speechOk);
    const SR =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;
    setVoiceSupported(!!SR);

    if (speechOk) {
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Respect OS reduced motion as default when no stored pref
    if (
      !localStorage.getItem(STORAGE_KEY) &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const next = { ...loaded, reducedMotion: true };
      setPrefs(next);
      applyDomClasses(next);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    applyDomClasses(prefs);
  }, [prefs, hydrated]);

  useEffect(() => {
    isReadingRef.current = isReading;
  }, [isReading]);

  // Reading guide mouse follow
  useEffect(() => {
    if (!prefs.readingGuide) return;
    const onMove = (e: MouseEvent) => {
      guideYRef.current = e.clientY;
      document.documentElement.style.setProperty("--a11y-guide-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefs.readingGuide]);

  const setPref = useCallback(<K extends keyof AccessibilityPrefs>(key: K, value: AccessibilityPrefs[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("ouk_access_contrast");
    localStorage.removeItem("ouk_access_dyslexic");
    localStorage.removeItem("ouk_access_fontsize");
  }, []);

  const toggleHighContrast = () => {
    setPrefs((prev) => ({
      ...prev,
      colorTheme: prev.colorTheme === "high-contrast" ? "default" : "high-contrast",
    }));
  };

  const toggleDyslexicFont = () => {
    setPrefs((prev) => ({ ...prev, dyslexicFont: !prev.dyslexicFont }));
  };

  const setFontSize = (size: FontSize) => setPref("fontSize", size);

  const getNaturalVoice = () => {
    const voices = voicesRef.current;
    if (!voices.length) return null;
    return (
      voices.find((v) => v.name.includes("Premium") || v.name.includes("Natural")) ||
      voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
    );
  };

  const speakNext = () => {
    if (queueRef.current.length === 0) {
      speakingRef.current = false;
      setTimeout(() => {
        if (isReadingRef.current && !speakingRef.current) readNextElement();
      }, 500);
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
    utterance.onend = () => {
      setTimeout(() => {
        if (speakingRef.current && isReadingRef.current) speakNext();
      }, 300);
    };
    utterance.onerror = () => {
      if (speakingRef.current && isReadingRef.current) speakNext();
    };
    window.speechSynthesis.speak(utterance);
  };

  const enqueueText = (text: string) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    sentences.forEach((sentence) => {
      const clean = sentence.trim();
      if (clean.length > 0) queueRef.current.push(clean);
    });
    if (!speakingRef.current) speakNext();
  };

  const clearHighlight = () => {
    if (readingElementRef.current) {
      const el = readingElementRef.current as HTMLElement;
      el.style.outline = "";
      el.style.backgroundColor = "";
      el.style.borderRadius = "";
      el.removeAttribute("data-a11y-reading");
      readingElementRef.current = null;
    }
  };

  const getReadableElements = () => {
    let elements = Array.from(
      document.querySelectorAll(
        "main h1, main h2, main h3, main h4, main h5, main h6, main p, main li, main blockquote, main td, main th, [data-a11y-readable]",
      ),
    );
    if (!elements.length) {
      elements = Array.from(
        document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, blockquote"),
      );
    }
    return elements.filter((el) => {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0")
        return false;
      return ((el as HTMLElement).innerText?.trim() || "").length >= 3;
    });
  };

  const readNextElement = () => {
    if (!isReadingRef.current) return;
    const elements = getReadableElements();
    if (readingElementRef.current) {
      const currentIndex = elements.indexOf(readingElementRef.current);
      if (currentIndex !== -1 && currentIndex + 1 < elements.length) {
        elements[currentIndex + 1].scrollIntoView({
          behavior: prefs.reducedMotion ? "auto" : "smooth",
          block: "center",
        });
      } else {
        setIsReading(false);
      }
    }
  };

  const readFocusedElement = () => {
    const elements = getReadableElements();
    const windowHeight = window.innerHeight;
    const center = windowHeight / 2;
    let closest: Element | null = null;
    let minDistance = Infinity;
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
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
      clearHighlight();
      const htmlEl = closest as HTMLElement;
      htmlEl.style.outline = "2px solid #037b90";
      htmlEl.style.outlineOffset = "4px";
      htmlEl.style.backgroundColor = "rgba(3, 123, 144, 0.08)";
      htmlEl.setAttribute("data-a11y-reading", "true");
      readingElementRef.current = closest;
      window.speechSynthesis.cancel();
      queueRef.current = [];
      speakingRef.current = false;
      enqueueText(htmlEl.innerText);
    }
  };

  const handleScroll = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(readFocusedElement, 400);
  };

  useEffect(() => {
    if (isReading) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      readFocusedElement();
    } else {
      window.removeEventListener("scroll", handleScroll);
      window.speechSynthesis?.cancel();
      queueRef.current = [];
      speakingRef.current = false;
      clearHighlight();
    }
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReading, prefs.reducedMotion]);

  const readPage = () => {
    if (!speechSupported) return;
    setIsReading(true);
  };

  const stopReading = () => setIsReading(false);

  const readSelection = () => {
    if (!speechSupported) return;
    const sel = window.getSelection()?.toString()?.trim();
    if (!sel) {
      readPage();
      return;
    }
    window.speechSynthesis.cancel();
    queueRef.current = [];
    speakingRef.current = false;
    setIsReading(true);
    enqueueText(sel);
  };

  const stopVoiceNav = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setIsListening(false);
  };

  const startVoiceNav = () => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    stopVoiceNav();
    const recognition = new SR();
    recognition.lang = document.documentElement.lang || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = String(event.results?.[0]?.[0]?.transcript || "")
        .toLowerCase()
        .trim();
      const map: Record<string, string> = {
        home: "/",
        "the project": "/the-project",
        about: "/the-project",
        partners: "/partners",
        "work packages": "/work-packages",
        events: "/events",
        documents: "/documents",
        news: "/news",
        contact: "/contact",
        map: "/map",
        dashboard: "/dashboard",
        search: "/search",
        gallery: "/gallery",
        media: "/media",
      };
      for (const [phrase, href] of Object.entries(map)) {
        if (transcript.includes(phrase)) {
          window.location.href = href;
          stopVoiceNav();
          return;
        }
      }
      if (transcript.includes("read") || transcript.includes("speak")) {
        readPage();
      }
      if (transcript.includes("stop")) {
        stopReading();
        stopVoiceNav();
      }
      if (transcript.includes("accessibility") || transcript.includes("settings")) {
        setOpenPanel(true);
      }
    };
    recognition.onerror = () => stopVoiceNav();
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Keyboard shortcut: Alt+A opens panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setOpenPanel((v) => !v);
      }
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (isReadingRef.current) stopReading();
        else readPage();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechSupported]);

  const value: AccessibilityContextType = {
    ...prefs,
    setPref,
    resetPrefs,
    highContrast: prefs.colorTheme === "high-contrast",
    toggleHighContrast,
    setFontSize,
    toggleDyslexicFont,
    isReading,
    readPage,
    stopReading,
    readSelection,
    isListening,
    startVoiceNav,
    stopVoiceNav,
    voiceSupported,
    speechSupported,
    openPanel,
    setOpenPanel,
  };

  return (
    <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
