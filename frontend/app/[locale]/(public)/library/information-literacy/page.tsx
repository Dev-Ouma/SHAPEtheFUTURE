import React from 'react';
import InformationLiteracyClient from '@/components/library/InformationLiteracyClient';
import { getLibraryInfoLiteracy } from '@/lib/api';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Library' });
  const config = await getLibraryInfoLiteracy();
  return {
    title: config?.meta_title || t('infoLitMetaTitle'),
    description: config?.meta_description || t('infoLitMetaDesc'),
  };
}

export default async function InformationLiteracyPage() {
  const config = await getLibraryInfoLiteracy();

  return (
    <main>
      <InformationLiteracyClient config={config} />
    </main>
  );
}
