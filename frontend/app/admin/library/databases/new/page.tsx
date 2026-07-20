"use client";

import React from 'react';
import DatabaseForm from '@/components/admin/library/DatabaseForm';
import PermissionGate from '@/components/admin/PermissionGate';

export default function NewDatabasePage() {
  return (
    <PermissionGate permission="knowledge_hub.manage">
      <div className="p-12">
        <DatabaseForm />
      </div>
    </PermissionGate>
  );
}
