"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Home,
  ArrowRight,
  Users,
  FileText,
  Info,
  Award,
  BookOpen,
  Download,
  MessageSquare,
  Shield,
  Globe,
  Layers,
} from "lucide-react";
import { getMenus, resolveImageUrl } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { useLocale, useTranslations } from "next-intl";

// Map of slug keywords to icons for visual variety
const iconMap: Record<string, React.ReactNode> = {
  "chancellor": <Award size={28} />,
  "vice": <Users size={28} />,
  "management": <Shield size={28} />,
  "governing": <Layers size={28} />,
  "uniqueness": <Globe size={28} />,
  "complaints": <MessageSquare size={28} />,
  "downloads": <Download size={28} />,
  "about": <Info size={28} />,
  "history": <BookOpen size={28} />,
  "policy": <FileText size={28} />,
};

const getIcon = (slug: string) => {
  const key = Object.keys(iconMap).find((k) => slug.toLowerCase().includes(k));
  return key ? iconMap[key] : <FileText size={28} />;
};

interface SectionHubLayoutProps {
  page: any;
  parentSlug: string;
  children?: React.ReactNode;
}

export default function SectionHubLayout({ page, parentSlug, children }: SectionHubLayoutProps) {
  const t = useTranslations("CmsChrome");
  const locale = useLocale();
  const [subPages, setSubPages] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubPages = async () => {
      const menus = await getMenus("header", locale);
      if (menus) {
        const parent = menus.find(
          (m: any) =>
            m.slug === parentSlug ||
            (m.link || "").replace(/^\//, "") === parentSlug
        );
        if (parent?.children?.length > 0) {
          setSubPages(parent.children);
        }
      }
    };
    fetchSubPages();
  }, [parentSlug, locale]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Cinematic Hero Strip ─── */}
      <div className="relative bg-primary-darker overflow-hidden">
        {/* Subtle diagonal lines pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, white, white 1px, transparent 1px, transparent 12px)",
          }}
        />
        {/* Teal glow bottom-left */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        {/* Secondary glow top-right */}
        <div className="absolute -top-16 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 py-28 pt-32 lg:pt-48 relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-10"
          >
            <Link href="/" className="hover:text-white transition-colors flex items-center space-x-1">
              <Home size={12} />
              <span>{t("home")}</span>
            </Link>
            <ChevronRight size={10} className="text-slate-600" />
            <span className="text-white">{page.title}</span>
          </motion.nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block border border-secondary/30 text-secondary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 mb-6">
                {parentSlug.replace(/-/g, " ").toUpperCase()} {t("sectionSuffix").toUpperCase()}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter font-serif leading-[1.1] mb-6 drop-shadow-lg">
                {page.title}
              </h1>
              {page.summary && (
                <p className="text-lg text-slate-300 font-medium leading-relaxed border-l-4 border-primary pl-5">
                  {page.summary}
                </p>
              )}
            </motion.div>

            {/* Stats / Quick facts strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="hidden lg:flex flex-col space-y-4"
            >
              {[
                { label: t("subSections"), value: subPages.length || "—" },
                { label: t("est"), value: "2023" },
                { label: t("status"), value: t("operational") },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center space-x-6 border-l-2 border-white/10 pl-6"
                >
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Children Content (Custom Sections) ─── */}
      {children}

      {/* ─── Sub-pages Card Grid ─── */}
      {subPages.length > 0 && (
        <section className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="container mx-auto px-6">
            <div className="mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">
                {t("navigateSection")}
              </p>
              <h2 className="text-3xl font-black text-primary-darker uppercase tracking-tighter font-serif ">
                {t("exploreTitle", { title: page.title })}
              </h2>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {subPages.map((child: any, idx: number) => {
                const href = child.link || `/${child.slug}`;
                const icon = getIcon(child.slug || child.title || "");
                // Alternate accent colors for visual rhythm
                const accentColors = [
                  "border-primary group-hover:bg-[#ff7f50] hover:text-white",
                  "border-secondary group-hover:bg-secondary",
                  "border-slate-700 group-hover:bg-[#ff7f50] hover:text-white",
                ];
                const accent = accentColors[idx % accentColors.length];

                return (
                  <motion.div key={child.id} variants={itemVariants}>
                    <Link
                      href={href}
                      className="group bg-white border border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 p-8 flex flex-col h-full min-h-[220px] relative overflow-hidden"
                    >
                      {/* Subtle hover background fill */}
                      <div className="absolute inset-0 bg-primary-darker scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-in-out z-0" />

                      {/* Content */}
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon block */}
                        <div
                          className={`w-14 h-14 flex items-center justify-center border-2 ${accent} text-slate-300 group-hover:text-white transition-all duration-300 mb-6`}
                        >
                          {icon}
                        </div>

                        {/* Index number */}
                        <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-500 uppercase tracking-widest mb-2 transition-colors">
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        <h3 className="text-lg font-black uppercase tracking-tight text-primary-darker group-hover:text-white transition-colors duration-300 leading-tight mb-2">
                          {child.title}
                        </h3>

                        <div className="mt-auto pt-6 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-secondary transition-colors">
                          <span>{t("explore")}</span>
                          <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── Page Content (summary/intro text) ─── */}
      {page.content && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div
                className="prose prose-slate prose-lg max-w-none
                  prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:font-serif
                  prose-p:text-slate-600 prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:border-b-2 prose-a:border-primary"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
