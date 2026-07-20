"use client";

import React, { useState, useEffect } from "react";
import { getApi } from "@/lib/api";
import { Facebook, Twitter, Instagram, ExternalLink, RefreshCw, MessageSquare } from "lucide-react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface SocialPost {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram';
  content: string;
  mediaUrl?: string;
  postUrl: string;
  createdAt: string;
  authorName: string;
  authorHandle: string;
}

export default function SocialFeed() {
  const t = useTranslations("Social");
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
         const data = await getApi('/social-feed');
         setPosts(data || []);
      } catch (e) {
         console.error("Failed to fetch social feed", e);
      } finally {
         setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const getPlatformIcon = (platform: string) => {
     switch (platform) {
        case 'facebook': return <Facebook size={18} className="text-blue-600" />;
        case 'twitter': return <Twitter size={18} className="text-sky-500" />;
        case 'instagram': return <Instagram size={18} className="text-pink-600" />;
        default: return <MessageSquare size={18} />;
     }
  };

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
           <RefreshCw className="animate-spin text-primary" size={32} />
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("loadingFeeds")}</p>
        </div>
     );
  }

  if (posts.length === 0) {
     return null; // Don't show the section if no posts or API keys missing
  }

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-primary-darker font-serif italic tracking-tight">{t("socialPulse")}</h2>
            <p className="text-slate-500 mt-2">{t("liveUpdates")}</p>
          </div>
          <Link href="/news" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary flex items-center transition-colors">
            {t("viewAllNews")} <ExternalLink size={12} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(0, 6).map((post, index) => (
             <motion.a
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={post.id} 
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-slate-200 hover:border-primary transition-all group flex flex-col h-full shadow-sm hover:shadow-xl"
             >
                {post.mediaUrl && (
                   <div className="h-48 w-full overflow-hidden relative bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.mediaUrl} alt="Social Media" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                         {getPlatformIcon(post.platform)}
                      </div>
                   </div>
                )}
                
                <div className="p-6 flex flex-col flex-grow">
                   {!post.mediaUrl && (
                      <div className="mb-4">
                         {getPlatformIcon(post.platform)}
                      </div>
                   )}
                   <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-4 flex-grow">
                      {post.content}
                   </p>
                   
                   <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-2">
                         <div className="w-6 h-6 rounded-full bg-primary-darker flex items-center justify-center text-white text-[8px] font-black">
                            OUK
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary-darker">{post.authorName}</span>
                            <span className="text-[8px] text-slate-400">@{post.authorHandle}</span>
                         </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">
                         {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                   </div>
                </div>
             </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
