"use client";

import React from 'react';
import WorkshopForm from '@/components/admin/library/WorkshopForm';
import PermissionGate from '@/components/admin/PermissionGate';

export default function NewWorkshopPage() {
  return (
    <PermissionGate permission="knowledge_hub.manage">
      <div className="p-12">
        <WorkshopForm />
      </div>
    </PermissionGate>
  );
}
