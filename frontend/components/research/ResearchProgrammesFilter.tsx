"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

export default function ResearchProgrammesFilter({ schools }: { schools: any[] }) {
  const t = useTranslations("Research");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [schoolId, setSchoolId] = useState(searchParams.get("schoolId") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSchoolId(searchParams.get("schoolId") || "");
    setStatus(searchParams.get("status") || "");
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) params.set("search", search);
    else params.delete("search");
    
    if (schoolId) params.set("schoolId", schoolId);
    else params.delete("schoolId");
    
    if (status) params.set("status", status);
    else params.delete("status");
    
    params.set("page", "1");
    
    router.push(`/research/programmes?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setSchoolId("");
    setStatus("");
    router.push("/research/programmes");
  };

  const schoolOptions = [
    { value: "", label: t("allSchoolsInstitutes") },
    ...schools.map(s => ({ value: s.id, label: s.name || s.title }))
  ];

  const statusOptions = [
    { value: "", label: t("allStatuses") },
    { value: "active", label: t("activeInitiatives") },
    { value: "planned", label: t("underPlanning") },
    { value: "completed", label: t("completedStatus") },
    { value: "archived", label: t("archivedStatus") }
  ];

  const hasFilters = searchParams.get("search") || searchParams.get("schoolId") || searchParams.get("status");

  return (
    <div className="sticky top-[80px] z-40 bg-white border-b border-slate-100 shadow-sm transition-all">
      <div className="container mx-auto max-w-7xl px-6">
        <form onSubmit={applyFilters} className="flex flex-col md:flex-row items-stretch gap-0">
          <div className="relative flex-grow border-r border-slate-100">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={t("searchProgrammesPlaceholder")}
              className="w-full h-full pl-14 pr-6 py-6 text-[12px] font-bold uppercase tracking-widest bg-transparent outline-none placeholder:text-slate-300 placeholder:normal-case placeholder:tracking-normal"
            />
          </div>

          <div className="border-r border-slate-100 md:max-w-[280px] flex items-center bg-white">
            <CustomSelect
              options={schoolOptions}
              value={schoolId}
              onChange={(val) => setSchoolId(val)}
              className="w-full h-full [&>div>button]:py-6 [&>div>button]:rounded-none [&>div>button]:border-none [&>div>button]:bg-transparent hover:bg-slate-50 transition-colors"
            />
          </div>

          <div className="border-r border-slate-100 md:max-w-[240px] flex items-center bg-white">
            <CustomSelect
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val)}
              className="w-full h-full [&>div>button]:py-6 [&>div>button]:rounded-none [&>div>button]:border-none [&>div>button]:bg-transparent hover:bg-slate-50 transition-colors"
            />
          </div>
          
          <div className="flex">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="bg-slate-100 text-slate-500 px-8 py-6 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 hover:text-primary-darker transition-all whitespace-nowrap border-r border-slate-200"
              >
                {t("clear")}
              </button>
            )}
            <button
              type="submit"
              className="bg-primary-darker text-white px-12 py-6 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all whitespace-nowrap flex-1"
            >
              {t("applyFilters")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
