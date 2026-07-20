import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getStaffProfile,
  getStaffDirectory,
  resolveImageUrl,
} from "@/lib/api";
import { PROFILE_IMAGE_PLACEHOLDER_DATA_URI } from "@/lib/profile-image-placeholder";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Globe,
  Github,
  GraduationCap,
  BookOpen,
  Award,
  ExternalLink,
  ArrowLeft,
  Search,
  MessageSquare,
  Briefcase,
  Share2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const profile: any = await getStaffProfile(params.slug);
  const t = await getTranslations({ locale: params.locale, namespace: "Staff" });

  if (!profile || !profile.is_public) {
    return { title: t("profileNotFound") };
  }

  const title =
    profile.meta_title ||
    `${profile.honorific_title} ${profile.full_name} | Open University of Kenya`;
  const description =
    profile.meta_description ||
    profile.bio?.replace(/<[^>]*>?/gm, "").slice(0, 160) ||
    `Learn more about ${profile.full_name} at OUK.`;
  const image =
    profile.og_image_url ||
    profile.profile_image_url ||
    "/images/ouk-logo-social.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: resolveImageUrl(image) }],
      type: "profile",
      firstName: profile.full_name.split(" ")[0],
      lastName: profile.full_name.split(" ").slice(1).join(" "),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolveImageUrl(image)],
    },
  };
}

