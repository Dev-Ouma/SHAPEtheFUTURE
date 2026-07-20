
import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage, getStaffDirectory } from "@/lib/api";
import PageLayout from "@/components/PageLayout";
import LeadershipLayout from "@/components/LeadershipLayout";
import UniquenessLayout from "@/components/layouts/UniquenessLayout";
import SectionHubLayout from "@/components/layouts/SectionHubLayout";
import DownloadsHubLayout from "@/components/layouts/DownloadsHubLayout";
import ComplaintsHubLayout from "@/components/layouts/ComplaintsHubLayout";
import HowToApplyLayout from "@/components/layouts/HowToApplyLayout";
import SectionSidebar from "@/components/SectionSidebar";
import PersonnelGrid from "@/components/sections/PersonnelGrid";
import { 
  Settings,
  Zap,
  Briefcase,
  ShieldCheck,
  Cpu,
  Workflow,
  ChevronRight,
  Layers
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { sanitizeHtml } from "@/lib/sanitize";
import { getTranslations } from "next-intl/server";
import { LocalizedHtml } from "@/components/LocalizedCms";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 3600; // 1 hour ISR

export async function generateMetadata({ params }: { params: { slug: string[]; locale: string } }): Promise<Metadata> {
  const { slug, locale } = params;
  const fullSlug = Array.isArray(slug) ? slug.join('/') : slug;
  const page = await getPage(fullSlug, locale);
  
  if (!page) {
    return withLocaleSeo(`/${fullSlug}`, locale, { title: 'Page Not Found' });
  }
  
  return withLocaleSeo(`/${fullSlug}`, locale, {
    title: `${page.title} | Open University of Kenya`,
    description: page.summary || `Information about ${page.title}`,
    openGraph: {
      title: page.title,
      description: page.summary || '',
      images: page.banner_image ? [page.banner_image] : [],
    }
  });
}

export default async function DynamicPage({ params }: { params: { slug: string[]; locale: string } }) {
  const { slug, locale } = params;
  const fullSlug = Array.isArray(slug) ? slug.join('/') : slug;
  const tLayouts = await getTranslations({ locale, namespace: "CmsLayouts" });
  const tMgmt = await getTranslations({ locale, namespace: "Management" });

  const isProtectedPath = 
    fullSlug?.startsWith('admin') || 
    fullSlug?.startsWith('support') || 
    fullSlug?.startsWith('api');

  if (isProtectedPath) {
    return null;
  }

    const page = await getPage(fullSlug, locale);

  if (!page) {
    return notFound();
  }

  // Build breadcrumbs based on slug parts
  const breadcrumbs = fullSlug.split('/').map((part, idx, arr) => ({
    title: part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    link: '/' + arr.slice(0, idx + 1).join('/')
  }));

  const parentSlug = fullSlug.includes('/') ? fullSlug.split('/')[0] : fullSlug;

  const needsCouncil = page.layout_template === 'governing-council';
  const needsBoard = page.layout_template === 'management-board';
  const [councilMembers, boardMembers] = await Promise.all([
    needsCouncil
      ? getStaffDirectory("Governing Council").catch(() => [])
      : Promise.resolve([] as any[]),
    needsBoard
      ? getStaffDirectory("University Management Board").catch(() => [])
      : Promise.resolve([] as any[]),
  ]);

  // Render specialized layout if template is set
  if (page.layout_template === 'leadership') {
    return <LeadershipLayout page={page} />;
  }

  if (page.layout_template === 'uniqueness') {
    return <UniquenessLayout page={page} breadcrumbs={breadcrumbs} />;
  }

  if (page.layout_template === 'downloads-hub') {
    return <DownloadsHubLayout page={page} breadcrumbs={breadcrumbs} />;
  }

  if (page.layout_template === 'complaints-hub') {
    return <ComplaintsHubLayout page={page} breadcrumbs={breadcrumbs} />;
  }

  if (page.layout_template === 'how-to-apply-hub') {
    return <HowToApplyLayout page={page} breadcrumbs={breadcrumbs} />;
  }

  // Top-level section pages (single slug = no '/') use the hub layout
  const isTopLevelSection = !fullSlug.includes('/');
  if (isTopLevelSection) {
    return <SectionHubLayout page={page} parentSlug={fullSlug} />;
  }

  return (
    <PageLayout
      title={page.title}
      summary={page.summary}
      bannerImage={page.banner_image}
      breadcrumbs={breadcrumbs}
      sidebar={<SectionSidebar parentSlug={parentSlug} />}
    >
      <div className="space-y-16">
        {/* Dynamic Governance Sections */}
        {page.layout_template === 'governing-council' && (
          <div className="space-y-12">
            {page.layout_data?.cards && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {page.layout_data.cards.map((card: any, i: number) => (
                  <div key={i} className="bg-slate-50 p-8 border border-slate-100 space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">{card.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            )}
            <PersonnelGrid
              executiveType="Governing Council"
              title={tLayouts("councilMembership")}
              initialMembers={Array.isArray(councilMembers) ? councilMembers : []}
            />
          </div>
        )}
        {page.layout_template === 'management-board' && (
          <div className="space-y-12">
            <PersonnelGrid
              executiveType="University Management Board"
              title={tLayouts("boardMembership")}
              initialMembers={Array.isArray(boardMembers) ? boardMembers : []}
            />

            {/* Operational Excellence Feature - High Impact Dark Section */}
            {(page.layout_data?.show_operational_excellence || page.layout_data?.cards) && (
              <section className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24 py-32 text-white relative overflow-hidden rounded-[4rem]">
                 {/* Background Decoration */}
                 <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none text-secondary select-none">
                    <Settings size={600} strokeWidth={1} />
                 </div>
                 
                 <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10 text-left">
                    <div className="space-y-10">
                       <div className="inline-flex items-center space-x-4">
                          <div className="w-12 h-px bg-secondary" />
                          <span className="text-secondary font-black uppercase tracking-[0.4em] text-[11px]">{tMgmt("mandateBadge")}</span>
                       </div>
                       
                       <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter font-serif leading-[0.85]">
                          {tMgmt("execution")} <br/> 
                          <span className="text-secondary italic lowercase">{tMgmt("atThe")}</span> <br/> 
                          {tMgmt("speedOfTech")}
                       </h2>
                       
                       <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                          {page.layout_data?.accent_text || tMgmt("mandateBody")}
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {(page.layout_data?.cards || []).map((item: any, i: number) => (
                         <div 
                           key={i} 
                           className="bg-white/5 border border-white/10 p-10 space-y-6 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all group"
                         >
                            <div className="w-12 h-12 bg-white/5 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                               {i === 0 ? <Layers size={20} className="text-secondary" /> : 
                                i === 1 ? <Zap size={20} className="text-secondary" /> :
                                i === 2 ? <Briefcase size={20} className="text-secondary" /> :
                                <ShieldCheck size={20} className="text-secondary" />}
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-lg font-black uppercase tracking-tight text-white">{item.title}</h4>
                              <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </section>
            )}

            {/* Institutional Core Matrix */}
            {page.layout_data?.ecosystem && (
              <section className="py-20">
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 text-left">
                    <div className="max-w-2xl">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-4">{tMgmt("opsBadge")}</span>
                       <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-primary-darker font-serif leading-none">{tMgmt("ecosystemTitle")}</h2>
                    </div>
                    <p className="text-slate-500 font-medium max-w-sm">{tMgmt("ecosystemBody")}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                    {page.layout_data.ecosystem.map((func: any, i: number) => (
                      <Link key={i} href={func.link || "#"} className="group flex flex-col items-start bg-slate-50 p-12 border border-slate-100 hover:bg-white hover:shadow-[30px_30px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-3 transition-all duration-700">
                         <div className="mb-10 w-20 h-20 bg-white flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm">
                            {i === 0 ? <Cpu className="text-secondary" size={36} /> : 
                             i === 1 ? <Workflow className="text-primary" size={36} /> : 
                             <Settings className="text-slate-400" size={36} />}
                         </div>
                         <div className="mt-auto space-y-6">
                            <div className={`h-1 w-12 ${i === 0 ? 'bg-secondary' : i === 1 ? 'bg-primary' : 'bg-slate-400'} opacity-30 group-hover:w-full group-hover:opacity-100 transition-all duration-700`} />
                            <h3 className="text-3xl font-black uppercase tracking-tighter text-primary-darker leading-none">{func.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{func.desc}</p>
                            <div className="pt-4 flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
                              <span>{tMgmt("initiateProtocol")}</span>
                              <ChevronRight size={14} />
                            </div>
                         </div>
                      </Link>
                    ))}
                 </div>
              </section>
            )}
          </div>
        )}

        <LocalizedHtml
          locale={locale}
          swSource={page.content_sw}
          html={sanitizeHtml(page.content)}
          className="dynamic-content prose prose-slate max-w-none"
        />
      </div>

      {/* Structured Data: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((bc, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": bc.title,
              "item": `https://ouk.ac.ke${bc.link}`
            }))
          })
        }}
      />
      
      {/* Structured Data: WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": (page.layout_template === 'governing-council' || page.layout_template === 'management-board' || fullSlug.includes('about')) ? "AboutPage" : "WebPage",
            "name": page.title,
            "description": page.summary || `Information about ${page.title} at the Open University of Kenya`,
            "url": `https://ouk.ac.ke/${fullSlug}`,
            "publisher": {
              "@type": "CollegeOrUniversity",
              "name": "Open University of Kenya"
            }
          })
        }}
      />
    </PageLayout>
  );
}
