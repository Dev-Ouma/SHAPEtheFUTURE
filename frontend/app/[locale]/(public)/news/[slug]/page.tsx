import React from "react";
import { getNewsItem, getNews, resolveImageUrl } from "@/lib/api";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import AdmissionsCTA from "@/components/AdmissionsCTA";
import JsonLd from "@/components/JsonLd";
import SocialShare from "@/components/SocialShare";
import { getTranslations } from "next-intl/server";
import { LocalizedHtml, LocalizedText, I18nProtect } from "@/components/LocalizedCms";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 3600; // 1 hour ISR

export async function generateMetadata({ params }: { params: { slug: string; locale: string } }) {
  const news = await getNewsItem(params.slug, params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: "News" });
  return withLocaleSeo(`/news/${params.slug}`, params.locale, {
    title: news ? `${news.title} | OUK News` : t("articleNotFound"),
    openGraph: news?.image_url ? {
      images: [{ url: resolveImageUrl(news.image_url) }],
    } : undefined,
  });
}

export default async function NewsArticlePage({ params }: { params: { slug: string; locale: string } }) {
  const { slug, locale } = params;
  const t = await getTranslations({ locale, namespace: "News" });
  const news = await getNewsItem(slug, locale);
  const allNewsResponse = await getNews({ limit: 20, locale });
  const allNews = allNewsResponse?.items || allNewsResponse?.data || [];

  if (!news) {
    notFound();
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": news.title,
    "image": news.image_url ? [resolveImageUrl(news.image_url)] : [],
    "datePublished": news.published_at || news.created_at,
    "author": {
      "@type": "Organization",
      "name": "Open University of Kenya"
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <JsonLd data={schemaData} />
      <header className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[140px] -mr-80 -mt-80" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -ml-40 -mb-40" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 px-4">
          <Link href="/news" className="text-primary font-black uppercase tracking-[0.3em] text-[10px] flex items-center space-x-3 mb-12 hover:text-white transition-all group">
             <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
             <I18nProtect locale={locale} as="span">{t("backToHub")}</I18nProtect>
          </Link>
          <div className="flex items-center space-x-6 mb-8">
             <div className="w-12 h-[2px] bg-secondary" />
             <span className="text-secondary font-black text-[10px] uppercase tracking-[0.4em]">
                {news.category}
             </span>
             <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] ml-auto">
                {new Date(news.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
          </div>
          <LocalizedText
            locale={locale}
            swSource={news.title_sw}
            as="h1"
            className="text-4xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase max-w-4xl"
          >
            {news.title}
          </LocalizedText>
          {news.summary && (
            <LocalizedText
              locale={locale}
              swSource={news.summary_sw}
              as="p"
              className="mt-8 text-lg text-slate-300 max-w-3xl font-medium leading-relaxed"
            >
              {news.summary}
            </LocalizedText>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-2/3">
            {news.image_url && (
              <div className="mb-16 shadow-2xl aspect-institutional-video overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={resolveImageUrl(news.image_url)} 
                  alt={news.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            )}
            <LocalizedHtml
              locale={locale}
              swSource={news.content_sw}
              html={news.content || ""}
              className="prose prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-a:text-primary"
            />
            <div className="mt-16 pt-8 border-t border-slate-200">
              <SocialShare title={news.title} />
            </div>
          </div>

          <aside className="lg:w-1/3 space-y-8">
            <I18nProtect locale={locale} as="h3" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              {t("insights")}
            </I18nProtect>
            <div className="space-y-4">
              {allNews.filter((n: any) => n.slug !== news.slug).slice(0, 4).map((item: any) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="block group">
                  <div className="bg-white border border-slate-100 p-6 hover:border-primary transition-all shadow-sm">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.category}</span>
                    <LocalizedText
                      locale={locale}
                      swSource={item.title_sw}
                      as="h4"
                      className="mt-2 font-black text-primary-darker uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors"
                    >
                      {item.title}
                    </LocalizedText>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <AdmissionsCTA />
    </div>
  );
}
