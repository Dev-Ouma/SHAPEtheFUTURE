"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DatabaseForm from '@/components/admin/library/DatabaseForm';
import { getApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import PermissionGate from '@/components/admin/PermissionGate';

export default function EditDatabasePage() {
  return (
    <PermissionGate permission="knowledge_hub.manage">
      <EditDatabasePageInner />
    </PermissionGate>
  );
}

function EditDatabasePageInner() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getApi(`/library/databases/${id}`);
        if (!res) {
          setNotFound(true);
        } else {
          setData(res);
        }
      } catch (error) {
        console.error("Failed to fetch database:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-12 text-center">
        <p className="text-lg font-black text-primary-darker">Database not found</p>
        <p className="text-sm text-slate-500">This database entry may have been removed or the link is invalid.</p>
        <Link href="/admin/library/databases" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
          Back to databases
        </Link>
      </div>
    );
  }

  return (
    <div className="p-12">
      <DatabaseForm id={id as string} initialData={data} />
    </div>
  );
}
