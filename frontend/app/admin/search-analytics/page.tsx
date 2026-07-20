import React from 'react';
import SearchAnalyticsClient from './SearchAnalyticsClient';
import PermissionGate from '@/components/admin/PermissionGate';

export const metadata = {
  title: 'Search Analytics | OUK Admin',
};

export default function SearchAnalyticsPage() {
  // Re-triggering compilation
  return (
    <PermissionGate permission="reports.view">
      <div className="p-6">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic mb-6">Search Analytics</h1>
        <SearchAnalyticsClient />
      </div>
    </PermissionGate>
  );
}