export default async function StaffProfilePage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Staff" });
  const profile: any = await getStaffProfile(params.slug);

  if (!profile || !profile.is_public) {
    return notFound();
  }

  const relatedResponse = await getStaffDirectory(
    undefined,
    undefined,
    profile.department?.id
  );
  const relatedMembers = (Array.isArray(relatedResponse) ? relatedResponse : [])
    .filter((m: any) => m.id !== profile.id && m.is_public)
    .slice(0, 4);

  const displayImage =
    resolveImageUrl(profile.profile_image_url) || PROFILE_IMAGE_PLACEHOLDER_DATA_URI;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name,
    jobTitle: profile.job_title,
    affiliation: {
      "@type": "Organization",
      name: "Open University of Kenya",
    },
    url: `https://ouk.ac.ke/about/staff/${profile.profile_slug}`,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <JsonLd data={schemaData} />
      <section className="relative h-[500px] pt-32 overflow-hidden bg-primary-darker border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <div className="container mx-auto px-6 h-full flex flex-col justify-end pb-12 relative z-10">
          <Link
            href="/about/staff"
            className="group mb-8 flex items-center space-x-2 text-white/60 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">
              {t("backToDirectory")}
            </span>
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-end md:space-x-10 text-center md:text-left">
            <div className="relative mb-6 md:mb-0">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white/10 p-2 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden ring-1 ring-white/20">
                <img
                  src={displayImage}
                  alt={profile.full_name}
                  className="standard-image rounded-full"
                />
              </div>
              {profile.is_featured && (
                <div className="absolute -bottom-2 right-10 bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 shadow-lg border border-white/20">
                  <Award size={12} />
                  <span>{t("featured")}</span>
                </div>
              )}
            </div>

            <div className="space-y-4 pb-4">
              <div className="space-y-1">
                <p className="text-primary font-black uppercase tracking-widest text-xs">
                  {profile.job_title ||
                    profile.designation ||
                    profile.staff_type?.name}
                </p>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2">
                  <span className="text-white/40 font-light block text-xl mb-1 tracking-widest uppercase">
                    {profile.honorific_title}
                  </span>
                  {profile.full_name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {profile.department && (
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 text-white/80 border border-white/10 text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2">
                    <Briefcase size={12} />
                    <span>{profile.department.name}</span>
                  </div>
                )}
                {profile.school && (
                  <Link
                    href={`/schools/${profile.school.slug || profile.school.id}`}
                    className="bg-primary/20 backdrop-blur-md px-3 py-1.5 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 hover:bg-[#ff7f50] hover:text-white transition-colors"
                  >
                    <GraduationCap size={12} />
                    <span>{profile.school.name}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-20">
            {profile.show_message &&
              (profile.message || profile.school?.dean_message) && (
                <section className="relative">
                  <div className="absolute -top-10 -left-6 text-primary/10 select-none">
                    <MessageSquare size={120} />
                  </div>
                  <div className="relative z-10 p-10 bg-white border-l-8 border-primary shadow-xl shadow-slate-200/50">
                    <div
                      className="prose prose-lg prose-slate italic font-serif text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(
                          profile.message || profile.school?.dean_message
                        ),
                      }}
                    />
                    <div className="mt-6 flex items-center space-x-4">
                      <div className="w-10 h-[1px] bg-slate-200" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {t("officialStatement")}
                      </span>
                    </div>
                  </div>
                </section>
              )}

            <section className="space-y-8">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">
                  {t("professionalBio")}
                </h2>
                <div className="flex-1 h-[1px] bg-slate-200" />
              </div>
              <div
                className="prose prose-lg max-w-none text-slate-600 leading-relaxed font-medium"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(
                    profile.bio || profile.school?.dean_bio || t("noBio")
                  ),
                }}
              />
            </section>

            {profile.academic_qualifications && (
              <section className="space-y-8">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">
                    {t("academicMatrix")}
                  </h2>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 border border-slate-100 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-slate-50 transition-colors group-hover:text-primary/10">
                      <GraduationCap size={64} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">
                      {t("qualifications")}
                    </h4>
                    <div
                      className="prose prose-sm font-bold text-slate-700 space-y-2"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(profile.academic_qualifications),
                      }}
                    />
                  </div>
                  {profile.specializations && (
                    <div className="bg-primary-darker p-8 shadow-2xl relative group overflow-hidden text-white">
                      <div className="absolute top-0 right-0 p-4 text-white/5">
                        <Search size={64} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">
                        {t("coreSpecializations")}
                      </h4>
                      <ul className="space-y-4">
                        {profile.specializations
                          .split(",")
                          .map((s: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start space-x-3 group"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 transition-transform" />
                              <span className="text-sm font-bold text-white/90 tracking-tight">
                                {s.trim()}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {profile.show_publications && profile.publications && (
              <section className="space-y-8">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">
                    {t("selectedPubs")}
                  </h2>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>
                <div className="bg-white border border-slate-200 overflow-hidden">
                  <div
                    className="p-8 prose prose-slate max-w-none font-medium text-slate-700"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(profile.publications),
                    }}
                  />
                  <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {t("academicVerification")}
                    </span>
                    {profile.google_scholar_url && (
                      <a
                        href={profile.google_scholar_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest hover:underline"
                      >
                        <span>{t("viewGoogleScholar")}</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )}

            {profile.orcid_id && (
              <section className="space-y-8">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-black text-primary-darker uppercase tracking-tighter flex items-center gap-2">
                    <img
                      src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png"
                      alt="ORCID"
                      className="w-5 h-5"
                    />
                    {t("verifiedOrcidWorks")}
                  </h2>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>
                <div className="bg-white border border-slate-200 p-8 flex flex-col items-center text-center">
                  <BookOpen size={48} className="text-slate-200 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">
                    {t("orcidSyncedTitle")}
                  </h3>
                  <p className="text-slate-500 mb-6">{t("orcidSyncedBody")}</p>
                  <a
                    href={`https://orcid.org/${profile.orcid_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#A6CE39] text-white px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-full hover:bg-[#8eb32c] transition-colors flex items-center gap-2"
                  >
                    {t("viewOrcidRecord")} <ExternalLink size={14} />
                  </a>
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white border border-slate-200 shadow-2xl p-10 space-y-8 sticky top-32">
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-tighter text-primary-darker">
                  {t("getInTouch")}
                </h3>
                <div className="w-12 h-1 bg-primary" />
              </div>

              <div className="space-y-6">
                {profile.is_public_contact && profile.email && (
                  <div className="flex items-center space-x-4 p-4 hover:bg-slate-50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all">
                      <Mail size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {t("officialEmail")}
                      </p>
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-sm font-black text-primary-darker hover:text-primary break-all"
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>
                )}

                {profile.is_public_contact && profile.phone_number && (
                  <div className="flex items-center space-x-4 p-4 hover:bg-slate-50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all">
                      <Phone size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {t("phone")}
                      </p>
                      <a
                        href={`tel:${profile.phone_number}`}
                        className="text-sm font-black text-primary-darker"
                      >
                        {profile.phone_number}
                      </a>
                    </div>
                  </div>
                )}

                {profile.show_research_links && (
                  <div className="pt-6 border-t border-slate-100 grid grid-cols-4 gap-4">
                    {[
                      { url: profile.linkedin_url, icon: Linkedin, label: "LinkedIn" },
                      { url: profile.twitter_url, icon: Twitter, label: "Twitter" },
                      { url: profile.github_url, icon: Github, label: "GitHub" },
                      {
                        url: profile.website_url,
                        icon: Globe,
                        label: t("personalSite"),
                      },
                    ]
                      .filter((social) => social.url)
                      .map((social: any) => (
                        <a
                          key={social.label}
                          href={social.url}
                          target="_blank"
                          rel="noreferrer"
                          title={social.label}
                          className="w-full aspect-square bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white hover:shadow-lg hover:border-[#ff7f50]/20 transition-all rounded-md"
                        >
                          <social.icon size={20} />
                        </a>
                      ))}
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-3">
                <Link
                  href={`/about/staff/${profile.profile_slug}/cv`}
                  className="w-full bg-[#ff7f50] text-white py-4 px-6 flex items-center justify-center space-x-3 text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-[#ff7f50]/30 hover:bg-[#e0663a] transition-all"
                >
                  <BookOpen size={16} />
                  <span>{t("downloadCv")}</span>
                </Link>
                <button className="w-full bg-white border border-slate-200 text-slate-500 py-4 px-6 flex items-center justify-center space-x-3 text-xs font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-md hover:text-primary transition-all">
                  <Share2 size={16} />
                  <span>{t("shareProfile")}</span>
                </button>
              </div>
            </div>

            {profile.researchgate_url && (
              <div className="bg-primary-darker p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
                <div className="relative z-10 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">
                    {t("academicNetwork")}
                  </h4>
                  <p className="text-sm font-bold text-white/70 leading-relaxed">
                    {t("researchGateBody")}
                  </p>
                  <a
                    href={profile.researchgate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 text-white hover:text-primary transition-colors font-black uppercase tracking-tighter text-xs"
                  >
                    <span>{t("accessProjects")}</span>
                    <ArrowLeft size={14} className="rotate-180" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedMembers.length > 0 && (
          <section className="mt-32 pt-20 border-t border-slate-200 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
              <div>
                <h2 className="text-3xl font-black text-primary-darker uppercase tracking-tighter animate-fade-in">
                  {t("relatedPersonnel")}
                </h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
                  {t("discoveryWithin", {
                    circle: profile.department?.name || t("academicCircle"),
                  })}
                </p>
              </div>
              <Link
                href="/about/staff"
                className="mt-6 md:mt-0 px-8 py-3 bg-white border border-slate-200 text-primary-darker text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ff7f50] hover:text-white transition-all shadow-xl"
              >
                {t("viewDirectory")}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedMembers.map((member: any) => (
                <Link
                  key={member.id}
                  href={`/about/staff/${member.profile_slug}`}
                  className="group bg-white border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                    <img
                      src={
                        resolveImageUrl(member.profile_image_url) ||
                        PROFILE_IMAGE_PLACEHOLDER_DATA_URI
                      }
                      alt={member.full_name}
                      className="standard-image transform group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                        <span>{t("viewFullIdentity")}</span>
                        <ArrowLeft size={12} className="rotate-180" />
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary">
                      {member.job_title || member.staff_type?.name}
                    </p>
                    <h4 className="text-lg font-black text-primary-darker tracking-tighter leading-none">
                      {member.honorific_title} {member.full_name}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 group-hover:text-slate-600 transition-colors">
                      {member.department?.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.full_name,
            honorificPrefix: profile.honorific_title,
            jobTitle:
              profile.job_title ||
              profile.designation ||
              profile.staff_type?.name,
            worksFor: {
              "@type": "CollegeOrUniversity",
              name: "Open University of Kenya",
              sameAs: "https://ouk.ac.ke",
            },
            url: `https://ouk.ac.ke/about/staff/${profile.profile_slug}`,
            image: displayImage,
            email: profile.is_public_contact ? profile.email : undefined,
            telephone: profile.is_public_contact
              ? profile.phone_number
              : undefined,
            sameAs: [
              profile.linkedin_url,
              profile.twitter_url,
              profile.google_scholar_url,
              profile.researchgate_url,
              profile.website_url,
              profile.github_url,
            ].filter(Boolean),
          }),
        }}
      />
    </div>
  );
}
