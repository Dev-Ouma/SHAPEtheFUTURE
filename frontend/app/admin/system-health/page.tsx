"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Server, HardDrive, Cpu, Activity, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { getApi } from "@/lib/api";

export default function SystemHealthDashboard() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHealth() {
      try {
        const data = await getApi("/health/detailed");
        if (!data) {
          setError("Failed to load system health metrics. Sign in as an admin and try again.");
          return;
        }
        setHealthData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load system health metrics.");
      } finally {
        setLoading(false);
      }
    }
    loadHealth();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading enterprise health metrics...</div>;
  if (error) return <div className="p-8 text-center text-red-500"><AlertTriangle className="inline-block mb-2" size={32} /><br/>{error}</div>;

  const { status, info, error: healthErrors } = healthData || {};
  const isHealthy = status === 'ok';

  return (
    <div className="p-8 bg-[#FAFAFA] min-h-screen text-[#1A1A1A]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Server className="text-primary" size={36} />
            System Observability
          </h1>
          <p className="text-gray-500 font-medium tracking-wide mt-1">Enterprise Architecture & DevOps Monitoring</p>
        </div>
        <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${isHealthy ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {isHealthy ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
          System Status: {status?.toUpperCase()}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Database Node */}
        <HealthCard 
          icon={<HardDrive size={24} />}
          title="Database (TypeORM)"
          data={info?.database}
          errorData={healthErrors?.database}
        />
        
        {/* Memory Heap */}
        <HealthCard 
          icon={<Cpu size={24} />}
          title="Memory (Heap)"
          data={info?.memory_heap}
          errorData={healthErrors?.memory_heap}
        />
        
        {/* Memory RSS */}
        <HealthCard 
          icon={<Cpu size={24} />}
          title="Memory (RSS)"
          data={info?.memory_rss}
          errorData={healthErrors?.memory_rss}
        />
        
        {/* Disk Space */}
        <HealthCard 
          icon={<HardDrive size={24} />}
          title="Storage Allocation"
          data={info?.disk_space}
          errorData={healthErrors?.disk_space}
        />
      </div>

      {/* Centralized Logs Teaser */}
      <div className="mt-12 bg-white p-6 border rounded-sm shadow-sm">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity size={20}/> Centralized Logs</h3>
        <p className="text-sm text-gray-500 mb-4">Winston JSON structured logs are being actively written to <code className="bg-gray-100 px-2 py-1 rounded text-xs">backend/logs/combined.log</code>. These logs are ready to be ingested by ELK, Datadog, or Splunk.</p>
      </div>
    </div>
  );
}

function HealthCard({ icon, title, data, errorData }: { icon: React.ReactNode, title: string, data: any, errorData: any }) {
  const currentData = data || errorData;
  const isUp = currentData?.status === 'up';

  return (
    <motion.div whileHover={{ y: -2 }} className={`p-6 rounded-sm border ${isUp ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'} shadow-sm`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-sm ${isUp ? 'bg-blue-50 text-blue-600' : 'bg-red-100 text-red-600'}`}>
          {icon}
        </div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      
      {currentData ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className={`font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>{currentData.status.toUpperCase()}</span>
          </div>
          {Object.entries(currentData).map(([key, value]) => {
            if (key === 'status') return null;
            return (
              <div key={key} className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium text-gray-900 truncate max-w-[150px]" title={String(value)}>
                  {typeof value === 'number' ? (value > 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(2)} MB` : value) : String(value)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-400">No telemetry data available.</div>
      )}
    </motion.div>
  );
}
