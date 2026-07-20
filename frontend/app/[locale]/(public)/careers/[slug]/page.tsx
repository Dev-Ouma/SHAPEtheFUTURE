import React from "react";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  ArrowLeft,
  Building,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { getTranslations } from "next-intl/server";
import { LocalizedHtml, LocalizedText, I18nProtect } from "@/components/LocalizedCms";
import { withLocaleSeo } from "@/lib/seo";

async function getJob(slug: string, locale?: string) {
  try {
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const res = await fetch(`${API_URL}/careers/slug/${slug}${qs}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch job");
    }
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "Careers" });
  const job = await getJob(params.slug, params.locale);
  if (!job) {
    return withLocaleSeo(`/careers/${params.slug}`, params.locale, {
      title: t("jobNotFound"),
    });
  }
  return withLocaleSeo(`/careers/${params.slug}`, params.locale, {
    title: `${job.title} | ${t("metaTitleSuffix")}`,
    description: job.summary,
  });
}

export default async function JobDetailsPage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "Careers" });
  const job = await getJob(params.slug, params.locale);

  if (!job) {
    notFound();
  }

  const isClosed =
    job.status === "Closed" ||
    (job.application_deadline &&
      new Date(job.application_deadline) < new Date());

  const deadlineLabel =
    job.application_deadline &&
    (job.days_remaining > 0
      ? t("closingInDays", { days: job.days_remaining })
      : t("closesOn", {
          date: new Date(job.application_deadline).toLocaleDateString(
            params.locale === "sw" ? "sw-KE" : "en-GB"
          ),
        }));

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <header className="bg-primary-darker pt-40 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-primary hover:text-[#ff7f50] transition-colors text-sm font-bold uppercase tracking-widest mb-12"
          >
            <ArrowLeft size={16} /> {t("backToOpenings")}
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `,
              }}
            />
            <div className="flex-1 pr-8">
              {isClosed && (
                <I18nProtect
                  locale={params.locale}
                  as="div"
                  className="inline-block px-3 py-1 bg-red-500/20 text-red-300 text-[10px] font-black uppercase tracking-widest rounded mb-6"
                >
                  {t("closedToApplications")}
                </I18nProtect>
              )}
              <LocalizedText
                locale={params.locale}
                swSource={job.title_sw}
                as="h1"
                className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter font-serif mb-6 leading-[0.9] opacity-0"
                style={{ animation: "fadeInUp 1s ease-out forwards" }}
              >
                {job.title}
              </LocalizedText>
              <LocalizedText
                locale={params.locale}
                swSource={job.summary_sw}
                as="p"
                className="text-xl text-slate-400 font-medium leading-relaxed max-w-3xl opacity-0"
                style={{ animation: "fadeInUp 1s ease-out 0.2s forwards" }}
              >
                {job.summary}
              </LocalizedText>
            </div>

            <div className="shrink-0 flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
                  {t("referenceCode")}
                </p>
                <p className="text-lg font-mono text-white">{job.reference_code}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-6 mt-12">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="flex-1 space-y-16">
            <section>
              <I18nProtect locale={params.locale} as="h2" className="text-2xl font-black text-primary-darker uppercase tracking-tight mb-6 flex items-center gap-3">
                <Building className="text-primary" size={24} /> {t("aboutRole")}
              </I18nProtect>
              <LocalizedHtml
                locale={params.locale}
                swSource={job.description_sw}
                html={sanitizeHtml(job.description)}
                className="prose prose-slate prose-lg max-w-none text-slate-600 font-medium"
              />
            </section>

            {job.responsibilities && (
              <section>
                <I18nProtect locale={params.locale} as="h2" className="text-2xl font-black text-primary-darker uppercase tracking-tight mb-6">
                  {t("keyResponsibilities")}
                </I18nProtect>
                <LocalizedHtml
                  locale={params.locale}
                  swSource={job.responsibilities_sw}
                  html={sanitizeHtml(job.responsibilities)}
                  className="prose prose-slate prose-lg max-w-none text-slate-600 font-medium marker:text-primary"
                />
              </section>
            )}

            {job.requirements && (
              <section>
                <I18nProtect locale={params.locale} as="h2" className="text-2xl font-black text-primary-darker uppercase tracking-tight mb-6">
                  {t("requirements")}
                </I18nProtect>
                <LocalizedHtml
                  locale={params.locale}
                  swSource={job.requirements_sw}
                  html={sanitizeHtml(job.requirements)}
                  className="prose prose-slate prose-lg max-w-none text-slate-600 font-medium marker:text-primary"
                />
              </section>
            )}

            {job.qualifications && (
              <section>
                <I18nProtect locale={params.locale} as="h2" className="text-2xl font-black text-primary-darker uppercase tracking-tight mb-6">
                  {t("qualifications")}
                </I18nProtect>
                <LocalizedHtml
                  locale={params.locale}
                  swSource={job.qualifications_sw}
                  html={sanitizeHtml(job.qualifications)}
                  className="prose prose-slate prose-lg max-w-none text-slate-600 font-medium marker:text-primary"
                />
              </section>
            )}

            {job.benefits && (
              <section className="bg-white border border-slate-100 p-10 rounded-2xl shadow-sm">
                <I18nProtect locale={params.locale} as="h2" className="text-2xl font-black text-primary-darker uppercase tracking-tight mb-6">
                  {t("whatWeOffer")}
                </I18nProtect>
                <LocalizedHtml
                  locale={params.locale}
                  swSource={job.benefits_sw}
                  html={sanitizeHtml(job.benefits)}
                  className="prose prose-slate prose-lg max-w-none text-slate-600 font-medium marker:text-primary"
                />
              </section>
            )}
          </div>

          <aside className="w-full lg:w-96 shrink-0 lg:sticky lg:top-32 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
              {!isClosed ? (
                <>
                  <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight mb-6">
                    {t("readyToJoin")}
                  </h3>

                  {job.application_url ? (
                    <a
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-primary text-white text-center py-4 text-sm font-black uppercase tracking-widest rounded-xl hover:bg-[#ff7f50] transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                    >
                      {t("applyNow")} <ExternalLink size={18} />
                    </a>
                  ) : (
                    <a
                      href={`mailto:hr@ouk.ac.ke?subject=Application for ${job.title} (${job.reference_code})`}
                      className="block w-full bg-primary text-white text-center py-4 text-sm font-black uppercase tracking-widest rounded-xl hover:bg-[#ff7f50] transition-colors shadow-lg shadow-primary/20"
                    >
                      {t("applyViaEmail")}
                    </a>
                  )}

                  {job.application_deadline && (
                    <p className="text-center text-xs font-bold text-amber-600 mt-4 flex items-center justify-center gap-2">
                      <Clock size={14} />
                      {deadlineLabel}
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">
                    {t("applicationsClosed")}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm">
                    {t("applicationsClosedBody")}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                {t("jobDetails")}
              </h3>

              <ul className="space-y-6">
                <li className="flex gap-4">
                  <Briefcase className="text-primary mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      {t("employmentType")}
                    </p>
                    <p className="font-bold text-slate-700">
                      {job.employment_type || t("notSpecified")}
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <MapPin className="text-[#ff7f50] mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      {t("location")}
                    </p>
                    <p className="font-bold text-slate-700">
                      {job.location || t("notSpecified")}
                    </p>
                    {job.is_remote && (
                      <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded">
                        {t("remoteAvailableBadge")}
                      </span>
                    )}
                  </div>
                </li>
                <li className="flex gap-4">
                  <Building className="text-emerald-500 mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      {t("division")}
                    </p>
                    <p className="font-bold text-slate-700">
                      {job.division?.name || t("generalDivision")}
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <CheckCircle className="text-amber-500 mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      {t("experienceLevel")}
                    </p>
                    <p className="font-bold text-slate-700">
                      {job.experience_level || t("notSpecified")}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
