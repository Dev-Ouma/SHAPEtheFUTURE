"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, ChevronDown, Sparkles,
  User, Bot, ArrowRight, Loader2, ExternalLink
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLocale, useTranslations } from "next-intl";

// Typewriter animation — renders plain text char-by-char, then switches to ReactMarkdown when done
const TypewriterMessage = ({
  content,
  isTyping,
  onDone,
}: {
  content: string;
  isTyping: boolean;
  onDone?: () => void;
}) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(!isTyping);

  useEffect(() => {
    if (!isTyping) {
      setDisplayed(content);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);
    let i = 0;

    const interval = setInterval(() => {
      i += 2;
      if (i >= content.length) {
        setDisplayed(content);
        setDone(true);
        clearInterval(interval);
        onDone?.();
      } else {
        setDisplayed(content.slice(0, i));
      }
    }, 18);

    return () => clearInterval(interval);
  }, [content, isTyping]); // eslint-disable-line react-hooks/exhaustive-deps

  if (done) {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }

  // During animation: render plain text + blinking cursor to avoid broken markdown tags
  return (
    <span className="whitespace-pre-wrap">
      {displayed}
      <span className="inline-block w-[2px] h-[1em] bg-current align-middle ml-[1px] animate-pulse" />
    </span>
  );
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  sources?: { title: string; url: string }[];
  timestamp: Date;
  isNew?: boolean; // flag to trigger typing animation
}

export default function AiAdvisorChat() {
  const t = useTranslations("AiAdvisor");
  const locale = useLocale();

  const welcomeMessage = useMemo<Message>(() => ({
    id: "welcome",
    role: "assistant",
    content: t("welcome"),
    suggestions: [
      t("suggestProgrammes"),
      t("suggestApply"),
      t("suggestFees"),
      t("suggestSupport"),
    ],
    timestamp: new Date(),
  }), [t, locale]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset welcome chrome when locale changes (keep conversation only if user already chatted)
  useEffect(() => {
    setMessages((prev) => {
      const hasUser = prev.some((m) => m.role === "user");
      if (hasUser) return prev;
      return [welcomeMessage];
    });
  }, [welcomeMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build history from last 10 messages (5 exchanges)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history, locale }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        suggestions: data.suggestions,
        sources: data.sources,
        timestamp: new Date(),
        isNew: true, // will trigger typing effect
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If escalation recommended, append a human handoff prompt
      if (data.escalate) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              role: "assistant",
              content: t("escalatePrompt"),
              suggestions: [t("suggestYesConnect"), t("suggestNoFine")],
              timestamp: new Date(),
              isNew: true,
            },
          ]);
        }, 1500);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("errorConnect"),
          suggestions: [t("suggestTryAgain"), t("suggestSupport")],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 ${isOpen ? "scale-0 pointer-events-none" : "scale-100"}`}
        style={{ background: "linear-gradient(135deg, #1e234a, #0f3a3d)" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t("openAria")}
      >
        <div className="relative">
          <MessageCircle size={28} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white" />
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] flex flex-col shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden"
            style={{ height: isMinimized ? "auto" : "580px" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1e234a, #0f3a3d)" }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{t("title")}</p>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/60 text-[10px] font-medium">{t("statusOnline")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={t("minimizeAria")}
                >
                  <ChevronDown size={16} className={`text-white transition-transform ${isMinimized ? "rotate-180" : ""}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={t("closeAria")}
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e234a, #0f3a3d)" }}>
                          <Bot size={14} className="text-white" />
                        </div>
                      )}

                      <div className={`max-w-[85%] flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "text-white rounded-br-sm"
                              : "bg-white border border-slate-100 text-slate-700 shadow-sm rounded-bl-sm"
                          }`}
                          style={msg.role === "user" ? { background: "linear-gradient(135deg, #1e234a, #0f3a3d)" } : {}}
                        >
                          {msg.role === "assistant" ? (
                            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                              <TypewriterMessage
                                content={msg.content}
                                isTyping={!!msg.isNew}
                                onDone={() =>
                                  setMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id ? { ...m, isNew: false } : m
                                    )
                                  )
                                }
                              />
                            </div>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>

                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-primary font-semibold bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1 transition-colors"
                              >
                                <ExternalLink size={9} />
                                {src.title}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Suggestion chips */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestions.map((s, i) => (
                              <button
                                key={i}
                                onClick={() => sendMessage(s)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/40 text-slate-600 hover:text-primary rounded-full px-3 py-1.5 transition-all"
                              >
                                {s}
                                <ArrowRight size={10} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 bg-slate-200 flex items-center justify-center">
                          <User size={14} className="text-slate-500" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e234a, #0f3a3d)" }}>
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-slate-100 p-3 flex-shrink-0">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200 focus-within:border-primary/50 transition-colors">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t("placeholder")}
                      className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #1e234a, #0f3a3d)" }}
                      aria-label={t("sendAria")}
                    >
                      {isLoading ? (
                        <Loader2 size={15} className="text-white animate-spin" />
                      ) : (
                        <Send size={15} className="text-white" />
                      )}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 text-center mt-2">{t("footerNote")}</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
