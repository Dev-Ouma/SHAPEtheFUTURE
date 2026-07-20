"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Facebook, Linkedin, ExternalLink, Heart, MessageCircle, Repeat2, Share, ThumbsUp } from "lucide-react";
import { getApiCached, getSettings } from "@/lib/api";
import { useLocale, useTranslations } from "next-intl";

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 2.395H4.293L17.607 20.65z" />
  </svg>
);

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.03 1.6 4.26 1.39 1.69 3.4 2.67 5.56 2.87v4.03c-1.89-.04-3.75-.63-5.32-1.71-.12 3.69-.1 7.37-.11 11.06-.05 3.32-2.31 6.36-5.51 7.23-3.64.91-7.64-1.2-8.68-4.78-1.26-3.83 1.25-8.23 5.25-9.13.91-.18 1.84-.2 2.76-.08.01 1.48.01 2.97.01 4.45-.63-.16-1.3-.17-1.92-.02-1.81.36-2.9 2.25-2.28 3.98.54 1.4 2.12 2.19 3.52 1.76 1.19-.3 1.95-1.4 1.95-2.62-.03-5.3-.01-10.61-.02-15.91-.03-.13-.05-.26-.07-.39z" />
  </svg>
);

const MOCK_POSTS = [
  {
    id: "fb-1",
    platform: "facebook" as const,
    author: "Open University of Kenya",
    handle: "OpenUniversityKenya",
    time: "2 hours ago",
    content: "🎓 Congratulations to our Class of 2025/2026! Your journey through open and distance learning has proven that education has no boundaries. We are incredibly proud of each and every one of you. #OUKKenya #Graduation2025",
    image: "/hero-campus.png",
    likes: 342, comments: 58, shares: 127,
    url: "https://facebook.com",
  },
  {
    id: "tw-1",
    platform: "twitter" as const,
    author: "OUK Kenya",
    handle: "OUK_Kenya",
    time: "5 hours ago",
    content: "📢 Applications for the 2025/2026 academic year are now OPEN!\n\nFlexible, quality, and accredited degrees you can study from anywhere in Kenya.\n\n#OpenLearning #OUKKenya #HigherEducation",
    image: null,
    likes: 189, retweets: 74, replies: 23,
    url: "https://twitter.com",
  },
  {
    id: "li-1",
    platform: "linkedin" as const,
    author: "Open University of Kenya",
    handle: "open-university-of-kenya",
    time: "1 day ago",
    content: "We are excited to announce a new strategic partnership with leading technology companies to enhance digital skills training for our students across Kenya. 🤝\n\n#OUKKenya #DigitalEducation #Partnership",
    image: null,
    likes: 521, comments: 42, shares: 98,
    url: "https://linkedin.com",
  },
  {
    id: "tw-2",
    platform: "twitter" as const,
    author: "OUK Kenya",
    handle: "OUK_Kenya",
    time: "2 days ago",
    content: "Our Research Symposium brought together scholars from across the continent to discuss the Future of Cloud Computing in African Higher Education. Incredible ideas shared! 🌍💡 #ResearchSymposium #OUKKenya",
    image: null,
    likes: 203, retweets: 88, replies: 31,
    url: "https://twitter.com",
  },
  {
    id: "fb-2",
    platform: "facebook" as const,
    author: "Open University of Kenya",
    handle: "OpenUniversityKenya",
    time: "3 days ago",
    content: "📚 The OUK Library provides 24/7 access to thousands of academic journals, e-books, and research databases. Log in to the Student Portal and start exploring today! #OUKLibrary #StudySmarter",
    image: null,
    likes: 267, comments: 34, shares: 89,
    url: "https://facebook.com",
  },
  {
    id: "li-2",
    platform: "linkedin" as const,
    author: "Open University of Kenya",
    handle: "open-university-of-kenya",
    time: "4 days ago",
    content: "Spotlight: Meet Dr. Amina Hassan, a proud OUK alumna who now leads a groundbreaking climate research team in Nairobi. Distance education gave her the flexibility to balance work, family, and her ambitions. 🌟\n\n#AlumniSpotlight #OUKKenya",
    image: null,
    likes: 892, comments: 67, shares: 204,
    url: "https://linkedin.com",
  },
];

