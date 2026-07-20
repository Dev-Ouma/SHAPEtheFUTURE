import React from 'react';
import { notFound } from 'next/navigation';
import EResourceDetailClient from '@/components/library/EResourceDetailClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getEResource } from '@/lib/api';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: PageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'EResources' });
  const resource = await getEResource(params.slug);
  if (!resource) return { title: t('resourceNotFound') };

  return {
    title: `${resource.meta_title || resource.title} | OUK Library`,
    description: resource.meta_description || resource.summary,
  };
}

export default async function EResourcePage({ params }: PageProps) {
  const resource = await getEResource(params.slug);

  if (!resource) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main>
        <EResourceDetailClient resource={resource} />
      </main>
      <Footer />
    </>
  );
}
