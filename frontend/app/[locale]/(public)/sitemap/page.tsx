import React from 'react';
import { Link } from '@/i18n/routing';
import { ArrowRight, BookOpen, GraduationCap, Map, Users, HelpCircle, FileText, Globe } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Sitemap' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

export default async function SitemapPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Sitemap' });

  const sections = [
    {
      title: t('aboutUs'),
      icon: <Globe className="w-5 h-5 text-primary" />,
      links: [
        { label: t('aboutOuk'), url: '/about' },
        { label: t('leadership'), url: '/about/leadership' },
        { label: t('visionMission'), url: '/about#vision' },
        { label: t('careers'), url: '/admissions/careers' },
        { label: t('contactUs'), url: '/contact' },
      ],
    },
    {
      title: t('academics'),
      icon: <BookOpen className="w-5 h-5 text-primary" />,
      links: [
        { label: t('programmes'), url: '/programmes' },
        { label: t('schoolsFaculties'), url: '/academics/schools' },
        { label: t('shortCourses'), url: '/programmes?mode=short' },
        { label: t('academicTimetables'), url: '/academics/timetables' },
      ],
    },
    {
      title: t('admissions'),
      icon: <GraduationCap className="w-5 h-5 text-primary" />,
      links: [
        { label: t('howToApply'), url: '/admissions#how-to-apply' },
        { label: t('entryRequirements'), url: '/admissions#entry-requirements' },
        { label: t('feeStructure'), url: '/admissions#fees' },
        { label: t('scholarshipsFinancing'), url: '/admissions#scholarships' },
      ],
    },
    {
      title: t('studentLife'),
      icon: <Users className="w-5 h-5 text-primary" />,
      links: [
        { label: t('studentPortal'), url: '/admin', target: '_blank', external: true },
        { label: t('campusLife'), url: '/students/campus-life' },
        { label: t('alumniNetwork'), url: '/alumni' },
        { label: t('libraryServices'), url: '/library' },
      ],
    },
    {
      title: t('supportResources'),
      icon: <HelpCircle className="w-5 h-5 text-primary" />,
      links: [
        { label: t('helpCenter'), url: '/students/support' },
        { label: t('downloadsPolicies'), url: '/students/downloads' },
        { label: t('faqs'), url: '/faqs' },
      ],
    },
    {
      title: t('legalPrivacy'),
      icon: <FileText className="w-5 h-5 text-primary" />,
      links: [
        { label: t('privacyPolicy'), url: '/privacy' },
        { label: t('termsOfService'), url: '/terms' },
        { label: t('cookiePolicy'), url: '/cookies' },
      ],
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('title')}</h1>
          </div>
          <p className="text-slate-500 text-lg max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  {section.icon}
                </div>
                <h2 className="text-lg font-bold text-slate-800">{section.title}</h2>
              </div>
              
              <ul className="space-y-4">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    {(link as { external?: boolean }).external ? (
                      <a
                        href={link.url}
                        target={(link as { target?: string }).target || '_blank'}
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </a>
                    ) : (
                      <Link 
                        href={link.url}
                        className="group flex items-center justify-between text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
