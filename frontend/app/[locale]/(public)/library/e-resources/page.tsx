import React from 'react';
import { getTranslations } from 'next-intl/server';
import EResourcesClient from '@/components/library/EResourcesClient';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'EResources' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

export default async function EResourcesPage() {
  return (
    <main>
      <EResourcesClient />
    </main>
  );
}
