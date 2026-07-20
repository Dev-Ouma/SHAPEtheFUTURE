"use client";

import React, { useState } from "react";
import { 
  Brain, RefreshCw, Newspaper, HelpCircle, GraduationCap,
  CheckCircle2, XCircle, Loader2, Sparkles, Database, Zap, Upload
} from "lucide-react";
import { postApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import PermissionGate from "@/components/admin/PermissionGate";

type SyncResult = { success: boolean; synced?: number; type?: string; error?: string };
type SyncState = 'idle' | 'loading' | 'success' | 'error';

interface SyncCard {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  endpoint: string;
  color: string;
}

const SYNC_CARDS: SyncCard[] = [
  {
    id: 'all',
    label: 'Full Knowledge Rebuild',
    description: 'Clears and re-ingests all content types (Programmes, News, FAQs) into the vector database simultaneously.',
    icon: Database,
    endpoint: '/ai/admin/sync/all',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'programmes',
    label: 'Academic Programmes',
    description: 'Syncs all programme details (overview, entry requirements, careers) for AI-powered course discovery.',
    icon: GraduationCap,
    endpoint: '/ai/admin/sync/programmes',
    color: 'from-primary to-teal-600',
  },
  {
    id: 'news',
    label: 'News & Publications',
    description: 'Ingests all published news articles, research publications, and institutional announcements.',
    icon: Newspaper,
    endpoint: '/ai/admin/sync/news',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'faqs',
    label: 'FAQs & Support',
    description: 'Indexes all active FAQ Q&A pairs so the AI can answer common student support questions precisely.',
    icon: HelpCircle,
    endpoint: '/ai/admin/sync/faqs',
    color: 'from-amber-500 to-orange-600',
  },
];

export default function AiKnowledgeBase() {
  return (
    <PermissionGate permission="knowledge_hub.manage">
      <AiKnowledgeBaseInner />
    </PermissionGate>
  );
}

function AiKnowledgeBaseInner() {
  const [syncStates, setSyncStates] = useState<Record<string, SyncState>>({});
  const [results, setResults] = useState<Record<string, SyncResult | SyncResult[]>>({});

  const handleSync = async (card: SyncCard) => {
    setSyncStates(prev => ({ ...prev, [card.id]: 'loading' }));
    try {
      const result = await postApi(card.endpoint, {});
      setSyncStates(prev => ({ ...prev, [card.id]: 'success' }));
      setResults(prev => ({ ...prev, [card.id]: result }));
      toast.success(`${card.label} synced successfully!`);
    } catch (error: any) {
      setSyncStates(prev => ({ ...prev, [card.id]: 'error' }));
      toast.error(`Failed to sync ${card.label}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          toast.error("JSON file must contain an array of intelligence objects.");
          return;
        }

        const toastId = toast.loading("Uploading training data...");
        try {
          await postApi('/chats/intelligence/bulk', json);
          toast.success(`Successfully uploaded ${json.length} records! You can now trigger a sync.`, { id: toastId });
          e.target.value = '';
        } catch (err) {
          toast.error("Server error during upload.", { id: toastId });
        }
      } catch (err) {
        toast.error("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto w-full pb-20">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          <Brain size={14} />
          <span>AI Intelligence Platform</span>
        </div>
        <h2 className="text-4xl font-black text-primary-darker tracking-tighter font-serif">Knowledge Base Manager</h2>
        <p className="text-slate-500 font-medium text-sm max-w-2xl">
          The AI Advisor retrieves answers from a vector database of institutional content. Use these controls to sync content 
          into the knowledge base whenever you update programmes, news, or FAQs.
        </p>
        <div className="flex items-center space-x-3 p-4 bg-primary/5 border border-primary/20">
          <Sparkles size={16} className="text-primary shrink-0" />
          <p className="text-[11px] font-bold text-primary uppercase tracking-widest">
            An OpenAI API key is required for embedding generation. Configure it under Portal Settings.
          </p>
        </div>
      </div>

      {/* Sync Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {SYNC_CARDS.map((card) => {
          const Icon = card.icon;
          const state = syncStates[card.id] || 'idle';
          const result = results[card.id];

          return (
            <div key={card.id} className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500 group">
              {/* Card Top */}
              <div className="p-8 space-y-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight font-serif">{card.label}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">{card.description}</p>
                </div>
              </div>

              {/* Result Feedback */}
              {result && (
                <div className="px-8 pb-4">
                  {Array.isArray(result) ? (
                    <div className="space-y-2">
                      {(result as SyncResult[]).map((r, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest border ${r.success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                          {r.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          <span>{r.type}: {r.success ? `${r.synced} records synced` : r.error}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`flex items-center gap-3 p-3 text-[10px] font-black uppercase tracking-widest border ${(result as SyncResult).success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                      {(result as SyncResult).success ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      <span>
                        {(result as SyncResult).success ? `${(result as SyncResult).synced} records ingested successfully` : (result as SyncResult).error}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Card Action */}
              <div className="px-8 pb-8">
                <button
                  onClick={() => handleSync(card)}
                  disabled={state === 'loading'}
                  className={`w-full flex items-center justify-center gap-3 py-4 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed
                    ${state === 'success' ? 'bg-green-600 text-white' : state === 'error' ? 'bg-red-500 text-white' : 'bg-primary-darker text-white hover:bg-primary'}`}
                >
                  {state === 'loading' ? (
                    <><Loader2 size={16} className="animate-spin" /> Syncing...</>
                  ) : state === 'success' ? (
                    <><CheckCircle2 size={16} /> Sync Successful</>
                  ) : state === 'error' ? (
                    <><XCircle size={16} /> Sync Failed — Retry</>
                  ) : (
                    <><Zap size={16} /> Trigger Sync</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* JSON Bulk Upload Section */}
      <div className="bg-white border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white">
            <Upload size={22} />
          </div>
          <div>
            <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight font-serif">Upload Custom Training JSON</h3>
            <p className="text-slate-500 text-sm font-medium mt-1">Directly upload bulk FAQs or Knowledge Chunks via a JSON file. Ensure your JSON format matches the standard schema.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="file" 
            accept=".json"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-[11px] file:font-black file:uppercase file:tracking-widest file:bg-slate-100 file:text-primary-darker hover:file:bg-slate-200 transition-all border border-slate-200 p-2"
          />
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-slate-50 border border-slate-200 p-8 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-primary-darker flex items-center gap-3">
          <RefreshCw size={14} /> Sync Guidelines
        </h4>
        <ul className="space-y-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <li>• Run a Full Knowledge Rebuild after major content updates or migrations.</li>
          <li>• Individual syncs (Programmes, News, FAQs) are faster for targeted updates.</li>
          <li>• Sync operations delete and re-ingest all chunks to prevent duplication.</li>
          <li>• Each sync call may take 30–120 seconds depending on content volume and OpenAI API speed.</li>
          <li>• The AI chat remains operational during syncs using the existing knowledge base.</li>
        </ul>
      </div>
    </div>
  );
}
