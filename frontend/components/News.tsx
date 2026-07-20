"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User, Tag } from "lucide-react";
import { getNews, resolveImageUrl } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale, useTranslations } from "next-intl";
import { LocalizedText, I18nProtect } from "@/components/LocalizedCms";

type NewsProps = { initialNews?: any[] };

function formatNewsDate(value: string | Date | undefined, locale: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale === "sw" ? "sw-KE" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

const News = ({ initialNews }: NewsProps = {}) => {
  const t = useTranslations("News");
  const locale = useLocale();
  const hasServerData = Array.isArray(initialNews) && initialNews.length > 0;
  const [news, setNews] = useState<any[]>(
    Array.isArray(initialNews) ? initialNews : [],
  );
  const [loading, setLoading] = useState(!Array.isArray(initialNews));

  useEffect(() => {
    if (hasServerData) {
      setNews(initialNews!);
      setLoading(false);
      return;
    }
    // Empty server payload still allows a client recovery fetch.
    setLoading(true);
    const fetchNews = async () => {
      try {
        const response = await getNews({ limit: 3, type: "All", locale });
        const articles = response?.items || (Array.isArray(response) ? response : []);
        if (articles && articles.length > 0) {
          const filteredNews = articles.filter((item: any) => item.type !== "Research");
          if (filteredNews.length > 0) {
            setNews(filteredNews.slice(0, 3));
          }
        }
      } catch (error) {
        console.error("Institutional data sync error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [locale, hasServerData, initialNews]);

  if (!loading && news.length === 0) return null;

  return (
    <section className="bg-white py-24 border-t border-slate-100" id="news">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
          <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-6 block"
            >
              {t("homeEyebrow")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-primary-darker md:border-l-8 md:border-secondary md:pl-8"
            >
              {t("homeTitle")}
            </motion.h2>
          </div>
          <div className="flex justify-center md:justify-end">
            <Link href="/news" className="btn-primary group flex items-center space-x-2 shrink-0 py-4 px-8" id="view-all-news-btn">
              <span>{t("viewAll")}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {news.map((item, index) => (
            <Link key={item.id || index} href={`/news/${item.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group flex flex-col bg-slate-50 relative overflow-hidden h-full shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-200" />
                  {item.image_url ? (
                    <SafeImage
                      src={resolveImageUrl(item.image_url)}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Tag size={40} className="text-primary/20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                    {item.category}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 border-x border-b border-slate-100 bg-white">
                  <div className="flex items-center space-x-4 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span suppressHydrationWarning>
                        {formatNewsDate(item.created_at, locale)}
                      </span>
                    </div>
                  </div>

                  <LocalizedText
                    locale={locale}
                    swSource={item.title_sw}
                    as="h3"
                    className="text-xl font-bold text-primary-darker mb-4 group-hover:text-primary transition-colors duration-300 line-clamp-2"
                  >
                    {item.title}
                  </LocalizedText>

                  <LocalizedText
                    locale={locale}
                    swSource={item.content_sw}
                    as="p"
                    className="text-slate-600 mb-8 line-clamp-3 text-sm leading-relaxed"
                  >
                    {stripHtml(item.content)}
                  </LocalizedText>

                  <div className="mt-auto pt-6 border-t border-slate-100">
                    <span className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-widest group-hover:text-secondary transition-colors">
                      <I18nProtect locale={locale} as="span">{t("readMore")}</I18nProtect>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
