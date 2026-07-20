"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const IGoogle = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface School { id: string; name: string; }
interface Programme { id: number; programme_code: string; name: string; }
interface Level { id: string; name: string; }
interface ClassLesson {
    instructor: string; instructorImage?: string;
    courseCode: string; courseTitle: string;
    mode: string; session: string; color: string;
}
interface TTData { days: string[]; timeSlots: string[]; data: Record<string, Record<string, ClassLesson[]>>; }
interface ExamEntry { day: string; time: string; courseCode: string; courseName: string; level: string; programs: string[]; }

// ─── API ───────────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// NOTE: <T,> trailing comma — required in .tsx to avoid JSX parse conflict
async function apiFetch<T,>(url: string, fallback: T): Promise<T> {
    try { const r = await fetch(url); return r.ok ? r.json() : fallback; }
    catch { return fallback; }
}

const fetchSchools = () => apiFetch<School[]>(`${API}/timetables/schools`, []);
const fetchProgrammes = (sid: string) =>
    apiFetch<{ programmes: Programme[] }>(`${API}/timetables/programmes?school_id=${sid}`, { programmes: [] })
        .then(d => d.programmes);
const fetchLevels = (sid: string, pid: string) =>
    apiFetch<{ data: Level[] }>(`${API}/timetables/levels?school_id=${sid}&programme_id=${pid}`, { data: [] })
        .then(d => d.data);
const fetchClassTimetable = (sid: string, pid: string, lid: string) =>
    apiFetch<TTData>(`${API}/timetables/class?school_id=${sid}&programme_id=${pid}&level_id=${lid}`, { days: [], timeSlots: [], data: {} });
const fetchExams = (sid?: string, pid?: string) => {
    const p = new URLSearchParams();
    if (sid) p.set("school_id", sid);
    if (pid) p.set("programme_id", pid);
    return apiFetch<ExamEntry[]>(`${API}/timetables/exams?${p}`, []);
};
const fetchTimetableSettings = () =>
  apiFetch<Record<string, string>>(`${API}/settings/public`, {});

// ─── Icons ─────────────────────────────────────────────────────────────────────

const ICalendar = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IClipboard = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const IChevDown = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
const IChevRight = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
const ICheck = () => <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const IGrid = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IList = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const IClock = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IMonitor = () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ISun = () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>;
const ISearch = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IFilter = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;
const IX = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const IUser = () => <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ISchool = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const IDot = () => <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />;
const IDownload = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

// ─── Google Calendar Link Builder ──────────────────────────────────────────────
function getNextDayOccurrence(dayName: string, timeString: string, startDateStr?: string) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetDay = days.indexOf(dayName);
    if (targetDay === -1) return new Date();
    
    const baseDate = startDateStr ? new Date(startDateStr) : new Date();
    const baseDayOfWeek = baseDate.getDay();
    let daysUntil = targetDay - baseDayOfWeek;
    if (daysUntil < 0) daysUntil += 7; 

    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + daysUntil);
    
    const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) {
        nextDate.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
    } else {
        nextDate.setHours(8, 0, 0, 0);
    }
    
    return nextDate;
}

function formatGCalDate(date: Date) {
    return date.toISOString().replace(/-|:|\.\d{3}/g, "");
}

