"use client";

import React from 'react';
import InfoLiteracyConfigForm from '@/components/admin/library/InfoLiteracyConfigForm';
import PermissionGate from '@/components/admin/PermissionGate';

export default function InfoLiteracyAdminPage() {
  return (
    <PermissionGate permission={['knowledge_hub.view', 'knowledge_hub.manage']}>
      <div className="space-y-8">
        <InfoLiteracyConfigForm />
      </div>
    </PermissionGate>
  );
}
