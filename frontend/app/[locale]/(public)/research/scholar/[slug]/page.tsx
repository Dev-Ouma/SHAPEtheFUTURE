import React from 'react';
import { Metadata } from 'next';
import { getScholarProfile, resolveImageUrl } from '@/lib/api';
import { notFound } from 'next/navigation';
import ScholarProfileClient from '@/components/research/ScholarProfileClient';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Research' });
  const data = await getScholarProfile(params.slug);
  if (!data) return { title: t('scholarNotFound') };

  return {
    title: t('scholarMetaTitle', { name: data.scholar.full_name }),
    description: data.scholar.bio || t('scholarMetaDesc', { name: data.scholar.full_name }),
    openGraph: {
      images: data.scholar.profile_image_url ? [resolveImageUrl(data.scholar.profile_image_url)] : [],
    }
  };
}

export default async function ScholarProfilePage({ params }: Props) {
  const data = await getScholarProfile(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ScholarProfileClient 
        scholar={data.scholar}
        publications={data.publications}
        projects={data.projects}
        grants={data.grants}
        metrics={data.metrics}
      />
    </div>
  );
}