function PostCard({ post, index, viewLabel }: { post: typeof MOCK_POSTS[0]; index: number; viewLabel: string }) {
  const platformConfig: Record<string, { icon: any; color: string; bg: string; border: string; badge: string }> = {
    facebook: { icon: Facebook, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", badge: "bg-blue-600" },
    twitter:  { icon: XIcon, color: "text-slate-800", bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-900" },
    linkedin: { icon: Linkedin, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-700" },
  };
  const cfg = platformConfig[post.platform];
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className={`bg-white border ${cfg.border} rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col`}
    >
      <div className={`px-5 py-4 ${cfg.bg} flex items-center justify-between border-b ${cfg.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${cfg.badge} rounded-full flex items-center justify-center text-white`}>
            <Icon size={14} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 leading-none">{post.author}</p>
            <p className={`text-[10px] font-bold ${cfg.color} mt-0.5`}>@{post.handle}</p>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">{post.time}</span>
      </div>

      {post.image && (
        <div className="h-44 overflow-hidden">
          <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}

      <div className="px-5 py-4 flex-1">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line line-clamp-5">{post.content}</p>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-slate-400 text-xs">
          {post.platform === "twitter" ? (
            <>
              <span className="flex items-center gap-1 hover:text-rose-500 cursor-pointer transition-colors"><Heart size={13} /> {post.likes}</span>
              <span className="flex items-center gap-1 hover:text-green-500 cursor-pointer transition-colors"><Repeat2 size={13} /> {(post as any).retweets || 0}</span>
              <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors"><MessageCircle size={13} /> {(post as any).replies || 0}</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors"><ThumbsUp size={13} /> {post.likes}</span>
              <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer transition-colors"><MessageCircle size={13} /> {(post as any).comments || 0}</span>
              <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer transition-colors"><Share size={13} /> {(post as any).shares || 0}</span>
            </>
          )}
        </div>
        <a href={post.url} target="_blank" rel="noopener noreferrer"
          className={`text-[10px] font-black uppercase tracking-widest ${cfg.color} flex items-center gap-1 hover:opacity-70 transition-opacity`}>
          {viewLabel} <ExternalLink size={9} />
        </a>
      </div>
    </motion.div>
  );
}

export default function SocialPage() {
  const t = useTranslations("Social");
  const locale = useLocale();
  const [settings, setSettings] = useState<any>({});
  const [livePosts, setLivePosts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getSettings(locale),
      getApiCached("/social-feed", { revalidate: 120 }).catch(() => []),
    ])
      .then(([s, d]) => {
        if (s) setSettings(s);
        if (Array.isArray(d) && d.length > 0) setLivePosts(d);
      });
  }, [locale]);

  const channels = [
    { name: t("facebook"), handle: "@OpenUniversityKenya", url: settings.facebook_url || "https://facebook.com", icon: Facebook, color: "bg-blue-600" },
    { name: t("twitter"), handle: "@OUK_Kenya", url: settings.twitter_url || "https://twitter.com", icon: XIcon, color: "bg-slate-900" },
    { name: t("linkedin"), handle: "Open University of Kenya", url: settings.linkedin_url || "https://linkedin.com", icon: Linkedin, color: "bg-blue-700" },
    { name: t("tiktok"), handle: "@ouk.kenya", url: settings.tiktok_url || "https://tiktok.com", icon: TikTokIcon, color: "bg-slate-800" },
  ];

  const displayPosts = livePosts.length > 0 ? livePosts : MOCK_POSTS;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero — left aligned */}
      <section className="relative bg-primary-darker text-white overflow-hidden pt-48 pb-24 px-6">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 10% 60%, #ff7f50 0%, transparent 55%), radial-gradient(circle at 80% 20%, #00a8cc 0%, transparent 50%)" }} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary mb-5 block">{t("eyebrow")}</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mb-5 max-w-3xl">{t("title")}</h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium">{t("subtitle")}</p>
        </div>
      </section>

      {/* Channels — left aligned */}
      <section className="py-20 px-6 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto max-w-6xl">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-2">{t("ourChannels")}</span>
          <h2 className="text-2xl font-black text-primary-darker uppercase tracking-tight mb-10">{t("followEverywhere")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {channels.map((ch, i) => (
              <motion.a key={ch.name} href={ch.url} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white border border-slate-100 p-6 hover:shadow-md hover:border-primary transition-all group">
                <div className={`w-10 h-10 ${ch.color} flex items-center justify-center text-white mb-4`}><ch.icon size={18} /></div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-800">{ch.name}</p>
                <p className="text-[10px] text-secondary font-bold mt-0.5">{ch.handle}</p>
                <div className="mt-4 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary group-hover:text-secondary transition-colors">
                  {t("follow")} <ExternalLink size={8} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Posts feed — left aligned */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-2">{t("socialFeed")}</span>
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-2xl font-black text-primary-darker uppercase tracking-tight">{t("latestFromChannels")}</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("hashtagHint")}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map((post, i) => <PostCard key={post.id} post={post} index={i} viewLabel={t("view")} />)}
          </div>
        </div>
      </section>

      {/* CTA — left aligned */}
      <section className="py-20 px-6 bg-primary-darker text-white">
        <div className="container mx-auto max-w-6xl">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary block mb-4">{t("getInvolved")}</span>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-4 max-w-xl">{t("ctaTitle")}</h2>
          <p className="text-slate-400 mb-8 max-w-lg">
            {t("ctaBody")}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/admissions" className="px-8 py-4 bg-secondary text-white font-black uppercase tracking-widest text-sm hover:bg-secondary/90 transition-colors">{t("applyNow")}</Link>
            <Link href="/news" className="px-8 py-4 border border-white/20 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-colors">{t("latestNews")}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
