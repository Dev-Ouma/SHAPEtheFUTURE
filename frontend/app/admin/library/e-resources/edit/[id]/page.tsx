"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import EResourceForm from '@/components/admin/library/EResourceForm';
import PermissionGate from '@/components/admin/PermissionGate';

export default function EditEResourcePage() {
  return (
    <PermissionGate permission="knowledge_hub.manage">
      <EditEResourcePageInner />
    </PermissionGate>
  );
}

function EditEResourcePageInner() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-8">
      <EResourceForm id={id} />
    </div>
  );
}
