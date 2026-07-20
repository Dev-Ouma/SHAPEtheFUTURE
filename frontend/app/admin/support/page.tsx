"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  User,
  CheckCircle2,
  Archive,
  Send,
  Bot,
  ShieldCheck,
  Search,
  ChevronRight,
  MessageCircle,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { getApi, patchApi } from '@/lib/api';
import toast from 'react-hot-toast';
import PermissionGate from '@/components/admin/PermissionGate';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

// Combines the old separate "Chat Intelligence" registry (/admin/chats) and
// "Technical Support" live inbox — both were two different UIs over the same
// /chats conversation data. "All Conversations" is the searchable overview;
// "Live Inbox" is where an agent actually replies.
export default function SupportDashboard() {
  return (
    <PermissionGate permission={['chats.view', 'complaints.view', 'helpdesk.view']}>
      <SupportDashboardInner />
    </PermissionGate>
  );
}

function SupportDashboardInner() {
  const [view, setView] = useState<'inbox' | 'all'>('inbox');
  const [pendingOpenId, setPendingOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Deep-links from the retired /admin/chats routes: ?view=all lands on the
  // registry tab, ?open=<conversationId> jumps straight into that thread.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "all") setView("all");
    const openId = params.get("open");
    if (openId) setPendingOpenId(openId);
  }, []);

  useEffect(() => {
    if (!pendingOpenId || conversations.length === 0) return;
    const conv = conversations.find((c) => c.id === pendingOpenId);
    if (conv) {
      openInInbox(conv);
      setPendingOpenId(null);
    }
  }, [pendingOpenId, conversations]);

  useEffect(() => {
    fetchConversations();
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('new_message', (msg) => {
        fetchConversations();
        if (selectedRef.current && msg.session_id === selectedRef.current.session_id) {
          setMessages(prev => [...prev, {
            ...msg,
            id: Date.now() + Math.random(),
            text: msg.content,
            timestamp: new Date()
          }]);
        }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await getApi('/chats/admin/conversations');
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load institutional conversations");
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: any) => {
    setSelected(conv);
    if (socket) {
      socket.emit('agent_join', {
        session_id: conv.session_id,
        agent_name: 'University Admin',
        agent_id: 'system-admin'
      });
    }
    try {
       const data = await getApi(`/chats/admin/conversations/${conv.id}`);
       if (!data?.messages || !Array.isArray(data.messages)) {
         setMessages([]);
         toast.error("Could not load this conversation");
         return;
       }
       setMessages(data.messages.map((m: any) => ({
         ...m,
         text: m.content
       })));
    } catch {
       setMessages([]);
       toast.error("Failed to load communication terminal");
    }
  };

  // Used by the "All Conversations" registry's Open action to jump into the
  // live inbox with that thread already loaded.
  const openInInbox = (conv: any) => {
    setView('inbox');
    selectConversation(conv);
  };

  const handleSend = () => {
    if (!inputValue.trim() || !socket || !selected) return;

    socket.emit('admin_message', {
      session_id: selected.session_id,
      content: inputValue,
      admin_id: "system-admin",
      admin_name: "University Admin"
    });

    setInputValue("");
    socket.emit('agent_typing', { session_id: selected.session_id, is_typing: false });
  };

  const archive = async (id: string) => {
    try {
      await patchApi(`/chats/admin/conversations/${id}/archive`, {});
      toast.success("Engagement archived");
      setSelected(null);
      fetchConversations();
    } catch {
      toast.error("Institutional archiving failed");
    }
  };

  const q = search.toLowerCase();
  const filteredConversations = conversations.filter((c) =>
    (c.session_id || "").toLowerCase().includes(q) ||
    (c.user?.full_name || "").toLowerCase().includes(q) ||
    (c.user?.name || "").toLowerCase().includes(q) ||
    (c.guest_name || "").toLowerCase().includes(q) ||
    (c.guest_email || "").toLowerCase().includes(q)
  );

  const conversationStatus = (c: any) =>
    (c?.current_status || c?.status || "active") as string;

  return (
    <div
      className="bg-slate-50 flex flex-col overflow-hidden font-sans -m-4 md:-m-8 lg:-m-12"
      style={{ height: "calc(100vh - 5rem)" }}
    >
      {/* Tab switcher */}
      <div className="px-6 pt-5 pb-3 bg-white border-b border-slate-100 flex items-center gap-2 shrink-0">
        <button
          onClick={() => setView('inbox')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            view === 'inbox' ? 'bg-primary text-white shadow' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          <MessageSquare size={14} /> Live Inbox
        </button>
        <button
          onClick={() => setView('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            view === 'all' ? 'bg-primary text-white shadow' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          <Activity size={14} /> All Conversations
          <span className={`rounded-full min-w-[18px] h-[18px] px-1 text-[9px] flex items-center justify-center ${view === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>
            {conversations.length}
          </span>
        </button>
      </div>

      {view === 'inbox' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar: Conversation List */}
          <div className="w-80 bg-white border-r border-slate-100 flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   <MessageSquare size={18} className="text-primary" />
                   Support Inbox
                </div>
                <p className="text-[10px] font-medium text-slate-500 mt-1">Manage active support sessions</p>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                {loading ? (
                   <div className="flex justify-center py-10">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                   </div>
                ) : conversations.length === 0 ? (
                   <div className="text-center py-10">
                      <p className="text-[11px] font-medium text-slate-400">No active conversations</p>
                   </div>
                ) : conversations.map(conv => (
                   <button
                     key={conv.id}
                     onClick={() => selectConversation(conv)}
                     className={`w-full p-4 text-left transition-all rounded-xl border ${
                       selected?.id === conv.id
                       ? 'bg-primary/5 border-primary/20 shadow-sm'
                       : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'
                     }`}
                   >
                      <div className="flex items-center justify-between mb-1.5">
                         <div className="flex items-center space-x-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${conversationStatus(conv) === 'escalated' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            <div className={`text-[13px] font-semibold truncate ${selected?.id === conv.id ? 'text-primary-darker' : 'text-slate-700'}`}>
                               {conv.guest_name || conv.user?.full_name || `Session ${(conv.session_id || "").slice(0, 6) || "—"}`}
                            </div>
                         </div>
                         <span className="text-[9px] font-medium text-slate-400 shrink-0">
                            {new Date(conv.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      {conversationStatus(conv) === 'escalated' && (
                         <div className="mb-1.5 inline-block text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                            Action Required
                         </div>
                      )}
                      <p className={`text-xs line-clamp-1 ${selected?.id === conv.id ? 'text-primary/70 font-medium' : 'text-slate-500'}`}>
                         {conv.messages?.[conv.messages.length - 1]?.content || "Started conversation..."}
                      </p>
                   </button>
                ))}
             </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-50 relative">
             {selected ? (
                <>
                   {/* Chat Header */}
                   <div className="p-8 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                      <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 bg-primary-darker flex items-center justify-center text-white">
                            <User size={24} />
                         </div>
                         <div>
                            <h2 className="text-xl font-bold text-primary-darker tracking-tight">
                               {selected.guest_name || selected.user?.full_name || 'Anonymous Peer'}
                            </h2>
                            <div className="flex items-center space-x-3 mt-1">
                               <span className="text-[10px] font-medium text-slate-400 flex items-center">
                                  <ShieldCheck size={10} className="mr-1 text-primary" />
                                  {selected.platform || 'Institutional Terminal'}
                               </span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center space-x-3">
                         <button
                           onClick={() => {
                             if (socket) socket.emit('close_conversation', { session_id: selected.session_id });
                             toast.success("Closing conversation...");
                           }}
                           className="flex items-center space-x-2 px-6 py-3 bg-red-50 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100"
                         >
                            <CheckCircle2 size={14} />
                            <span>Handover & Close</span>
                         </button>
                         <button
                           onClick={() => archive(selected.id)}
                           className="flex items-center space-x-2 px-6 py-3 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-primary-darker hover:text-white transition-all border border-slate-200"
                         >
                            <Archive size={14} />
                            <span>Archive Thread</span>
                         </button>
                      </div>
                   </div>

                   {/* Messages Hub */}
                   <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"
                   >
                      {messages.map((msg, i) => (
                         <motion.div
                           key={msg.id || i}
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                         >
                            <div className={`max-w-[70%] ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
                               <div className="flex items-center space-x-2 mb-2 px-1">
                                  {msg.sender === 'bot' && <Bot size={12} className="text-secondary" />}
                                  {msg.sender === 'admin' && <ShieldCheck size={12} className="text-primary" />}
                                  <span className="text-[9px] font-medium text-slate-400">
                                     {msg.sender} • {new Date(msg.timestamp || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                               </div>
                               <div className={`p-6 text-sm font-medium leading-relaxed shadow-sm border ${
                                  msg.sender === 'user'
                                  ? 'bg-white border-slate-200 text-slate-800'
                                  : msg.sender === 'bot'
                                  ? 'bg-secondary/5 border-secondary/20 text-secondary'
                                  : 'bg-primary text-white border-primary shadow-xl shadow-primary/20'
                               }`}>
                                  {msg.text || msg.content}
                               </div>
                            </div>
                         </motion.div>
                      ))}
                   </div>

                   {/* Integration Input */}
                   <div className="p-8 bg-white border-t border-slate-200">
                      <div className="flex items-center space-x-4">
                         <div className="relative flex-1">
                            <input
                               type="text"
                               value={inputValue}
                               onChange={(e) => {
                                 setInputValue(e.target.value);
                                 if (socket) socket.emit('agent_typing', { session_id: selected.session_id, is_typing: e.target.value.length > 0 });
                               }}
                               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                               placeholder="Direct human intervention..."
                               className="w-full bg-slate-50 border border-slate-200 p-6 pr-16 text-sm font-medium text-primary-darker focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300"
                            />
                            <button
                              onClick={handleSend}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-primary text-white hover:bg-primary-darker transition-all rounded-lg"
                            >
                               <Send size={18} />
                            </button>
                         </div>
                      </div>
                   </div>
                </>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                   <div className="p-10 border-4 border-dashed border-slate-200 rounded-[3rem] mb-8">
                      <MessageSquare size={100} className="text-slate-200" />
                   </div>
                   <h2 className="text-3xl font-bold text-primary-darker tracking-tight">Engagement Idle</h2>
                   <p className="text-sm font-medium text-slate-400 mt-2 max-w-sm">Select an active terminal session to begin institutional support orchestration</p>
                </div>
             )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-primary-darker tracking-tight">All Conversations</h2>
                <p className="text-slate-500 text-sm font-medium">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} across live chat and support sessions.
                </p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by session or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Session</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Participant</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Messages</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Active</th>
                    <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-sm text-slate-400">Loading conversations...</td>
                    </tr>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => (
                      <tr key={conv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${['active', 'escalated'].includes(conversationStatus(conv)) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              <MessageCircle size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{(conv.session_id || "—").slice(0, 8).toUpperCase()}</p>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{conv.platform || 'Portal'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {conv.user?.full_name || conv.user?.name || conv.guest_name || "Anonymous Guest"}
                          </p>
                          {conv.guest_email && <p className="text-[11px] text-primary font-medium">{conv.guest_email}</p>}
                        </td>
                        <td className="p-4 text-sm text-slate-500">{conv.messages?.length || 0} exchanges</td>
                        <td className="p-4 text-sm text-slate-500">{new Date(conv.last_active).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openInInbox(conv)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all"
                          >
                            Open <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-16 text-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                          <MessageSquare size={26} />
                        </div>
                        <p className="text-sm font-medium text-slate-400">No conversations found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
