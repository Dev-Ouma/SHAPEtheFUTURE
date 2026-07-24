import React from 'react';
import { jsonLdScript } from '@/lib/jsonld';

export interface JsonLdProps {
  data: Record<string, any>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Escaped serializer prevents `</script>` breakout from CMS-controlled data.
      dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }}
    />
  );
}
