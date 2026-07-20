import React from "react";
import { getShortCourse, getRelatedShortCourses, getRelatedProgrammes, resolveImageUrl } from "@/lib/api";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, CreditCard, Globe } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import ShortCourseDetailClient from "@/components/ShortCourseDetailClient";

export async function generateMetadata({ params }: { params: { slug: string; locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "ShortCourses" });
  const course = await getShortCourse(params.slug, params.locale);
  return {
    title: course ? `${course.title} | ${t("professionalCertification")} | OUK` : t("certificationNotFound"),
    description: course?.overview?.substring(0, 160) || `Professional training and certification for ${course?.title} at OUK.`,
  };
}

export default async function ShortCoursePage({ params }: { params: { slug: string; locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "ShortCourses" });
  const course = await getShortCourse(params.slug, locale);

  if (!course) {
    notFound();
  }

  const [relatedCourses, relatedProgrammes] = await Promise.all([
    getRelatedShortCourses(course.id),
    getRelatedProgrammes(course.id)
  ]);

  return (
    <div className="bg-white min-h-screen">
      {/* High-Fidelity Header */}
      <header className="bg-primary-darker pt-32 pb-24 px-6 border-b-4 border-primary/30 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 -mr-64 -mt-64 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <nav className="flex items-center justify-between mb-16">
            <Link
              href="/academics/professional-development-courses"
              className="text-white font-black uppercase tracking-widest text-[9px] flex items-center mb-0 hover:text-primary transition-colors group"
            >
              <ArrowLeft size={16} className="mr-3 transform group-hover:-translate-x-1 transition-transform" />
              <span>{t("professionalCatalog")}</span>
            </Link>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="flex items-center space-x-6">
                <span className="bg-secondary text-white px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">
                  {course.code || "SC-" + course.title.substring(0, 3).toUpperCase() + "-01"}
                </span>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  {t("professionalCertification")}
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter uppercase font-serif">
                {course.title || "AI For Business Leaders"}
              </h1>

              <div className="flex flex-wrap gap-12 pt-10">
                <div className="border-l-2 border-primary/40 pl-6">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{t("duration")}</p>
                  <p className="text-white font-black uppercase tracking-tight flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    {course.duration || "4 Weeks"}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-6">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{t("investment")}</p>
                  <p className="text-white font-black uppercase tracking-tight flex items-center gap-2">
                    <CreditCard size={14} className="text-primary" />
                    {course.cost || "KES 45,000"}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-6">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{t("method")}</p>
                  <p className="text-white font-black uppercase tracking-tight flex items-center gap-2">
                    <Globe size={14} className="text-primary" />
                    {course.mode_of_delivery || "Hybrid"}
                  </p>
                </div>
                <div className="border-l-2 border-secondary pl-6">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{t("language")}</p>
                  <p className="text-white font-black uppercase tracking-tight flex items-center gap-2">
                    <span className="text-secondary text-base">⚑</span>
                    {course.language || "English"}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="bg-white aspect-video shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-t-8 border-primary overflow-hidden">
                <img
                  src={resolveImageUrl(course.image_url) || `https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop`}
                  alt={course.title}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="py-24 container mx-auto px-6 max-w-7xl -mt-16 relative z-20">
        <ShortCourseDetailClient
          course={course}
          relatedCourses={relatedCourses}
          relatedProgrammes={relatedProgrammes}
        />
      </section>
    </div>
  );
}
