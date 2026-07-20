"use client";

import React from 'react';
import TutorialForm from '@/components/admin/library/TutorialForm';
import PermissionGate from '@/components/admin/PermissionGate';

export default function NewTutorialPage() {
  return (
    <PermissionGate permission="knowledge_hub.manage">
      <div className="p-12">
        <TutorialForm />
      </div>
    </PermissionGate>
  );
}
