"use client";

import React from 'react';
import EResourceForm from '@/components/admin/library/EResourceForm';
import PermissionGate from '@/components/admin/PermissionGate';

export default function NewEResourcePage() {
  return (
    <PermissionGate permission="knowledge_hub.manage">
      <div className="space-y-8">
        <EResourceForm />
      </div>
    </PermissionGate>
  );
}
