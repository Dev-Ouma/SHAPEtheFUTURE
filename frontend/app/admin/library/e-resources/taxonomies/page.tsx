"use client";

import React from 'react';
import TaxonomyManager from '@/components/admin/library/TaxonomyManager';
import PermissionGate from '@/components/admin/PermissionGate';

export default function EResourcesTaxonomyPage() {
  return (
    <PermissionGate permission={['knowledge_hub.view', 'knowledge_hub.manage']}>
      <div className="space-y-8">
        <TaxonomyManager />
      </div>
    </PermissionGate>
  );
}
