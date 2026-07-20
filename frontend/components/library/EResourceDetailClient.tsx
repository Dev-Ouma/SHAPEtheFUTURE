"use client";

import React, { useEffect } from 'react';
import { 
  ChevronLeft, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Info, 
  Tag, 
  Download,
  Eye,
  MousePointer2
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { trackEResourceView, trackEResourceClick, resolveImageUrl } from '@/lib/api';
import { sanitizeHtml } from '@/lib/sanitize';

interface Props {
  resource: any;
}

export default function EResourceDetailClient({ resource }: Props) {
  const t = useTranslations('EResources');
  
  useEffect(() => {
    if (resource?.id) {
       trackEResourceView(resource.id);
    }
  }, [resource?.id]);

  const handleAccess = () => {
    if (resource?.id) {
      trackEResourceClick(resource.id);
    }
  };

  if (!resource) return null;

  const isOpenAccess = resource.access_type === 'Open Access';

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-100 py-6">
        <div className="container mx-auto px-4">
          <Link 
            href="/library/e-resources" 
            className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors gap-1 mb-4"
          >
            <ChevronLeft size={16} />
            {t('backToEResources')}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {resource.resource_type}
                </span>
                {isOpenAccess ? (
                  <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold uppercase">
                    <Unlock size={14} />
                    {t('openAccess')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase">
                    <Lock size={14} />
                    {t('institutionalAccess')}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-darker leading-tight flex items-center gap-3">
                 {resource.title}
                 {resource.is_featured && <StarIcon label={t('featured')} />}
              </h1>
            </div>
            
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1.5">
                <Eye size={16} />
                {t('viewsCount', { count: resource.view_count || 0 })}
              </span>
              <span className="flex items-center gap-1.5">
                <MousePointer2 size={16} />
                {t('accessesCount', { count: resource.click_count || 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <section className="mb-10">
              <h2 className="text-xl font-bold text-primary-darker mb-4 flex items-center gap-2">
                <Info size={20} className="text-primary" />
                {t('aboutResource')}
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
                <p className="font-medium text-slate-800 text-lg">
                  {resource.summary}
                </p>
                <div 
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(resource.description) }} 
                  className="rich-content"
                />
              </div>
            </section>

            {resource.access_instructions && (
              <section className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 mb-10">
                <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Lock size={18} />
                  {t('accessInstructions')}
                </h2>
                <div 
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(resource.access_instructions) }}
                  className="text-blue-800 text-sm leading-relaxed"
                />
              </section>
            )}

            {/* Metadata Tags */}
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('classifications')}</h3>
              <div className="flex flex-wrap gap-2">
                {resource.subjects?.map((s: any) => (
                  <span key={s.id} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                    <Tag size={14} className="text-slate-400" />
                    {s.name}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar / Actions */}
          <aside>
            <div className="sticky top-24 space-y-6">
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <h3 className="font-bold text-primary-darker mb-6 flex items-center gap-2">
                  <ExternalLink size={20} className="text-primary" />
                  {t('resourceAccess')}
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200">
                    <span className="text-slate-500">{t('provider')}</span>
                    <span className="font-semibold text-primary-darker">{resource.provider?.name || t('institutionalProvider')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-200">
                    <span className="text-slate-500">{t('accessLevel')}</span>
                    <span className={`font-semibold ${isOpenAccess ? 'text-green-600' : 'text-blue-600'}`}>
                       {isOpenAccess ? t('openAccess') : t('institutionalAccess')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {resource.external_url && (
                    <a 
                      href={resource.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleAccess}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                    >
                      {t('accessOnline')}
                      <ExternalLink size={18} />
                    </a>
                  )}
                  {resource.file_url && (
                    <a 
                      href={resolveImageUrl(resource.file_url)}
                      download
                      onClick={handleAccess}
                      className="w-full py-4 bg-primary-darker text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                    >
                      {t('downloadFile')}
                      <Download size={18} />
                    </a>
                  )}
                </div>
              </div>

              {/* Tips / Help */}
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                   <Info size={16} />
                   {t('libraryTip')}
                </h4>
                <p className="text-xs text-primary/70 leading-relaxed">
                  {t('libraryTipBody')}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StarIcon({ label }: { label: string }) {
  return (
    <div className="p-1 px-2 bg-amber-100 text-amber-600 rounded-md text-[10px] font-black uppercase tracking-tighter">
      {label}
    </div>
  );
}
