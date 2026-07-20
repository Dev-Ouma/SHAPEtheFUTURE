"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Send, X, Bot, User, Sparkles, Minus,
  Paperclip, Headphones, ChevronRight, ExternalLink, Loader2, Smile
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { useTranslations } from "next-intl";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ChatLink { label: string; url: string; }
interface ChatMessage {
  id: string | number;
  text: string;
  sender: "bot" | "user" | "agent" | "system";
  agentName?: string;
  timestamp: Date;
  links?: ChatLink[];
  suggestions?: string[];
  file?: { name: string; url: string; type: string };
  isUploading?: boolean;
}

// Render text with clickable URLs and Typewriter effect
const TypewriterText = ({ text, sender, onComplete }: { text: string, sender: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  useEffect(() => {
    if (sender === "user" || sender === "system") {
      setDisplayedText(text);
      onComplete?.();
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 20); // 20ms per char for a snappy but natural feel
    return () => clearInterval(interval);
  }, [text, sender]);

  return (
    <>
      {displayedText.split(urlRegex).map((part, i) =>
        part.match(urlRegex) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer"
            className={`underline underline-offset-2 break-all ${sender === "user" ? "text-white/80 hover:text-white" : "text-primary hover:text-[#ff7f50]"}`}>
            {part}
          </a>
        ) : part
      )}
    </>
  );
};