function buildGCalUrl(lesson: ClassLesson, day: string, slot: string, settings: Record<string, string> = {}) {
    const title = encodeURIComponent(`${lesson.courseCode} — ${lesson.courseTitle || ""} (OUK)`);
    const details = encodeURIComponent(`Instructor: ${lesson.instructor}\nMode: ${lesson.mode}\nSession: ${lesson.session}`);
    const loc = encodeURIComponent("Online — OUK Student Portal");
    
    const start = getNextDayOccurrence(day, slot, settings.timetable_gcal_semester_start_date);
    const durationHours = parseInt(settings.timetable_gcal_class_duration_hours || "3", 10);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    const datesStr = `${formatGCalDate(start)}/${formatGCalDate(end)}`;
    
    let recurRule = "RRULE:FREQ=WEEKLY";
    if (settings.timetable_gcal_semester_end_date) {
        const endDate = new Date(settings.timetable_gcal_semester_end_date);
        endDate.setUTCHours(23, 59, 59, 999);
        recurRule += `;UNTIL=${formatGCalDate(endDate)}`;
    } else {
        recurRule += `;COUNT=14`;
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}&dates=${datesStr}&recur=${recurRule}&sf=true&output=xml`;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`rounded-xl ${className}`}
            style={{ animation: "ttSkel 1.6s ease-in-out infinite", background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%" }} />
    );
}

// ─── Custom Dropdown ───────────────────────────────────────────────────────────

interface SelectProps {
    label: string; value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    disabled?: boolean;
    searchable?: boolean;
}

function Select({ label, value, onChange, options, placeholder, disabled = false, searchable = false }: SelectProps) {
    const t = useTranslations("Timetables");
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const selected = options.find(o => o.value === value);

    // Close on outside click / Escape
    useEffect(() => {
        if (!open) { setQuery(""); return; }
        const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
    }, [open]);

    // Auto-focus search when opened
    useEffect(() => {
        if (open && searchable) {
            setTimeout(() => searchRef.current?.focus(), 60);
        }
    }, [open, searchable]);

    const visible = searchable && query
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    return (
        <div className="space-y-1.5" ref={ref}>
            <label className="block text-[9px] font-black tracking-[0.18em] uppercase text-slate-400">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setOpen(o => !o)}
                    disabled={disabled}
                    className={[
                        "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all outline-none",
                        disabled ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                            : open ? "bg-white border-[#00a3a1] shadow-sm text-slate-800"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 cursor-pointer",
                    ].join(" ")}
                >
                    <span className={`truncate ${!selected ? (disabled ? "text-slate-300" : "text-slate-400") : ""}`}>
                        {disabled ? "—" : (selected?.label ?? placeholder)}
                    </span>
                    <span className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#00a3a1]" : "text-slate-400"}`}>
                        <IChevDown />
                    </span>
                </button>

                {open && !disabled && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden origin-top"
                        style={{ animation: "ttDrop 0.14s ease-out both" }}>

                        {/* Search box */}
                        {searchable && (
                            <div className="px-3 pt-3 pb-2 border-b border-slate-100">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <ISearch />
                                    </span>
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        placeholder={t("searchPlaceholder")}
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border-2 border-slate-100 focus:border-[#00a3a1] outline-none font-medium bg-slate-50 transition-all"
                                    />
                                    {query && (
                                        <button type="button" onClick={() => setQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <IX />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="max-h-52 overflow-y-auto py-1.5">
                            {visible.length === 0 ? (
                                <p className="px-4 py-3 text-xs text-slate-400 italic">{query ? t("noResultsFor", { query }) : t("noOptions")}</p>
                            ) : (
                                visible.map(o => (
                                    <button key={o.value} type="button"
                                        onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                                        className={[
                                            "w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                                            o.value === value
                                                ? "bg-[#00a3a1]/5 text-[#00a3a1] font-bold"
                                                : "text-slate-700 font-medium hover:bg-slate-50 hover:text-white",
                                        ].join(" ")}
                                    >
                                        <span className="truncate leading-snug">{o.label}</span>
                                        {o.value === value && <span className="text-[#00a3a1]"><ICheck /></span>}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Lesson Card ───────────────────────────────────────────────────────────────

function LessonCard({ lesson, day, slot, settings }: { lesson: ClassLesson, day: string, slot: string, settings: Record<string, string> }) {
    const [imgErr, setImgErr] = useState(false);
    return (
        <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            style={{ background: lesson.color || "#00a3a1" }}>
            <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/30 bg-white/20">
                        {lesson.instructorImage && !imgErr
                            ? <img src={lesson.instructorImage} alt={lesson.instructor} onError={() => setImgErr(true)} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-white/60"><IUser /></div>}
                    </div>
                    <p className="text-white text-[11px] font-bold leading-tight line-clamp-2 flex-1">{lesson.instructor}</p>
                </div>
                <div className="bg-black/20 rounded-xl px-2.5 py-2">
                    <p className="text-white font-black text-[11px] tracking-wide">{lesson.courseCode}</p>
                    {lesson.courseTitle && <p className="text-white/75 text-[10px] italic leading-snug mt-0.5 line-clamp-2">{lesson.courseTitle}</p>}
                </div>
                <div className="flex flex-wrap gap-1">
                    {lesson.mode && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            <IMonitor /> {lesson.mode.replace("Synchronous online", "Sync")}
                        </span>
                    )}
                    {lesson.session && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            <ISun /> {lesson.session}
                        </span>
                    )}
                    <a href={buildGCalUrl(lesson, day, slot, settings)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-[9px] font-bold text-white/90 bg-[#4285F4]/30 hover:bg-[#4285F4]/60 px-2 py-0.5 rounded-full uppercase tracking-wide transition-colors">
                        <IGoogle /> Sync
                    </a>
                </div>
            </div>
        </div>
    );
}

// ─── Welcome Panel (default state before any filter) ──────────────────────────

function WelcomePanel({ schools, onSelectSchool }: { schools: School[]; onSelectSchool: (id: string) => void }) {
    const t = useTranslations("Timetables");
    return (
        <div className="py-8 tt-fade">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-darker text-white mb-5">
                    <ICalendar />
                </div>
                <h3 className="text-xl font-black text-primary-darker mb-2">{t("welcomeTitle")}</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    {t("welcomeBody")}
                </p>
            </div>

            {schools.length > 0 && (
                <div className="grid sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
                    {schools.map(s => (
                        <button key={s.id} onClick={() => onSelectSchool(s.id)}
                            className="group bg-white border-2 border-slate-100 rounded-2xl p-5 text-left hover:border-[#00a3a1] hover:shadow-lg transition-all duration-200">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3 group-hover:bg-[#00a3a1]/10 group-hover:text-[#00a3a1] transition-colors">
                                <ISchool />
                            </div>
                            <p className="text-xs font-black text-slate-800 leading-snug">{s.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium group-hover:text-[#00a3a1] transition-colors">{t("viewProgrammes")}</p>
                        </button>
                    ))}
                </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto border-t border-slate-100 pt-8">
                {[
                    { icon: <IMonitor />, title: t("onlineSessions"), desc: t("onlineSessionsDesc") },
                    { icon: <IClock />, title: t("eastAfricaTime"), desc: t("eastAfricaTimeDesc") },
                    { icon: <IClipboard />, title: t("liveData"), desc: t("liveDataDesc") },
                ].map(c => (
                    <div key={c.title} className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">{c.icon}</div>
                        <div>
                            <p className="text-[11px] font-black text-slate-700">{c.title}</p>
                            <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{c.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Class Timetable ──────────────────────────────────────────────────────────

interface ClassTimetableProps { schoolId: string; programmeId: string; levelId: string; programmeName: string; onDataReady?: (tt: TTData) => void; }

function ClassTimetableView({ schoolId, programmeId, levelId, programmeName, onDataReady }: ClassTimetableProps) {
    const t = useTranslations("Timetables");
    const [tt, setTt] = useState<TTData | null>(null);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<"grid" | "list">("grid");
    const [activeDay, setActiveDay] = useState("");
    const [settings, setSettings] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchTimetableSettings().then(setSettings);
    }, []);

    useEffect(() => {
        if (!schoolId || !programmeId || !levelId) { setTt(null); return; }
        setLoading(true);
        fetchClassTimetable(schoolId, programmeId, levelId)
            .then(d => { setTt(d); setActiveDay(d.days[0] || ""); onDataReady?.(d); })
            .finally(() => setLoading(false));
    }, [schoolId, programmeId, levelId]);

    if (!levelId) return (
        <div className="flex flex-col items-center justify-center py-16 text-center tt-fade">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4"><ICalendar /></div>
            <p className="text-sm font-black text-slate-500">{t("selectLevelTitle")}</p>
            <p className="text-xs text-slate-400 mt-1">{t("selectLevelBody")}</p>
        </div>
    );

    if (loading) return (
        <div className="space-y-3 pt-2 tt-fade">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
    );

    if (!tt || tt.timeSlots.length === 0) return (
        <div className="flex flex-col items-center justify-center py-16 text-center tt-fade">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-400 mb-4"><ICalendar /></div>
            <p className="text-sm font-black text-slate-500">{t("noSessionsTitle")}</p>
            <p className="text-xs text-slate-400 mt-1">{t("noSessionsBody")}</p>
        </div>
    );

    const activeDays = tt.days.filter(d => tt.timeSlots.some(s => tt.data[s]?.[d]?.length));
    const totalSessions = Object.values(tt.data).flatMap(d => Object.values(d)).flat().length;
    const listItems = tt.timeSlots.flatMap(slot => activeDays.flatMap(day => (tt.data[slot]?.[day] ?? []).map(lesson => ({ slot, day, lesson }))));
    const filteredList = (activeDay && view === "list") ? listItems.filter(i => i.day === activeDay) : listItems;

    return (
        <div className="tt-fade">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-5">
                <div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-[#00a3a1] mb-0.5">{t("schedule")}</p>
                    <h3 className="text-sm font-black text-primary-darker leading-tight">{programmeName || t("classTimetable")}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{t("levelSessionsDays", { level: levelId, sessions: totalSessions, days: activeDays.length })}</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 self-start">
                    {([{ k: "grid" as const, I: IGrid }, { k: "list" as const, I: IList }]).map(({ k, I }) => (
                        <button key={k} onClick={() => setView(k)}
                            className={`p-2 rounded-lg transition-all duration-200 ${view === k ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                            <I />
                        </button>
                    ))}
                </div>
            </div>

            {view === "list" && (
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 flex-nowrap">
                    {(["", ...activeDays]).map(d => (
                        <button key={d || "all"} onClick={() => setActiveDay(d)}
                            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${activeDay === d ? "bg-primary-darker text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                            {d || t("all")}
                        </button>
                    ))}
                </div>
            )}

            {view === "grid" && (
                <div className="overflow-x-auto -mx-2 px-2">
                    <table className="w-full min-w-[520px] border-collapse">
                        <thead>
                            <tr>
                                <th className="w-16 py-3 px-2 text-left text-[9px] font-black tracking-widest uppercase text-slate-400 bg-slate-50 border border-slate-100">EAT</th>
                                {activeDays.map(d => (
                                    <th key={d} className="py-3 px-2 bg-slate-50 border border-slate-100 text-center">
                                        <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider text-slate-600">{d}</span>
                                        <span className="sm:hidden text-[10px] font-black uppercase tracking-wider text-slate-600">{d.slice(0, 3)}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tt.timeSlots.map(slot => {
                                const hasAny = activeDays.some(d => tt.data[slot]?.[d]?.length);
                                return (
                                    <tr key={slot} className={hasAny ? "" : "opacity-25"}>
                                        <td className="py-2 px-2 text-[10px] font-black text-slate-400 border border-slate-100 bg-slate-50/80 whitespace-nowrap align-top">{slot}</td>
                                        {activeDays.map(day => {
                                            const lessons = tt.data[slot]?.[day] ?? [];
                                            return (
                                                <td key={day} className="p-1.5 border border-slate-100 align-top min-w-[120px]">
                                                    {lessons.length > 0
                                                        ? <div className="space-y-1.5">{lessons.map((l, li) => <LessonCard key={li} lesson={l} day={day} slot={slot} settings={settings} />)}</div>
                                                        : <div className="min-h-[2.5rem]" />}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {view === "list" && (
                <div className="space-y-2">
                    {filteredList.length === 0
                        ? <p className="text-center text-slate-400 py-12 text-sm">{t("noSessionsShort")}</p>
                        : filteredList.map(({ slot, day, lesson }, i) => (
                            <div key={i} className="flex gap-3 bg-white border border-slate-100 rounded-2xl p-3.5 hover:shadow-md hover:border-slate-200 transition-all duration-200">
                                <div className="w-12 flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-sm" style={{ background: lesson.color }}>{slot}</div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{day.slice(0, 3)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {lesson.instructorImage && (
                                            <img src={lesson.instructorImage} alt={lesson.instructor}
                                                onError={e => (e.currentTarget.style.display = "none")}
                                                className="w-8 h-8 rounded-full object-cover border flex-shrink-0"
                                                style={{ borderColor: lesson.color }} />
                                        )}
                                        <p className="text-sm font-bold text-slate-800 truncate">{lesson.instructor}</p>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        <span className="font-black text-slate-800">{lesson.courseCode}</span>
                                        {lesson.courseTitle && <span className="italic text-slate-500 ml-1">— {lesson.courseTitle}</span>}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {lesson.mode && <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-wide"><IMonitor /> {lesson.mode.replace("Synchronous online", "Sync")}</span>}
                                        {lesson.session && <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-[#00a3a1]/10 text-[#00a3a1] px-2.5 py-1 rounded-full uppercase tracking-wide"><ISun /> {lesson.session}</span>}
                                        <a href={buildGCalUrl(lesson, day, slot, settings)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] font-bold text-white bg-[#4285F4] hover:bg-[#4285F4]/90 px-2.5 py-1 rounded-full uppercase tracking-wide transition-colors">
                                            <IGoogle /> Sync
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

// ─── Exams View ────────────────────────────────────────────────────────────────

function ExamsView({ schoolId, programmeId, onDataReady }: { schoolId: string; programmeId: string; onDataReady?: (e: ExamEntry[]) => void }) {
    const t = useTranslations("Timetables");
    const [exams, setExams] = useState<ExamEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filterLevel, setFilterLevel] = useState("");

    useEffect(() => {
        setLoading(true);
        fetchExams(schoolId || undefined, programmeId || undefined)
          .then(data => { setExams(data); onDataReady?.(data); })
          .finally(() => setLoading(false));
    }, [schoolId, programmeId]);

    const levels = useMemo(() => Array.from(new Set(exams.map(e => e.level).filter(Boolean))).sort(), [exams]);
    const filtered = useMemo(() => exams.filter(e => {
        const q = search.toLowerCase();
        return (!search || e.courseCode.toLowerCase().includes(q) || e.courseName.toLowerCase().includes(q) || e.programs.some(p => p.toLowerCase().includes(q)))
            && (!filterLevel || e.level === filterLevel);
    }), [exams, search, filterLevel]);
    const grouped = useMemo(() => {
        const g: Record<string, ExamEntry[]> = {};
        filtered.forEach(e => { if (!g[e.day]) g[e.day] = []; g[e.day].push(e); });
        return g;
    }, [filtered]);

    if (loading) return <div className="space-y-3 pt-2 tt-fade">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;

    return (
        <div className="tt-fade">
            {exams.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: t("totalExams"), value: exams.length },
                        { label: t("examDays"), value: new Set(exams.map(e => e.day)).size },
                        { label: t("programmes"), value: new Set(exams.flatMap(e => e.programs)).size },
                    ].map(s => (
                        <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                            <div className="text-xl font-black text-slate-800 mb-0.5">{s.value}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex gap-3 mb-6 flex-col sm:flex-row">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ISearch /></span>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={t("searchCourseProgramme")}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:border-[#00a3a1] outline-none transition-all bg-white" />
                </div>
                {levels.length > 1 && (
                    <Select label="" value={filterLevel} onChange={setFilterLevel}
                        placeholder={t("allLevels")}
                        options={levels.map(l => ({ value: l, label: t("levelN", { level: l }) }))} />
                )}
            </div>

            {Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4"><IClipboard /></div>
                    <p className="text-sm font-black text-slate-500">{search || filterLevel ? t("noMatchingResults") : t("noExamSchedule")}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([day, entries]) => (
                        <div key={day}>
                            <div className="flex items-center gap-3 mb-4 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10 border-b border-slate-100">
                                <div className="w-2 h-2 rounded-full bg-[#00a3a1] flex-shrink-0" />
                                <h3 className="text-sm font-black text-slate-800">{day}</h3>
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{entries.length === 1 ? t("examCount", { count: entries.length }) : t("examCountPlural", { count: entries.length })}</span>
                            </div>
                            <div className="space-y-2.5">
                                {(entries as ExamEntry[]).map((exam, i) => (
                                    <div key={i} className="flex overflow-hidden border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-md transition-all duration-200">
                                        <div className="w-24 sm:w-28 bg-primary-darker text-white flex flex-col items-center justify-center gap-1.5 p-3 flex-shrink-0">
                                            <IClock />
                                            <span className="text-xs font-black text-center leading-tight">{exam.time}</span>
                                        </div>
                                        <div className="flex-1 bg-white p-4 min-w-0">
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                <span className="text-[10px] font-black bg-[#00a3a1]/10 text-[#00a3a1] px-2.5 py-1 rounded-lg tracking-wide">{exam.courseCode}</span>
                                                {exam.level && <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg">{t("levelN", { level: exam.level })}</span>}
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 leading-snug">{exam.courseName}</p>
                                            {exam.programs.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {exam.programs.map((p, pi) => (
                                                        <span key={pi} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">{p}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
    tab: "class" | "exam";
    schools: School[]; programmes: Programme[]; levels: Level[];
    schoolId: string; programmeId: string; levelId: string;
    loadingP: boolean; loadingL: boolean;
    onSchool: (v: string) => void; onProgramme: (v: string) => void; onLevel: (v: string) => void;
    onClear: () => void;
    selectedSchool?: School; selectedProgramme?: Programme;
}

function Sidebar({ tab, schools, programmes, levels, schoolId, programmeId, levelId, loadingP, loadingL, onSchool, onProgramme, onLevel, onClear, selectedSchool, selectedProgramme }: SidebarProps) {
    const t = useTranslations("Timetables");
    return (
        <div className="space-y-4">
            {/* Filter card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-8 h-8 bg-primary-darker rounded-xl flex items-center justify-center text-white"><IFilter /></div>
                    <div>
                        <h2 className="text-xs font-black tracking-widest uppercase text-primary-darker">{t("filters")}</h2>
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">{t("narrowSchedule")}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <Select label={t("school")} value={schoolId} onChange={onSchool}
                        placeholder={t("selectSchool")}
                        options={schools.map(s => ({ value: s.id, label: s.name }))} />
                    <Select label={t("programme")} value={programmeId} onChange={onProgramme}
                        placeholder={loadingP ? t("loading") : t("selectProgramme")}
                        disabled={!schoolId || loadingP}
                        searchable
                        options={programmes.map(p => ({ value: String(p.id), label: `${p.programme_code} — ${p.name}` }))} />
                    {tab === "class" && (
                        <Select label={t("yearSemester")} value={levelId} onChange={onLevel}
                            placeholder={loadingL ? t("loading") : t("selectLevel")}
                            disabled={!programmeId || loadingL}
                            options={levels.map(l => ({ value: l.id, label: t("yearN", { name: l.name }) }))} />
                    )}
                </div>
                {(schoolId || programmeId || levelId) && (
                    <button onClick={onClear} className="mt-5 w-full flex items-center justify-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-slate-400 hover:text-rose-500 py-2 transition-colors">
                        <IX /> {t("clearFilters")}
                    </button>
                )}
            </div>

            {/* School quick-pick */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <p className="text-[9px] font-black tracking-[0.18em] uppercase text-slate-400 mb-3">{t("quickSelect")}</p>
                <div className="space-y-1">
                    {schools.map(s => (
                        <button key={s.id} onClick={() => onSchool(s.id)}
                            className={`w-full text-left text-xs px-3.5 py-2.5 rounded-xl transition-all duration-200 font-semibold flex items-center justify-between gap-2 group ${schoolId === s.id ? "bg-primary-darker text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
                            <span className="truncate">{s.name}</span>
                            {schoolId !== s.id && <span className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><IChevRight /></span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selection summary */}
            {(selectedSchool || selectedProgramme) && (
                <div className="bg-primary-darker rounded-3xl p-5 text-white tt-fade">
                    <p className="text-[9px] font-black tracking-[0.18em] uppercase text-slate-500 mb-4">{t("currentSelection")}</p>
                    <div className="space-y-3">
                        {selectedSchool && <div><p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{t("school")}</p><p className="text-xs font-bold leading-snug">{selectedSchool.name}</p></div>}
                        {selectedProgramme && <div><p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{t("programme")}</p><p className="text-[11px] font-black text-[#00a3a1]">{selectedProgramme.programme_code}</p><p className="text-[10px] text-slate-400 leading-snug">{selectedProgramme.name}</p></div>}
                        {levelId && <div><p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{t("level")}</p><p className="text-xs font-bold">{t("yearN", { name: levelId })}</p></div>}
                    </div>
                </div>
            )}

            {/* Note */}
            <div className="bg-[#00a3a1]/5 border border-[#00a3a1]/15 rounded-3xl p-5">
                <p className="text-[9px] font-black tracking-widest uppercase text-[#00a3a1] mb-2">{t("note")}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{t.rich("noteBody", { strong: (chunks) => <strong>{chunks}</strong> })}</p>
            </div>
        </div>
    );
}

// ─── Root Component ────────────────────────────────────────────────────────────

export default function TimetablesClient() {
    const t = useTranslations("Timetables");
    const tCommon = useTranslations("Common");
    const locale = useLocale();
    const dateLocale = locale === "sw" ? "sw-KE" : "en-GB";
    const [tab, setTab] = useState<"class" | "exam">("class");
    const [schools, setSchools] = useState<School[]>([]);
    const [programmes, setProgrammes] = useState<Programme[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [schoolId, setSchoolId] = useState("");
    const [programmeId, setProgrammeId] = useState("");
    const [levelId, setLevelId] = useState("");
    const [loadingP, setLoadingP] = useState(false);
    const [loadingL, setLoadingL] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);
    // ── timetable state mirror for PDF template ──
    const [ttSnapshot, setTtSnapshot] = useState<TTData | null>(null);
    const [examsSnapshot, setExamsSnapshot] = useState<ExamEntry[]>([]);

    // Auto-select first school on load
    useEffect(() => {
        fetchSchools().then(list => { setSchools(list); if (list.length) setSchoolId(list[0].id); });
    }, []);

    // Auto-select first programme when school changes
    useEffect(() => {
        setProgrammeId(""); setLevelId(""); setProgrammes([]); setLevels([]);
        if (!schoolId) return;
        setLoadingP(true);
        fetchProgrammes(schoolId).then(list => { setProgrammes(list); if (list.length) setProgrammeId(String(list[0].id)); }).finally(() => setLoadingP(false));
    }, [schoolId]);

    // Auto-select first level when programme changes
    useEffect(() => {
        setLevelId(""); setLevels([]);
        if (!schoolId || !programmeId) return;
        setLoadingL(true);
        fetchLevels(schoolId, programmeId).then(list => { setLevels(list); if (list.length) setLevelId(list[0].id); }).finally(() => setLoadingL(false));
    }, [schoolId, programmeId]);

    const selectedSchool = schools.find(s => s.id === schoolId);
    const selectedProgramme = programmes.find(p => String(p.id) === programmeId);
    const hasSelection = !!(schoolId && programmeId);
    const handleClear = useCallback(() => { setSchoolId(""); setProgrammeId(""); setLevelId(""); }, []);

    // ── PDF Download handler ──────────────────────────────────────────────────
    const handleDownloadPDF = async () => {
        if (!pdfRef.current) return;
        setPdfLoading(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");
            // Temporarily make template visible for capture
            pdfRef.current.style.position = "fixed";
            pdfRef.current.style.left = "-9999px";
            pdfRef.current.style.display = "block";
            await new Promise(r => setTimeout(r, 200));
            const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" });
            pdfRef.current.style.display = "none";
            const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
            const pw = pdf.internal.pageSize.getWidth();
            const ph = pdf.internal.pageSize.getHeight();
            const imgH = (canvas.height * pw) / canvas.width;
            let hl = imgH, pos = 0;
            pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, pos, pw, imgH);
            hl -= ph;
            while (hl > 0) { pos = hl - imgH; pdf.addPage(); pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, pos, pw, imgH); hl -= ph; }
            const prog = selectedProgramme?.programme_code || "Timetable";
            pdf.save(`OUK_${prog.replace(/\s+/g, "_")}_Timetable.pdf`);
        } catch (e) { console.error(e); }
        finally { setPdfLoading(false); }
    };

    // ── Google Calendar URL builder removed as it is now global ──────────────

    // ── .ics export ─────────────────────────────────────────────────────────
    const handleAddToCalendar = () => {
        if (!ttSnapshot) return;
        const lines: string[] = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//OUK//Timetable//EN"];
        const dtNow = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
        ttSnapshot.timeSlots.forEach(slot => {
            ttSnapshot.days.forEach(day => {
                (ttSnapshot.data[slot]?.[day] ?? []).forEach((lesson, i) => {
                    const uid = `${slot}-${day}-${i}@ouk.ac.ke`;
                    lines.push("BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${dtNow}`,
                        `SUMMARY:${lesson.courseCode} — ${lesson.courseTitle || ""}`,
                        `DESCRIPTION:Instructor: ${lesson.instructor}\\nMode: ${lesson.mode}`,
                        `LOCATION:Online — OUK Portal`,
                        `RRULE:FREQ=WEEKLY`, "END:VEVENT");
                });
            });
        });
        lines.push("END:VCALENDAR");
        const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
        a.download = `OUK_${selectedProgramme?.programme_code || "Timetable"}.ics`; a.click();
    };

    const sidebarProps: SidebarProps = {
        tab, schools, programmes, levels, schoolId, programmeId, levelId,
        loadingP, loadingL,
        onSchool: setSchoolId, onProgramme: setProgrammeId, onLevel: setLevelId,
        onClear: handleClear,
        selectedSchool, selectedProgramme,
    };

    return (
        <>
            <style>{`
                @keyframes ttSkel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes ttFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes ttDrop { from{opacity:0;transform:scaleY(0.92) translateY(-4px)} to{opacity:1;transform:scaleY(1) translateY(0)} }
                .tt-fade { animation: ttFade .3s ease-out both; }
                @media print {
                    body * { visibility: hidden !important; }
                    main, main * { visibility: visible !important; color: black !important; }
                    main { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; border: none !important; box-shadow: none !important; }
                    .print\\:hidden, .print\\:hidden * { display: none !important; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                }
            `}</style>

            <section className="py-8 md:py-14 bg-[#fafafa] min-h-screen">
                <div className="container mx-auto px-4 md:px-6 max-w-[1280px]">

                    {/* Stats bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                        {[
                            { label: t("statSchools"), value: schools.length || "—", I: ISchool },
                            { label: t("statScheduleTypes"), value: "2", I: ICalendar },
                            { label: t("statDelivery"), value: t("statDeliveryValue"), I: IMonitor },
                            { label: t("statSemester"), value: t("statSemesterValue"), I: IClock },
                        ].map(s => (
                            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0"><s.I /></div>
                                <div className="min-w-0">
                                    <div className="text-sm font-black text-slate-800 truncate">{s.value}</div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tab + mobile filter toggle */}
                    <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                        <div className="flex gap-1.5 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm">
                            {([
                                { key: "class" as const, full: t("tabClassFull"), short: t("tabClassShort"), I: ICalendar },
                                { key: "exam" as const, full: t("tabExamFull"), short: t("tabExamShort"), I: IClipboard },
                            ]).map(tabItem => (
                                <button key={tabItem.key} onClick={() => setTab(tabItem.key)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black tracking-widest uppercase transition-all duration-200 ${tab === tabItem.key ? "bg-primary-darker text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
                                    <tabItem.I /> <span className="hidden sm:inline">{tabItem.full}</span><span className="sm:hidden">{tabItem.short}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setSidebarOpen(o => !o)}
                            className="lg:hidden flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm">
                            <IFilter /> {t("filters")}
                            {(schoolId || programmeId || levelId) && <span className="w-2 h-2 rounded-full bg-[#00a3a1] ml-1 flex-shrink-0" />}
                        </button>
                    </div>

                    {/* Mobile filter drawer */}
                    {sidebarOpen && (
                        <div className="lg:hidden mb-6 tt-fade">
                            <Sidebar {...sidebarProps} />
                        </div>
                    )}

                    <div className="grid lg:grid-cols-[288px_1fr] gap-6 items-start">
                        {/* Desktop sticky sidebar */}
                        <aside className="hidden lg:block sticky top-28 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pb-4">
                            <Sidebar {...sidebarProps} />
                        </aside>

                        {/* Main content card */}
                        <main className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                            <div className="px-5 sm:px-6 pt-6 pb-5 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-base sm:text-lg font-black text-primary-darker">
                                                {tab === "class" ? t("classTimetable") : t("examinationSchedule")}
                                            </h2>
                                            {hasSelection && (
                                                <div className="hidden sm:flex items-center gap-2">
                                                    <button onClick={handleDownloadPDF} disabled={pdfLoading} className="print:hidden flex items-center gap-1.5 bg-[#00a3a1] hover:bg-[#008f8d] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-sm disabled:opacity-60">
                                                        {pdfLoading ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("generating")}</> : <><IDownload /> {t("pdf")}</>}
                                                    </button>
                                                    {tab === "class" && ttSnapshot && (
                                                        <button onClick={handleAddToCalendar} className="print:hidden flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 hover:border-[#00a3a1] hover:text-[#00a3a1] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-sm">
                                                            <ICalendar /> {t("downloadIcs")}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5 print:hidden">
                                            {tab === "class" ? t("classSubtitle") : t("examSubtitle")}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0 print:hidden">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                                            <IDot /> {t("live")}
                                        </div>
                                        <p className="text-[9px] text-slate-300 font-medium hidden sm:block">{t("viaPlanner")}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                {!hasSelection && tab === "class"
                                    ? <WelcomePanel schools={schools} onSelectSchool={id => { setSchoolId(id); setSidebarOpen(false); }} />
                                    : tab === "class"
                                        ? <ClassTimetableView schoolId={schoolId} programmeId={programmeId} levelId={levelId} programmeName={selectedProgramme?.name ?? ""} onDataReady={setTtSnapshot} />
                                        : <ExamsView schoolId={schoolId} programmeId={programmeId} onDataReady={setExamsSnapshot} />}
                            </div>
                        </main>
                    </div>

                    {/* Bottom links */}
                    <div className="mt-8 grid sm:grid-cols-3 gap-4">
                        {[
                            { I: IMonitor, title: t("studentPortal"), desc: t("studentPortalDesc"), href: "https://portal.ouk.ac.ke", cta: t("openPortal"), external: true },
                            { I: IClipboard, title: t("academicSupport"), desc: t("academicSupportDesc"), href: "mailto:academics@ouk.ac.ke", cta: t("emailSupport"), external: true },
                            { I: ISchool, title: t("programmeGuide"), desc: t("programmeGuideDesc"), href: "/programmes", cta: t("viewProspectus"), external: false },
                        ].map(c => (
                            <div key={c.title} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4"><c.I /></div>
                                <h3 className="text-sm font-black text-slate-800 mb-1.5">{c.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">{c.desc}</p>
                                {c.external ? (
                                  <a href={c.href} className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#00a3a1] hover:gap-2.5 transition-all">
                                      {c.cta} <IChevRight />
                                  </a>
                                ) : (
                                  <Link href={c.href} className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#00a3a1] hover:gap-2.5 transition-all">
                                      {c.cta} <IChevRight />
                                  </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Hidden A4 PDF Template (landscape) ──────────────────── */}
            <div ref={pdfRef} style={{ display: "none", width: "1122px", background: "#fff", fontFamily: "'Inter', sans-serif", padding: "32px 40px" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #001f26", paddingBottom: "16px", marginBottom: "20px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <img src="/icon" alt={tCommon("logoAltShort")} style={{ width: "100%", height: "100%", objectFit: "contain" }} crossOrigin="anonymous" />
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#001f26", letterSpacing: "0.05em" }}>{tCommon("institutionName")}</span>
                        </div>
                        <p style={{ fontSize: "18px", fontWeight: 900, color: "#001f26", margin: 0 }}>
                            {tab === "class" ? t("classTimetable") : t("examinationSchedule")}
                        </p>
                        <p style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>
                            {selectedSchool?.name} · {selectedProgramme?.name} {levelId ? `· ${t("pdfLevel", { level: levelId })}` : ""}
                        </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "9px", color: "#aaa" }}>{t("pdfSemesterLine", { value: t("statSemesterValue") })}</p>
                        <p style={{ fontSize: "9px", color: "#aaa" }}>{t("pdfGenerated", { date: new Date().toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" }) })}</p>
                        <p style={{ fontSize: "9px", color: "#aaa" }}>{t("eastAfricaTimeDesc")}</p>
                    </div>
                </div>

                {/* Class Timetable Table */}
                {tab === "class" && ttSnapshot && ttSnapshot.timeSlots.length > 0 && (() => {
                    const activeDays = ttSnapshot.days.filter(d => ttSnapshot.timeSlots.some(s => ttSnapshot.data[s]?.[d]?.length));
                    return (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
                            <thead>
                                <tr style={{ background: "#001f26" }}>
                                    <th style={{ color: "#fff", padding: "8px 10px", textAlign: "left", fontWeight: 700, letterSpacing: "0.1em", width: "80px" }}>{t("pdfTimeCol")}</th>
                                    {activeDays.map(d => <th key={d} style={{ color: "#fff", padding: "8px 10px", textAlign: "center", fontWeight: 700, letterSpacing: "0.08em" }}>{d}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {ttSnapshot.timeSlots.map((slot, si) => {
                                    const hasAny = activeDays.some(d => ttSnapshot.data[slot]?.[d]?.length);
                                    return (
                                        <tr key={slot} style={{ background: si % 2 === 0 ? "#f8f9fb" : "#fff", opacity: hasAny ? 1 : 0.35 }}>
                                            <td style={{ padding: "8px 10px", fontWeight: 700, color: "#006b6b", whiteSpace: "nowrap", verticalAlign: "top", borderBottom: "1px solid #e2e8f0" }}>{slot}</td>
                                            {activeDays.map(day => {
                                                const lessons = ttSnapshot.data[slot]?.[day] ?? [];
                                                return (
                                                    <td key={day} style={{ padding: "6px", borderBottom: "1px solid #e2e8f0", borderLeft: "1px solid #e2e8f0", verticalAlign: "top" }}>
                                                        {lessons.map((l, li) => (
                                                            <div key={li} style={{ background: l.color || "#006b6b", borderRadius: "4px", padding: "6px 8px", marginBottom: li < lessons.length - 1 ? "4px" : 0 }}>
                                                                <p style={{ color: "#fff", fontWeight: 900, fontSize: "9px", margin: 0 }}>{l.courseCode}</p>
                                                                {l.courseTitle && <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "8px", margin: "2px 0 0" }}>{l.courseTitle}</p>}
                                                                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                                                                    {l.instructorImage && <img src={l.instructorImage} style={{ width: "12px", height: "12px", borderRadius: "50%", objectFit: "cover" }} crossOrigin="anonymous" />}
                                                                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "8px", margin: 0 }}>{l.instructor}</p>
                                                                </div>
                                                                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "7px", margin: "2px 0 0" }}>{l.mode?.replace("Synchronous online", "Sync")}</p>
                                                            </div>
                                                        ))}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    );
                })()}

                {/* Exams Table */}
                {tab === "exam" && examsSnapshot.length > 0 && (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
                        <thead>
                            <tr style={{ background: "#0a2540" }}>
                                {[t("pdfColDay"), t("pdfColTime"), t("pdfColCourseCode"), t("pdfColCourseName"), t("pdfColLevel"), t("pdfColProgrammes")].map(h => (
                                    <th key={h} style={{ color: "#fff", padding: "8px 10px", textAlign: "left", fontWeight: 700, letterSpacing: "0.08em" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {examsSnapshot.map((exam, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? "#f8f9fb" : "#fff" }}>
                                    <td style={{ padding: "7px 10px", fontWeight: 700, color: "#0a2540", borderBottom: "1px solid #e2e8f0" }}>{exam.day}</td>
                                    <td style={{ padding: "7px 10px", color: "#006b6b", fontWeight: 700, borderBottom: "1px solid #e2e8f0" }}>{exam.time}</td>
                                    <td style={{ padding: "7px 10px", fontWeight: 900, borderBottom: "1px solid #e2e8f0" }}>{exam.courseCode}</td>
                                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #e2e8f0" }}>{exam.courseName}</td>
                                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #e2e8f0" }}>{exam.level}</td>
                                    <td style={{ padding: "7px 10px", borderBottom: "1px solid #e2e8f0", fontSize: "8px", color: "#666" }}>{exam.programs.join(", ")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* PDF Footer */}
                <div style={{ marginTop: "24px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "8px", color: "#aaa" }}>{t("pdfFooter")}</p>
                    <p style={{ fontSize: "8px", color: "#aaa" }}>ouk.ac.ke</p>
                </div>
            </div>
        </>
    );
}
