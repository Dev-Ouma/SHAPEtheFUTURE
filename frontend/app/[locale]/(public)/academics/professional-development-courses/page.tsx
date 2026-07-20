import React from "react";
import { getShortCourses, getShortCourseCategories, getShortCourseMethods, getSchools, getShortCourseDepartments } from "@/lib/api";
import ShortCourseCatalogClient from "@/components/ShortCourseCatalogClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "ShortCourses" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function ShortCoursesPage({ 
  params,
  searchParams 
}: { 
  params: { locale: string };
  searchParams: { school?: string; q?: string; category?: string; level?: string; mode?: string; page?: string; department?: string } 
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "ShortCourses" });
  const [initialCoursesData, categories, methods, schools, departments] = await Promise.all([
    getShortCourses({
      school: searchParams.school,
      search: searchParams.q,
      category: searchParams.category,
      level: searchParams.level,
      mode: searchParams.mode,
      department: searchParams.department,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: 10,
      locale,
    }),
    getShortCourseCategories(),
    getShortCourseMethods(),
    getSchools(locale),
    getShortCourseDepartments()
  ]);

  const courses = initialCoursesData?.data || [];
  const total = initialCoursesData?.total || 0;
  const totalPages = initialCoursesData?.totalPages || 1;

  const initialFilters = {
    school: searchParams.school || "",
    search: searchParams.q || "",
    category: searchParams.category || "",
    level: searchParams.level || "",
    mode: searchParams.mode || "",
    department: searchParams.department || "",
    page: searchParams.page ? parseInt(searchParams.page) : 1
  };

  return (
    <div className="bg-white min-h-screen">
      {/* High-Fidelity Hero */}
      <header className="bg-primary-darker pt-48 pb-40 px-6 border-b-8 border-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-3xl -ml-32 -mb-32" />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10 text-center space-y-8">
           <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4 border border-primary/20">
             {t("eyebrow")}
           </span>
           <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase font-serif">
             {t("title")} <br/> <span className="text-primary">{t("titleAccent")}</span>
           </h1>
           <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
             {t("body")}
           </p>
        </div>
      </header>

      {/* Discovery Hub */}
      <main className="py-24 container mx-auto px-6 max-w-7xl -mt-20 relative z-20">
         <div className="bg-white p-2 shadow-2xl mb-12 hidden lg:block border border-slate-100">
            <div className="flex bg-slate-50 p-6 items-center justify-between">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("govLabel")}</p>
                  <p className="text-xs font-black text-primary-darker uppercase">{t("govValue")}</p>
               </div>
               <div className="h-10 w-px bg-slate-200" />
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("certTypeLabel")}</p>
                  <p className="text-xs font-black text-primary-darker uppercase">{t("certTypeValue")}</p>
               </div>
               <div className="h-10 w-px bg-slate-200" />
               <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("accreditationLabel")}</p>
                  <p className="text-xs font-black text-primary-darker uppercase">{t("accreditationValue")}</p>
               </div>
            </div>
         </div>

         <ShortCourseCatalogClient 
           initialCourses={courses} 
           categories={categories}
           methods={methods}
           schools={schools}
           departments={departments}
           initialTotal={total}
           initialTotalPages={totalPages}
           initialFilters={initialFilters}
         />
      </main>
    </div>
  );
}
