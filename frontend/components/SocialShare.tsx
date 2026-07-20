"use client";

import React, { useState, useEffect } from "react";
import { Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SocialShare({ title }: { title: string }) {
  const t = useTranslations("Common");
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  };

  const openShare = (e: React.MouseEvent<HTMLAnchorElement>, platform: string) => {
    e.preventDefault();
    window.open(e.currentTarget.href, `${platform}-share`, "width=600,height=400");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-2">
        <Share2 size={12} /> {t("share")}
      </span>
      <a 
        href={shareLinks.facebook} 
        onClick={(e) => openShare(e, 'facebook')}
        className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
        aria-label={t("shareFacebook")}
      >
        <Facebook size={16} />
      </a>
      <a 
        href={shareLinks.twitter} 
        onClick={(e) => openShare(e, 'twitter')}
        className="w-10 h-10 flex items-center justify-center bg-black text-white hover:bg-slate-800 transition-colors shadow-md"
        aria-label={t("shareX")}
      >
        <Twitter size={16} />
      </a>
      <a 
        href={shareLinks.linkedin} 
        onClick={(e) => openShare(e, 'linkedin')}
        className="w-10 h-10 flex items-center justify-center bg-blue-800 text-white hover:bg-blue-900 transition-colors shadow-md"
        aria-label={t("shareLinkedIn")}
      >
        <Linkedin size={16} />
      </a>
    </div>
  );
}
