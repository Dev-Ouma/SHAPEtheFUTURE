"use client";

import React, { useState, useEffect } from "react";
import { getApi } from "@/lib/api";
import PermissionGate from "@/components/admin/PermissionGate";

// Icons
const IShield = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const ISearch = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

export default function AuditLogsPage() {
  return (
    <PermissionGate permission="logs.view">
      <AuditLogsPageInner />
    </PermissionGate>
  );
}

function AuditLogsPageInner() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We would ideally have an endpoint for this in auth or logs controller
    // Since we created the interceptor but not the specific read endpoint, 
    // we assume a /logs or /auth/audit-logs endpoint exists or will exist.
    // For now, this is UI representation of the requested Audit module.
    setLoading(false);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 border border-slate-200">
         <div>
            <h1 className="text-2xl font-black tracking-tighter text-primary-darker flex items-center gap-3">
               <span className="p-2 bg-slate-100 text-slate-800 rounded-xl"><IShield /></span>
               System Audit Trails
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium tracking-wide">Immutable record of security events and privilege operations.</p>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
               <input 
                 type="text" 
                 placeholder="Search logs..." 
                 className="w-full bg-slate-50 border-none pl-10 pr-4 py-3 font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
               />
               <div className="absolute left-4 top-3.5 text-slate-400"><ISearch /></div>
            </div>
         </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                <th className="p-5">Timestamp</th>
                <th className="p-5">User</th>
                <th className="p-5">Action Recorded</th>
                <th className="p-5">IP Address</th>
                <th className="p-5">Security Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading audit trails...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No security events found matching criteria.</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 text-slate-500 font-medium">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-slate-800">{log.user?.full_name || 'System / Unknown'}</p>
                    <p className="text-xs text-slate-500">{log.user?.email}</p>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${log.action.includes('PASSWORD') || log.action.includes('LOCK') ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-5 text-slate-500 font-mono text-xs">
                    {log.ip_address || '—'}
                  </td>
                  <td className="p-5">
                    <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View Payload</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
