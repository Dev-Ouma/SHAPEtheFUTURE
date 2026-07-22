"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, HelpCircle, MessageSquare, Accessibility, 
  Send, User, Bot, Volume2, VolumeX, Eye, Type, Languages, 
  Minus, Smile, Paperclip, Star, ChevronDown
} from "lucide-react";
import { useAccessibility } from "../accessibility/AccessibilityProvider";
import { postApi } from "@/lib/api";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { useLocale, useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useRouter } from "@/i18n/routing";
import {
  GT_LANGUAGES,
  clearGoogTransCookies,
  readGoogTransTarget,
  setGoogTransCookie,
} from "@/lib/googtrans";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── Sub-Panel: Chatbot ───────────────────────────────────────────────────
// Render text with clickable URLs (fallback for user messages)
const renderText = (text: string, role: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) =>
    part.match(urlRegex) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
        className={`underline underline-offset-2 break-all ${role === "user" ? "text-white/80 hover:text-white" : "text-primary hover:text-[#ff7f50]"}`}>
        {part}
      </a>
    ) : part
  );
};

// Markdown component styling configuration
const MarkdownComponents = {
  a: ({ node, ...props }: any) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-[#ff7f50] underline underline-offset-2 break-words" />,
  strong: ({ node, ...props }: any) => <strong {...props} className="font-bold text-slate-800" />,
  p: ({ node, ...props }: any) => <p {...props} className="mb-2 last:mb-0" />,
  ul: ({ node, ...props }: any) => <ul {...props} className="list-disc pl-4 mb-2 space-y-1" />,
  ol: ({ node, ...props }: any) => <ol {...props} className="list-decimal pl-4 mb-2 space-y-1" />,
  li: ({ node, ...props }: any) => <li {...props} />
};

// Typewriter animation with blinking cursor
const TypewriterText = ({ text, sender }: { text: string; sender: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setDone(false);

    if (sender === "user" || sender === "system") {
      setDisplayedText(text);
      setDone(true);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text, sender]);

  return (
    <span>
      {sender === "user" ? (
        renderText(displayedText, sender)
      ) : (
        <div className="text-xs text-slate-700 break-words whitespace-pre-wrap">
          <ReactMarkdown components={MarkdownComponents}>
            {displayedText}
          </ReactMarkdown>
        </div>
      )}
      {!done && (
        <span
          className="inline-block ml-px w-0.5 h-3.5 bg-current align-middle"
          style={{ animation: "blink 0.75s step-end infinite" }}
        />
      )}
    </span>
  );
};

function ChatPanel({ 
  onClose, 
  messages, 
  setMessages, 
  socket, 
  sessionId, 
  humanJoined,
  agentName,
  agentTyping,
  setHumanJoined,
  isTyping,
  setIsTyping
}: { 
  onClose: () => void,
  messages: any[],
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  socket: Socket | null,
  sessionId: string | null,
  humanJoined: boolean,
  agentName: string | null,
  agentTyping: boolean,
  setHumanJoined: (val: boolean) => void,
  isTyping: boolean,
  setIsTyping: (val: boolean) => void
}) {
  const t = useTranslations("SupportHub");
  const router = useRouter();
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '' });
  const [hasIdentified, setHasIdentified] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roleLabel = (role: string) => {
    if (role === 'user') return t('roleUser');
    if (role === 'bot') return t('roleBot');
    if (role === 'agent') return agentName || t('supportAgent');
    return role;
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, agentTyping]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/chats/thread/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.messages && data.messages.length > 0) {
          setMessages(data.messages.map((m: any) => ({
            role: m.sender,
            text: m.content,
            links: m.links,
            suggestions: m.suggestions,
            timestamp: m.timestamp
          })));
        }
      } catch (err) {
        console.warn('[SupportHub] History fetch deferred:', err);
      }
    };
    
    if (messages.length <= 1) {
      fetchHistory();
    }
  }, [sessionId]);

  // Listen for closure
  useEffect(() => {
    if (socket) {
      socket.on('conversation_closed', () => {
        setShowRating(true);
      });
      return () => { socket.off('conversation_closed'); };
    }
  }, [socket]);

  const handleSend = (textOverride?: string) => {
    const textValue = textOverride || input;
    if (!textValue.trim()) return;
    const userText = textValue.trim();
    const userMsg = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    if (socket) {
      socket.emit('user_message', {
        session_id: sessionId,
        content: userText,
        platform: 'hub',
        guest_name: guestInfo.name || undefined,
        guest_email: guestInfo.email || undefined,
      });
    }

    // Bot response is handled by the server emitting 'typing' + 'new_message'
    // Show typing indicator — safety: clear after 30s if server never responds
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 30000);
  };

  const submitRating = (val: number) => {
    setRating(val);
    if (socket) socket.emit('submit_rating', { session_id: sessionId, rating: val });
    toast.success(t("thankYouFeedback"));
    setTimeout(() => {
      setShowRating(false);
      setHumanJoined(false);
      setMessages(prev => [...prev, { role: 'bot', text: t("handoverDone") }]);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success(t("transmittingFile", { name: file.name }));
    // Placeholder for actual upload logic
  };

  const handleSuggestion = (suggestion: string) => {
    const navMap: Record<string, string> = {
      "view programmes": "/programmes",
      "browse programmes": "/programmes",
      "browse all programmes": "/programmes",
      "view short courses": "/programmes",
      "explore programmes": "/programmes",
      "how to apply": "/admissions/how-to-apply",
      "apply online": "/admissions/how-to-apply",
      "entry requirements": "/admissions/entry-requirements",
      "check requirements": "/admissions/entry-requirements",
      "fee structure": "/admissions/fees",
      "view fee structure": "/admissions/fees",
      "explore scholarships": "/admissions/scholarships",
      "contact support": "/contact",
      "apply now": "/admissions/how-to-apply",
      "view timetable": "/portal/timetable",
      "academic calendar": "/portal/calendar",
    };

    const cleanS = suggestion.toLowerCase().trim();
    if (navMap[cleanS]) {
      router.push(navMap[cleanS]);
      return;
    }

    setInput(suggestion);
    setTimeout(() => { document.getElementById('support-hub-send')?.click(); }, 50);
  };

  return (
    <div className="flex flex-col h-[450px] relative overflow-hidden">
      <AnimatePresence>
        {showRating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Star size={32} />
            </div>
            <h3 className="text-sm font-bold text-primary-darker mb-2">{t("ratingTitle")}</h3>
            <p className="text-[10px] text-slate-500 mb-6">{t("ratingBody")}</p>
            <div className="flex space-x-3 mb-8">
              {[
                { v: 1, e: "😞" },
                { v: 3, e: "😐" },
                { v: 5, e: "😊" }
              ].map(item => (
                <button key={item.v} onClick={() => submitRating(item.v)} className="text-3xl hover:scale-125 transition-transform p-2 grayscale hover:grayscale-0">
                  {item.e}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasIdentified && messages.length <= 1 ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <User size={32} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">{t("welcomeTitle")}</h3>
          <p className="text-[10px] text-slate-500 mb-4">{t("welcomeBody")}</p>
          <div className="w-full space-y-3">
            <input 
              type="text" 
              placeholder={t("nameOptional")} 
              value={guestInfo.name}
              onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <input 
              type="email" 
              placeholder={t("emailOptional")} 
              value={guestInfo.email}
              onChange={e => setGuestInfo({ ...guestInfo, email: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button 
              onClick={() => setHasIdentified(true)} 
              className="w-full p-3 bg-primary text-white rounded-lg text-xs font-bold hover:bg-[#ff7f50] transition-colors"
            >
              {t("startChat")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 text-xs font-medium shadow-sm ${m.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
              <div className="flex items-center space-x-2 mb-1 opacity-70">
                {m.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                <span className="text-[8px] uppercase font-bold tracking-widest">{roleLabel(m.role)}</span>
              </div>
              {m.role === 'user' ? (
                renderText(m.text, m.role)
              ) : (
                <TypewriterText text={m.text} sender={m.role} />
              )}

              {(m as any).suggestions && (m as any).suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(m as any).suggestions.map((s: string, idx: number) => (
                    <button key={idx} onClick={() => handleSuggestion(s)} 
                    className="bg-white border-2 border-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {(isTyping || agentTyping) && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-lg rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
                </div>
                {agentTyping && <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t("agentTyping", { name: agentName || t("roleAgent") })}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 relative">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-3 grid grid-cols-6 gap-2 z-[110]">
              {["😊", "👋", "🎓", "📘", "✅", "⚠️", "🤝", "🚀", "💡", "❓", "🙏", "✨", "🔥", "💯", "🎉"].map(emoji => (
                <button key={emoji} onClick={() => { setInput(prev => prev + emoji); setShowEmojiPicker(false); }} className="text-lg hover:bg-slate-50 p-1.5 rounded transition-colors">{emoji}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all overflow-hidden">
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`pl-3 ${showEmojiPicker ? 'text-primary' : 'text-slate-400'} hover:text-primary transition-colors`}><Smile size={18} /></button>
          
          {humanJoined && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-primary transition-colors"><Paperclip size={18} /></button>
            </>
          )}

          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={t("typeQuestion")} className="flex-1 bg-transparent p-3 text-xs outline-none" />
          <button id="support-hub-send" onClick={() => handleSend()} className="bg-primary text-white p-3 hover:bg-[#ff7f50] hover:text-white transition-colors"><Send size={16} /></button>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// ─── Sub-Panel: Accessibility
function AccessibilityPanel() {
  const { highContrast, toggleHighContrast, fontSize, setFontSize, dyslexicFont, toggleDyslexicFont, isReading, readPage, stopReading } = useAccessibility();
  const tCommon = useTranslations("Common");
  const t = useTranslations("SupportHub");
  const locale = useLocale();
  const [gtLang, setGtLang] = useState("");
  const [swAssist, setSwAssist] = useState(false);

  useEffect(() => {
    const code = readGoogTransTarget();
    if (code === "sw") {
      setSwAssist(true);
      setGtLang("");
      return;
    }
    if (code && code !== "en") {
      setGtLang(code);
      setSwAssist(false);
    }
  }, []);

  const handleGoogleTranslate = (code: string) => {
    setGtLang(code);
    setSwAssist(false);
    if (!code) {
      clearGoogTransCookies();
    } else {
      setGoogTransCookie(code);
    }
    window.location.reload();
  };

  const toggleSwLeftoverAssist = () => {
    if (locale !== "sw") return;
    const next = !swAssist;
    if (next) {
      setGoogTransCookie("sw");
      setSwAssist(true);
      setGtLang("");
    } else {
      clearGoogTransCookies();
      setSwAssist(false);
    }
    window.location.reload();
  };

  const adjustFontSize = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (fontSize === 'normal') setFontSize('large');
      else if (fontSize === 'large') setFontSize('xlarge');
    } else {
      if (fontSize === 'xlarge') setFontSize('large');
      else if (fontSize === 'large') setFontSize('normal');
    }
  };

  const fontSizeLabel =
    fontSize === 'large' ? t('fontLarge') : fontSize === 'xlarge' ? t('fontXlarge') : t('fontNormal');

  return (
    <div className="p-6 space-y-6 notranslate" data-no-translate translate="no">
      <div className="flex justify-between items-center"><div className="flex items-center space-x-3 text-sm font-bold text-slate-700"><Eye size={16} /><span>{t("highContrast")}</span></div><button type="button" aria-pressed={highContrast} aria-label={t("toggleHighContrastAria")} onClick={toggleHighContrast} className={`w-12 h-6 rounded-full transition-colors relative ${highContrast ? 'bg-secondary' : 'bg-slate-200'}`}><div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${highContrast ? 'left-7' : 'left-1'}`} /></button></div>
      <div className="space-y-2"><div className="flex items-center space-x-3 text-sm font-bold text-slate-700"><Type size={16} /><span>{t("textSize")}</span></div><div className="flex items-center space-x-4 bg-slate-50 p-2 justify-between"><button type="button" aria-label={t("decreaseTextAria")} onClick={() => adjustFontSize('down')} disabled={fontSize === 'normal'} className="p-2 text-slate-500 hover:text-white disabled:opacity-30 transition-colors"><Minus size={16} /></button><span className="text-[10px] font-black uppercase tracking-widest text-primary">{fontSizeLabel}</span><button type="button" aria-label={t("increaseTextAria")} onClick={() => adjustFontSize('up')} disabled={fontSize === 'xlarge'} className="p-2 text-slate-500 hover:text-white disabled:opacity-30 transition-colors"><Plus size={16} /></button></div></div>
      <div className="flex justify-between items-center"><div className="flex items-center space-x-3 text-sm font-bold text-slate-700"><Type size={16} /><span>{t("dyslexiaFont")}</span></div><button type="button" aria-pressed={dyslexicFont} aria-label={t("toggleDyslexiaAria")} onClick={toggleDyslexicFont} className={`w-12 h-6 rounded-full transition-colors relative ${dyslexicFont ? 'bg-secondary' : 'bg-slate-200'}`}><div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${dyslexicFont ? 'left-7' : 'left-1'}`} /></button></div>
      <div className="flex justify-between items-center pt-4 border-t border-slate-100"><div className="flex items-center space-x-3 text-sm font-bold text-slate-700">{isReading ? <Volume2 size={16} className="text-secondary animate-pulse" /> : <VolumeX size={16} />}<span>{t("screenReader")}</span></div><button type="button" aria-pressed={isReading} aria-label={isReading ? t("stopReadingAria") : t("readPageAria")} onClick={isReading ? stopReading : readPage} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 transition-colors ${isReading ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{isReading ? t("stop") : t("readPage")}</button></div>

      <div className="pt-6 border-t border-slate-100 space-y-3">
        <div className="flex items-center space-x-3 text-sm font-bold text-slate-700">
          <Languages size={16} className="text-primary" />
          <span>{tCommon("language")}</span>
        </div>
        <LocaleSwitcher />
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          {t("i18nLanguageHint")}
        </p>
        {locale === "sw" && (
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-100 bg-slate-50/90 px-3 py-3">
            <input
              type="checkbox"
              checked={swAssist}
              onChange={toggleSwLeftoverAssist}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--primary,#0f766e)]"
            />
            <span>
              <span className="block text-[11px] font-bold text-slate-700 leading-snug">
                {t("swLeftoverAssist")}
              </span>
              <span className="mt-1 block text-[10px] font-medium text-slate-500 leading-snug">
                {t("swLeftoverAssistHint")}
              </span>
            </span>
          </label>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center space-x-3 text-sm font-bold text-slate-700">
          <Languages size={16} className="text-primary" />
          <span>{t("googleTranslateMore")}</span>
        </div>
        <div className="relative">
          <select
            value={gtLang}
            onChange={(e) => handleGoogleTranslate(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-200 px-4 py-3 pr-10 text-xs font-bold text-slate-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer hover:bg-white"
            aria-label={t("googleTranslateMore")}
          >
            <option value="">{t("googleTranslateOff")}</option>
            {GT_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronDown size={14} />
          </div>
        </div>
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          {t("googleTranslateHint")}
        </p>
      </div>
    </div>
  );
}




// ─── Main Unified Widget ──────────────────────────────────────────────────

export default function InstitutionalSupport() {
  const t = useTranslations("SupportHub");
  const tRef = useRef(t);
  tRef.current = t;
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'chat' | 'access'>('menu');
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [humanJoined, setHumanJoined] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  /** Connect Socket.IO only after the user opens chat — not on every page load. */
  const [chatEnabled, setChatEnabled] = useState(false);

  // Seed / refresh greeting when locale chrome changes and user hasn't chatted yet
  useEffect(() => {
    setMessages((prev) => {
      const hasUser = prev.some((m) => m.role === 'user');
      if (hasUser) return prev;
      return [{ role: 'bot', text: t('botGreeting') }];
    });
  }, [t]);

  useEffect(() => {
    if (activeTab === 'chat') setChatEnabled(true);
  }, [activeTab]);

  useEffect(() => {
    if (!chatEnabled) return;

    let sid = localStorage.getItem('ouk_support_session');
    if (!sid) {
      sid = Math.random().toString(36).substring(2);
      localStorage.setItem('ouk_support_session', sid);
    }
    setSessionId(sid);

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });
    setSocket(newSocket);
    newSocket.emit('join_session', { session_id: sid });

    newSocket.on('typing', (data: { is_typing: boolean }) => {
      setIsTyping(data.is_typing);
    });

    newSocket.on('new_message', (msg) => {
      setIsTyping(false); // Clear typing indicator whenever ANY message arrives
      if (msg.sender === 'agent' || msg.sender === 'bot') {
        setMessages(prev => {
          const exists = prev.some(
            m =>
              m.text === msg.content &&
              Math.abs(new Date(m.timestamp || 0).getTime() - new Date(msg.timestamp).getTime()) < 2000
          );
          if (exists) return prev;
          return [
            ...prev,
            {
              role: msg.sender,
              text: msg.content,
              links: msg.links,
              suggestions: msg.suggestions,
              timestamp: msg.timestamp,
              isNew: true,
            },
          ];
        });
        if (msg.sender === 'agent') setHumanJoined(true);
      }
    });

    newSocket.on('agent_joined', (data) => {
      setHumanJoined(true);
      setAgentName(data.agent_name);
      const name = data.agent_name || tRef.current('agentJoinedFallback');
      setMessages(prev => [...prev, { role: 'bot', text: tRef.current('agentJoined', { name }) }]);
    });

    newSocket.on('agent_typing', (data) => {
      setAgentTyping(data.is_typing);
    });

    return () => {
      newSocket.close();
      setSocket(null);
    };
  }, [chatEnabled]);

  useEffect(() => {
    const handleOpenAccess = () => { setIsOpen(true); setActiveTab('access'); };
    window.addEventListener('open-hub-access', handleOpenAccess);
    return () => window.removeEventListener('open-hub-access', handleOpenAccess);
  }, []);

  const toggle = () => { setIsOpen(!isOpen); if (!isOpen) setActiveTab('menu'); };

  return (
    <div className="fixed bottom-6 right-6 z-[200] font-sans max-sm:bottom-4 max-sm:right-4">
      <div className={`absolute bottom-20 right-0 w-80 bg-white shadow-2xl overflow-hidden border border-slate-200 transition-all duration-500 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-90 translate-y-10 invisible pointer-events-none'}`}>
        <div className="bg-primary-darker p-6 text-white flex justify-between items-center group">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center"><span className="text-white font-black">U</span></div>
            <div><h3 className="text-xs font-black uppercase tracking-widest text-white leading-none">{t("hubTitle")}</h3><p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{t("hubSubtitle")}</p></div>
          </div>
          <button onClick={toggle} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        {activeTab !== 'menu' && (
          <button onClick={() => setActiveTab('menu')} className="w-full bg-slate-50 p-3 text-[10px] font-black uppercase tracking-widest text-primary flex items-center justify-center space-x-2 border-b border-slate-100 hover:bg-slate-100 transition-colors"><span>{t("backToHub")}</span></button>
        )}

        <div className="bg-white">
          {activeTab === 'menu' && (
            <div className="p-4 space-y-3">
              <button onClick={() => setActiveTab('chat')} className="w-full text-left p-6 bg-slate-50 hover:bg-primary-darker hover:text-white group transition-all duration-300 relative overflow-hidden">
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white flex items-center justify-center shadow-md text-primary group-hover:scale-110 transition-transform"><MessageSquare size={24} /></div>
                  <div><p className="text-xs font-black text-primary-darker uppercase tracking-widest group-hover:text-white">{t("aiAdvisor")}</p><p className="text-[10px] text-slate-400 group-hover:text-white font-bold uppercase mt-1">{t("aiAdvisorDesc")}</p></div>
                </div>
                <div className="absolute inset-0 bg-primary-darker opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button onClick={() => setActiveTab('access')} className="w-full text-left p-6 bg-slate-50 hover:bg-primary-darker hover:text-white group transition-all duration-300 relative overflow-hidden">
                <div className="relative z-10 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white flex items-center justify-center shadow-md text-primary-darker group-hover:scale-110 transition-transform"><Accessibility size={24} /></div>
                  <div><p className="text-xs font-black text-primary-darker uppercase tracking-widest group-hover:text-white">{t("accessibility")}</p><p className="text-[10px] text-slate-400 group-hover:text-white font-bold uppercase mt-1">{t("accessibilityDesc")}</p></div>
                </div>
                <div className="absolute inset-0 bg-primary-darker opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}
          {activeTab === 'chat' && (
            <ChatPanel 
              onClose={toggle} 
              messages={messages} 
              setMessages={setMessages} 
              socket={socket} 
              sessionId={sessionId} 
              humanJoined={humanJoined} 
              agentName={agentName} 
              agentTyping={agentTyping} 
              setHumanJoined={setHumanJoined}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
            />
          )}
          <div className={activeTab === 'access' ? 'block' : 'hidden'}><AccessibilityPanel /></div>
        </div>
        <div className="p-4 bg-primary-darker text-center border-t border-white/5"><p className="text-[8px] font-black uppercase tracking-[2px] text-slate-400 " suppressHydrationWarning>{t("copyright", { year: new Date().getFullYear() })}</p></div>
      </div>
      <div className="relative">
        {!isOpen && <span className="absolute inset-0 rounded-full animate-ping bg-primary/40 pointer-events-none" />}
        <button onClick={toggle} aria-expanded={isOpen} aria-label={isOpen ? t("closeHubAria") : t("openHubAria")} className={`relative w-16 h-16 max-sm:w-14 max-sm:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group overflow-hidden ${isOpen ? 'bg-primary-darker scale-90' : 'bg-primary hover:bg-[#ff7f50] hover:text-white hover:scale-105'}`}>
          <div className={`absolute inset-0 bg-white/20 group-hover:scale-150 transition-transform duration-700 rounded-full`} />
          <AnimatePresence mode="wait">{isOpen ? (<motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={28} className="relative z-10 text-white" /></motion.div>) : (<motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center space-x-1"><HelpCircle size={28} className="relative z-10 text-white" /></motion.div>)}</AnimatePresence>
        </button>
      </div>
    </div>
  );
}