export default function Chatbot() {
  const t = useTranslations("Chatbot");
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [humanJoined, setHumanJoined] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  useEffect(() => {
    let sid = localStorage.getItem("ouk_chat_session");
    if (!sid) { sid = crypto.randomUUID(); localStorage.setItem("ouk_chat_session", sid); }
    setSessionId(sid);

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_session", { session_id: sid });
    });

    newSocket.on("new_message", (msg: any) => {
      const newMsg: ChatMessage = {
        id: Date.now() + Math.random(),
        text: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp),
        links: msg.links || [],
        suggestions: msg.suggestions || [],
      };
      setMessages(prev => [...prev, newMsg]);
      if (!isOpenRef.current) setUnreadCount(c => c + 1);
    });

    newSocket.on("typing", (data: any) => {
      if (data.is_typing) {
        setIsTyping(true);
      } else {
        // Enforce a minimum typing duration for better UX
        setTimeout(() => setIsTyping(false), 800);
      }
    });
    newSocket.on("agent_joined", (data: any) => {
      setHumanJoined(true);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: t("agentJoined", { name: data.agent_name || t("agentJoinedFallback") }),
        sender: "system",
        timestamp: new Date(),
      }]);
    });
    newSocket.on("agent_left", () => {
      setHumanJoined(false);
      setMessages(prev => [...prev, {
        id: Date.now(), text: t("agentLeft"), sender: "bot", timestamp: new Date(),
      }]);
    });

    return () => { newSocket.close(); };
  }, [t]);

  // Welcome / locale-aware chrome message (don't clobber an active conversation)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((prev) => {
        if (prev.some((m) => m.sender === "user" || m.sender === "agent")) return prev;
        return [{
          id: "welcome",
          text: t("welcome"),
          sender: "bot",
          timestamp: new Date(),
          suggestions: [
            t("suggestProgrammes"),
            t("suggestApply"),
            t("suggestFees"),
            t("suggestIntakes"),
          ],
          links: [
            { label: t("linkBrowseProgrammes"), url: "/programmes" },
            { label: t("linkHowToApply"), url: "/admissions/how-to-apply" },
          ],
        }];
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [t]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender: "user", timestamp: new Date() }]);
  };

  const handleSend = (text?: string) => {
    const msg = (text || inputValue).trim();
    if (!msg || !socket || !sessionId) return;
    addUserMessage(msg);
    socket.emit("user_message", { session_id: sessionId, content: msg, platform: "portal" });
    setInputValue("");
  };

  const handleSuggestion = (suggestion: string) => {
    // Navigational chips — EN + SW labels (display locale), paths stay locale-aware via router
    const navMap: Record<string, string> = {
      "view programmes": "/programmes",
      "browse programmes": "/programmes",
      "how to apply": "/admissions/how-to-apply",
      "entry requirements": "/admissions/entry-requirements",
      "fee structure": "/admissions/fees",
      "contact support": "/contact",
      "apply now": "/admissions/how-to-apply",
      [t("navViewProgrammes")]: "/programmes",
      [t("navBrowseProgrammes")]: "/programmes",
      [t("navHowToApply")]: "/admissions/how-to-apply",
      [t("navEntryRequirements")]: "/admissions/entry-requirements",
      [t("navFeeStructure")]: "/admissions/fees",
      [t("navContactSupport")]: "/contact",
      [t("navApplyNow")]: "/admissions/how-to-apply",
      [t("linkBrowseProgrammes").toLowerCase()]: "/programmes",
      [t("linkHowToApply").toLowerCase()]: "/admissions/how-to-apply",
      [t("suggestProgrammes").toLowerCase()]: "/programmes",
      [t("suggestApply").toLowerCase()]: "/admissions/how-to-apply",
      [t("suggestFees").toLowerCase()]: "/admissions/fees",
    };

    const cleanS = suggestion.toLowerCase().trim();
    if (navMap[cleanS]) {
      router.push(navMap[cleanS]);
      return;
    }

    // Default: send as message
    handleSend(suggestion);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    // Create placeholder with loading state
    const tempId = Date.now();
    setMessages(prev => [...prev, {
      id: tempId,
      text: t("uploading", { name: file.name }),
      sender: "user",
      timestamp: new Date(),
      isUploading: true
    }]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", sessionId);

    try {
      const res = await fetch(`${BASE_URL}/uploads/chat`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      setMessages(prev => prev.map(m => m.id === tempId ? {
        ...m,
        text: t("uploadOk", { name: file.name }),
        isUploading: false,
        file: { name: file.name, url: data.url, type: 'image/webp' }
      } : m));

      // 4. Intelligence Insight
      if (data.analysis) {
        const extracted = data.analysis.extracted_text
          ? `\n\n${t("extractedText", { text: data.analysis.extracted_text.slice(0, 100) })}`
          : "";
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: "bot",
          text: `${t("imageAnalyzed", { classification: data.analysis.classification })}.${extracted}\n\n${t("howProceed")}`,
          timestamp: new Date(),
          suggestions: data.analysis.suggestions || []
        }]);
      }

      if (socket) socket.emit("user_message", { 
        session_id: sessionId, 
        content: `[File: ${file.name}] ${data.url}`, 
        platform: "portal" 
      });
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === tempId ? {
        ...m,
        text: t("uploadFail"),
        isUploading: false
      } : m));
    }
    e.target.value = "";
  };

  const handleRequestAgent = () => {
    if (!socket || !sessionId) return;
    socket.emit("request_agent", { session_id: sessionId });
    setMessages(prev => [...prev, {
      id: Date.now(), text: t("connectingAgent"), sender: "bot", timestamp: new Date(),
    }]);
  };

  return (
    <div className="fixed bottom-8 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-[380px] max-h-[90vh] bg-white shadow-2xl flex flex-col mb-4 border border-slate-100 overflow-hidden"
            style={{ borderRadius: "16px" }}
          >
            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                    <Bot size={18} className="text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <p className="font-black text-white text-[11px] uppercase tracking-widest">{t("title")}</p>
                  <p className="text-[9px] text-green-400 font-bold uppercase tracking-widest animate-pulse">
                    {humanJoined ? t("statusAgentOnline") : t("statusAiOnline")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!humanJoined && (
                  <button onClick={handleRequestAgent} title={t("talkToHumanAria")}
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <Headphones size={16} />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Minus size={16} />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white" style={{ minHeight: "0", maxHeight: "460px" }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} group`}>
                  <div className={`max-w-[85%] space-y-2`}>
                    {/* Bubble */}
                    {msg.sender === "system" ? (
                      <div className="flex justify-center my-2">
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          {msg.text}
                        </span>
                      </div>
                    ) : (
                      <>
                        {msg.sender !== "user" && (
                          <div className="flex items-center space-x-2 mb-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.sender === "agent" ? "bg-primary/20" : "bg-primary/10"}`}>
                              {msg.sender === "agent" ? <Headphones size={11} className="text-primary" /> : <Bot size={11} className="text-primary" />}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              {msg.sender === "agent" ? (msg.agentName || t("supportAgent")) : t("title")}
                            </span>
                          </div>
                        )}
                        <div className={`px-4 py-3 text-[13px] leading-relaxed font-medium break-words relative ${
                          msg.sender === "user"
                            ? "bg-gradient-to-br from-primary to-[#ff7f50] text-white shadow-md shadow-primary/20 rounded-2xl rounded-tr-sm"
                            : msg.sender === "agent"
                              ? "bg-slate-800 text-white shadow-lg rounded-2xl rounded-tl-sm border-l-4 border-primary"
                              : "bg-white border border-slate-100 text-slate-800 shadow-sm rounded-2xl rounded-tl-sm"
                        }`}>
                          {msg.isUploading && <Loader2 size={12} className="inline mr-2 animate-spin" />}
                          <TypewriterText text={msg.text} sender={msg.sender} />
                        </div>
                      </>
                    )}

                    {/* Links */}
                    {msg.links && msg.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.links.map((link, i) => {
                          const isExternal = /^https?:\/\//i.test(link.url) || link.url.startsWith("//");
                          const className = "inline-flex items-center space-x-1.5 bg-white border border-primary/30 text-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm group/link";
                          if (isExternal) {
                            return (
                              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className={className}>
                                <span>{link.label}</span>
                                <ExternalLink size={10} className="group-hover/link:scale-110 transition-transform" />
                              </a>
                            );
                          }
                          return (
                            <Link key={i} href={link.url.startsWith("/") ? link.url : `/${link.url}`} className={className}>
                              <span>{link.label}</span>
                              <ExternalLink size={10} className="group-hover/link:scale-110 transition-transform" />
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {/* Suggestion chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 mt-3">
                        {msg.suggestions.map((s, i) => (
                          <button key={i} onClick={() => handleSuggestion(s)}
                            className="bg-white border-2 border-slate-100 text-slate-700 px-4 py-2 rounded-xl text-[11px] font-bold hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95">
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-[8px] text-slate-400 font-medium px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1.5">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Input ── */}
            <div className="p-4 border-t border-slate-100 bg-white space-y-2 relative">
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.9 }}
                    className="absolute bottom-full left-4 right-4 mb-3 bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl p-4 grid grid-cols-6 gap-3 z-[110]"
                  >
                    {["😊", "👋", "🎓", "📘", "✅", "⚠️", "🤝", "🚀", "💡", "❓", "🙏", "✨", "🔥", "💯", "🎉", "📅", "📍", "✉️"].map(emoji => (
                      <button key={emoji} onClick={() => { setInputValue(prev => prev + emoji); setShowEmojiPicker(false); }}
                        className="text-2xl hover:bg-primary/10 p-2 rounded-lg transition-all active:scale-90 hover:scale-110">
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center space-x-2 bg-slate-50 rounded-2xl border-2 border-slate-100 focus-within:border-primary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`pl-4 ${showEmojiPicker ? 'text-primary' : 'text-slate-400'} hover:text-primary transition-colors flex-shrink-0`}>
                  <Smile size={20} />
                </button>

                {humanJoined && (
                  <>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
                    <button onClick={() => fileInputRef.current?.click()}
                      className="text-slate-400 hover:text-primary transition-colors flex-shrink-0">
                      <Paperclip size={16} />
                    </button>
                  </>
                )}
                <input
                  type="text"
                  placeholder={humanJoined ? t("placeholderAgent") : t("placeholderAi")}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-transparent px-3 py-3 text-[12px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button onClick={() => handleSend()}
                  disabled={!inputValue.trim()}
                  className="m-1.5 w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-[#ff7f50] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/30 flex-shrink-0">
                  <Send size={15} />
                </button>
              </div>

              {!humanJoined && (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-1.5 opacity-50">
                    <Sparkles size={9} className="text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t("poweredBy")}</span>
                  </div>
                  <button onClick={handleRequestAgent}
                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-[#ff7f50] transition-colors flex items-center space-x-1">
                    <Headphones size={10} />
                    <span>{t("talkToAgent")}</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle Button ── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/30 hover:shadow-primary/25 transition-shadow"
      >
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={26} /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageSquare size={26} /></motion.div>
          }
        </AnimatePresence>
        {unreadCount > 0 && !isOpen && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
            {unreadCount}
          </motion.span>
        )}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </motion.button>
    </div>
  );
}
