"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Eye } from "lucide-react";
import { getApi, patchApi, resolveImageUrl } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { toast } from "react-hot-toast";

export default function PreviewArticle() {
  const { id } = useParams();
  const router = useRouter();
  
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const data = await getApi(`/news/${id}`);
      if (data) {
        setArticle(data);
      }
    } catch (err) {
      toast.error("Failed to load article preview");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setProcessing(true);
    try {
      await patchApi(`/news/${id}/status`, { status: newStatus });
      toast.success(`Article successfully updated to ${newStatus}`);
      router.push('/admin/news');
    } catch (err) {
      toast.error("Failed to update status. Ensure you have the right permissions.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400 animate-pulse">Loading Preview...</div>;
  if (!article) return <div className="p-20 text-center text-slate-400">Article not found.</div>;

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="bg-white border-2 border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 shadow-sm gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-primary-darker uppercase tracking-tighter flex items-center gap-2">
              <Eye size={20} className="text-primary" />
              Content Review & Preview
            </h2>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">
              Current Status: <span className="text-primary">{article.status || "DRAFT"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleStatusUpdate("DRAFT")}
            disabled={processing}
            className="px-6 py-3 border-2 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <XCircle size={16} />
            Reject / Return to Draft
          </button>
          <button 
            onClick={() => handleStatusUpdate("PUBLISHED")}
            disabled={processing}
            className="px-6 py-3 bg-green-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {processing ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Approve & Publish to Public
          </button>
        </div>
      </div>

      {/* Actual Preview Content (Mimics public view) */}
      <div className="bg-white border border-slate-200 shadow-xl overflow-hidden p-8 md:p-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="bg-primary-darker text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5">
                {article.type || "News"}
              </span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {new Date(article.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary-darker leading-tight font-serif ">
              {article.title}
            </h1>
          </div>

          {article.image_url && (
            <figure className="space-y-4 border-l-4 border-primary pl-6 py-2">
              <img 
                src={resolveImageUrl(article.image_url)} 
                alt={article.featured_image_caption || article.title}
                className="w-full aspect-[2/1] object-cover"
              />
              {article.featured_image_caption && (
                <figcaption className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-4">
                  {article.featured_image_caption}
                </figcaption>
              )}
            </figure>
          )}

          <div 
            className="prose prose-lg prose-slate max-w-none text-slate-700 font-medium leading-relaxed
                      prose-headings:font-black prose-headings:text-primary-darker prose-headings:tracking-tighter prose-headings:font-serif
                      prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                      prose-img:shadow-lg prose-img:border prose-img:border-slate-100"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content || "<p>No content provided yet...</p>") }}
          />
        </div>
      </div>
    </div>
  );
}
