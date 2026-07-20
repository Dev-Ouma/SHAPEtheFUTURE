"use client";

import Link from "next/link";

export default function SidebarManager() {
  return (
    <div className="min-h-[70vh] p-10 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white border border-slate-100 shadow-sm p-10 md:p-14 space-y-6">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Retired</p>
          <h1 className="text-4xl md:text-5xl font-black text-primary-darker tracking-tighter uppercase">
            Sidebar <span className="text-primary">Manager</span>
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            The admin sidebar is now defined in repo configuration and cached at build time.
            This editor has been retired to keep navigation fast, deterministic, and easier to review.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="px-6 py-3 text-xs font-black uppercase tracking-widest bg-primary text-white">
            Back to dashboard
          </Link>
          <Link href="/admin/menus" className="px-6 py-3 text-xs font-black uppercase tracking-widest border border-slate-200 text-slate-600 hover:text-primary hover:border-primary transition-colors">
            Retired menu notice
          </Link>
        </div>
      </div>
    </div>
  );
}
