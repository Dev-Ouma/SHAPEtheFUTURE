import Link from "next/link";

export default function MenusPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full bg-white border border-slate-200 shadow-sm p-10 md:p-12 space-y-6">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Retired Tool</p>
          <h1 className="text-3xl md:text-4xl font-black text-primary-darker uppercase tracking-tighter">
            Navigation editor retired
          </h1>
          <p className="text-slate-600 leading-relaxed max-w-prose">
            The public navigation is now defined in the repository and rendered from cached config.
            This admin editor is no longer used for production link management.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-slate-50 border border-slate-200 p-5 space-y-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Source of truth</h2>
            <p className="text-sm text-slate-600">Edit the link tree in `frontend/lib/navigation.ts`.</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-5 space-y-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Legacy data</h2>
            <p className="text-sm text-slate-600">Existing menu records remain available for backward compatibility only.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="btn-primary px-6 py-3 text-xs font-black uppercase tracking-widest">
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
