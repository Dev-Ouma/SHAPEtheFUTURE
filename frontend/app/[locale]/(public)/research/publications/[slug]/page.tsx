import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getPublication, getPublications } from "@/lib/api";
import CitationGenerator from "@/components/CitationGenerator";
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Calendar,
  BookOpen,
  Tag,
  User,
  Database,
} from "lucide-react";
import PublicationCard from "@/components/PublicationCard";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const publication = await getPublication(params.slug, params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: "Research" });
  if (!publication) return { title: t("pubNotFound") };
  return {
    title: `${publication.title} | Research | OUK`,
    description: publication.abstract?.substring(0, 160),
    openGraph: {
      title: publication.title,
      description: publication.abstract?.substring(0, 160),
      type: "article",
    },
  };
}

export default async function PublicationDetailPage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Research" });
  const publication = await getPublication(params.slug, locale);
  if (!publication) notFound();

  const relatedResults = await getPublications({
    schoolId: publication.school?.id,
    limit: 3,
    status: "Published",
    locale,
  });

  const relatedData = relatedResults.data || [];
  const related = relatedData.filter((p: any) => p.id !== publication.id);

  const metaRows = [
    {
      label: t("doiIndex"),
      value: publication.doi || t("notIndexed"),
      link: publication.doi ? `https://doi.org/${publication.doi}` : null,
    },
    { label: t("publisherEntity"), value: publication.publisher || t("oukArchive") },
    {
      label: t("academicSchoolMeta"),
      value: publication.school?.name || t("centralResearch"),
    },
    {
      label: t("primaryDepartment"),
      value: publication.department?.name || t("interdisciplinary"),
    },
    {
      label: t("metadataIdentifier"),
      value: publication.issn_isbn || t("pending"),
    },
    {
      label: t("bibliographicData"),
      value: `${publication.volume || "-"} / ${publication.issue || "-"}`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-48 pb-32">
        <div className="container mx-auto px-6">
          <Link
            href="/research/publications"
            className="inline-flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 hover:text-[#ff7f50] transition-all mb-20 group"
          >
            <div className="w-12 h-12 bg-slate-50 flex items-center justify-center group-hover:bg-[#ff7f50] group-hover:text-white transition-all shadow-sm">
              <ArrowLeft size={16} />
            </div>
            <span>{t("archivesRepository")}</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-5 py-2 bg-primary/5 border border-primary/10">
                  {publication.type?.replace("_", " ")}
                </span>
                {publication.is_open_access && (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff7f50] px-5 py-2 bg-[#ff7f50]/5 border border-[#ff7f50]/10">
                    {t("openAccess")}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-primary-darker uppercase tracking-tighter leading-[1.05] italic font-serif mb-12">
                {publication.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-12 gap-y-6 mb-20 pb-16 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-primary-darker flex items-center justify-center text-white shrink-0 shadow-xl">
                    <User size={24} />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {publication.staff_authors?.map((author: any, idx: number) => (
                      <Link
                        key={author.id}
                        href={`/about/staff/${author.profile_slug}`}
                        className="text-sm font-black uppercase tracking-widest text-primary-darker hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary/20 pb-0.5"
                      >
                        {author.full_name}
                        {idx < (publication.staff_authors.length - 1) ? "," : ""}
                      </Link>
                    ))}
                    {publication.external_authors && (
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {publication.staff_authors?.length > 0 ? "| " : ""}
                        {publication.external_authors}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-500">
                  <Calendar size={20} className="text-primary" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">
                    {publication.publication_year}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-slate-500">
                  <BookOpen size={20} className="text-primary" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] italic decoration-primary/20 underline underline-offset-4">
                    {publication.journal_name}
                  </span>
                </div>
              </div>

              <div className="mb-24">
                <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-primary-darker mb-12 flex items-center gap-6">
                  <div className="w-12 h-1 bg-primary" />
                  {t("scholarlyAbstract")}
                </h2>
                <div className="text-lg md:text-xl text-slate-600 font-medium leading-[2.1] italic font-serif bg-slate-50/50 p-10 border-l-4 border-primary shadow-sm">
                  {publication.abstract}
                </div>
              </div>

              <CitationGenerator publication={publication} />

              {related.length > 0 && (
                <div className="mt-40">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-primary-darker mb-16 flex items-center gap-6">
                    <div className="w-12 h-1 bg-[#ff7f50]" />
                    {t("relatedResearchOutput")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {related.map((pub: any) => (
                      <PublicationCard key={pub.id} publication={pub} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-16 h-fit lg:sticky lg:top-36">
              <div className="bg-primary-darker p-14 text-white relative overflow-hidden shadow-3xl shadow-slate-900/40">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 -mr-20 -mt-20 rounded-full blur-3xl opacity-50" />

                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary mb-12 flex items-center gap-3">
                  <Database size={14} />
                  {t("legacyDataProfile")}
                </h3>

                <div className="space-y-10">
                  {metaRows.map((meta, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 pb-8 border-b border-white/5 last:border-0 last:pb-0 group"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-primary transition-colors">
                        {meta.label}
                      </span>
                      <div className="font-bold text-base tracking-tight leading-tight group-hover:translate-x-1 transition-transform">
                        {meta.link ? (
                          <a
                            href={meta.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors flex items-center gap-3"
                          >
                            {meta.value}
                            <ExternalLink size={14} className="text-primary" />
                          </a>
                        ) : (
                          meta.value
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-14 pt-14 border-t border-white/10 space-y-5">
                  <button
                    disabled={!publication.pdf_file_url}
                    className="w-full bg-[#037b90] text-white py-6 px-10 text-[11px] font-black uppercase tracking-[0.25em] hover:bg-[#ff7f50] transition-all flex items-center justify-center gap-5 shadow-2xl shadow-[#037b90]/30 disabled:opacity-20 disabled:cursor-not-allowed group"
                  >
                    <Download size={20} className="group-hover:translate-y-1 transition-transform" />
                    <span>{t("downloadManuscript")}</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-600 font-black uppercase tracking-[0.3em] italic">
                    {t("doiVerified")}
                  </p>
                </div>
              </div>

              {publication.keywords && publication.keywords.length > 0 && (
                <div className="p-14 border-2 border-slate-50 bg-slate-50/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-[0.05]">
                    <Tag size={100} />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary-darker mb-10 relative z-10">
                    {t("ontologyTags")}
                  </h3>
                  <div className="flex flex-wrap gap-3 relative z-10">
                    {publication.keywords.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-5 py-3 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all cursor-crosshair"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
