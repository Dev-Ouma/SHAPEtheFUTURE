/**
 * SHAPE Erasmus+ public & admin API helpers.
 * Endpoints expect a Nest `/shape/*` module; fallbacks keep the UI usable offline.
 */
import { getApi, getApiCached, postApi } from "@/lib/api";

export type ShapePartner = {
  id: string;
  slug: string;
  name: string;
  short_name?: string;
  country: string;
  city?: string;
  role?: string;
  consortium_role?: string;
  logo_url?: string;
  website?: string;
  website_url?: string;
  contact_name?: string;
  contact_person?: string;
  contact_email?: string;
  responsibilities?: string;
  deliverables?: string;
  description?: string;
  region?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  order?: number;
};

export type ShapeWorkPackage = {
  id: string;
  slug: string;
  code: string;
  title: string;
  summary?: string;
  description?: string;
  objectives?: string;
  leader?: string;
  leader_partner_slug?: string;
  leader_partner_id?: string;
  partners?: string[];
  partner_ids?: string[];
  timeline_start?: string;
  timeline_end?: string;
  start_date?: string;
  end_date?: string;
  milestones?: { title: string; due?: string; status?: string }[];
  deliverables?: { title: string; status?: string }[];
  documents?: { title: string; url: string }[];
  progress?: number;
  progress_percent?: number;
  status?: string;
  order?: number;
  sort_order?: number;
};

function parseMilestoneList(raw: unknown): { title: string; due?: string; status?: string }[] {
  if (Array.isArray(raw)) {
    return raw
      .map((m: any) => ({
        title: String(m?.title || m?.name || "").trim(),
        due: m?.due || m?.date || undefined,
        status: m?.status || undefined,
      }))
      .filter((m) => m.title);
  }
  if (typeof raw !== "string" || !raw.trim()) return [];
  const text = raw.trim();
  if (text.startsWith("[")) {
    try {
      return parseMilestoneList(JSON.parse(text));
    } catch {
      /* fall through */
    }
  }
  return text
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, due, status] = line.split("|").map((p) => p.trim());
      return { title, due: due || undefined, status: status || undefined };
    });
}

function parseDeliverableList(raw: unknown): { title: string; status?: string }[] {
  if (Array.isArray(raw)) {
    return raw
      .map((d: any) => ({
        title: String(typeof d === "string" ? d : d?.title || d?.name || "").trim(),
        status: typeof d === "object" && d ? d.status : undefined,
      }))
      .filter((d) => d.title);
  }
  if (typeof raw !== "string" || !raw.trim()) return [];
  const text = raw.trim();
  if (text.startsWith("[")) {
    try {
      return parseDeliverableList(JSON.parse(text));
    } catch {
      /* fall through */
    }
  }
  return text
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, status] = line.split("|").map((p) => p.trim());
      return { title, status: status || undefined };
    });
}

/** Map Nest entity fields → public ShapeWorkPackage shape used by the UI. */
export function normalizeWorkPackage(raw: any, partnersById?: Map<string, ShapePartner>): ShapeWorkPackage {
  if (!raw) return raw;
  const leaderPartner = raw.leader_partner;
  const leader =
    raw.leader ||
    leaderPartner?.name ||
    leaderPartner?.short_name ||
    undefined;

  const partnerIds: string[] = Array.isArray(raw.partner_ids) ? raw.partner_ids : [];
  let partners: string[] | undefined = Array.isArray(raw.partners)
    ? raw.partners.map(String)
    : undefined;
  if ((!partners || !partners.length) && partnersById && partnerIds.length) {
    partners = partnerIds
      .map((id) => partnersById.get(String(id))?.short_name || partnersById.get(String(id))?.name)
      .filter(Boolean) as string[];
  }

  // Always re-parse — never trust that deliverables/milestones are already arrays
  // (API returns text columns; RSC payloads may still carry raw strings).
  const milestones = parseMilestoneList(raw.milestones);
  const deliverables = parseDeliverableList(raw.deliverables);

  return {
    id: String(raw.id || raw.slug || raw.code),
    slug: String(raw.slug || ""),
    code: String(raw.code || ""),
    title: String(raw.title || ""),
    summary: raw.summary || raw.description || "",
    description: raw.description || raw.summary || "",
    objectives: raw.objectives || "",
    leader,
    leader_partner_slug: raw.leader_partner_slug || leaderPartner?.slug,
    leader_partner_id: raw.leader_partner_id || leaderPartner?.id,
    partners,
    partner_ids: partnerIds,
    timeline_start: raw.timeline_start || raw.start_date || undefined,
    timeline_end: raw.timeline_end || raw.end_date || undefined,
    start_date: raw.start_date || raw.timeline_start,
    end_date: raw.end_date || raw.timeline_end,
    milestones: Array.isArray(milestones) ? milestones : [],
    deliverables: Array.isArray(deliverables) ? deliverables : [],
    documents: Array.isArray(raw.documents) ? raw.documents : [],
    progress: Number(raw.progress ?? raw.progress_percent ?? 0),
    progress_percent: Number(raw.progress_percent ?? raw.progress ?? 0),
    status: raw.status || "not_started",
    order: Number(raw.order ?? raw.sort_order ?? 0),
    sort_order: Number(raw.sort_order ?? raw.order ?? 0),
  };
}

export function normalizeWorkPackages(
  list: any[],
  partners: ShapePartner[] = [],
): ShapeWorkPackage[] {
  const byId = new Map(partners.map((p) => [p.id, p]));
  return list
    .map((w) => normalizeWorkPackage(w, byId))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export type ShapeEvent = {
  id: string;
  slug: string;
  title: string;
  date?: string;
  end_date?: string;
  venue?: string;
  country?: string;
  host?: string;
  status?: string;
  summary?: string;
  agenda?: string;
  minutes_url?: string;
  presentations_url?: string;
  gallery_urls?: string[];
  attendance?: string;
  outcomes?: string;
};

export type ShapeDocument = {
  id: string;
  title: string;
  /** Canonical category key from CMS (e.g. financial, policy_briefs). */
  category: string;
  /** Display label for the category filter menu. */
  category_label?: string;
  description?: string;
  file_url?: string;
  work_package?: string;
  published_at?: string;
};

export type ShapeActivity = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: "completed" | "in_progress" | "planned" | "delayed" | string;
  work_package?: string;
};

export type ShapeKpi = {
  id: string;
  key: string;
  label: string;
  value: number | string;
  target?: number | string;
  unit?: string;
  progress?: number;
};

export type ShapeRisk = {
  id: string;
  title: string;
  description?: string;
  likelihood?: string;
  impact?: string;
  status?: string;
  mitigation?: string;
  owner?: string;
};

export type ShapeSdlcStage = {
  id: string;
  title: string;
  order: number;
  description?: string;
  objectives?: string;
  progress?: number;
  outputs?: string;
  evidence?: string;
  status?: string;
};

export type ShapeDashboard = {
  overall_completion: number;
  budget_utilization: number;
  deliverables_done: number;
  deliverables_total: number;
  meetings: number;
  countries: number;
  universities: number;
  work_packages: number;
  students_reached: number;
  training_sessions: number;
  research_outputs: number;
  project_years: number;
  events_held: number;
};

function asList<T = any>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

async function cachedList<T>(path: string, fallback: T[]): Promise<T[]> {
  try {
    const data = await getApiCached(path, { revalidate: 120 });
    const list = asList<T>(data);
    return list.length ? list : fallback;
  } catch {
    return fallback;
  }
}

async function cachedOne<T>(path: string, fallback: T | null): Promise<T | null> {
  try {
    const data = await getApiCached(path, { revalidate: 120 });
    return (data as T) || fallback;
  } catch {
    return fallback;
  }
}

/* ── Fallback seed content (public site works before backend ships) ── */

export const SHAPE_PARTNERS_FALLBACK: ShapePartner[] = [
  {
    id: "1",
    slug: "open-university-of-kenya",
    name: "Open University of Kenya",
    short_name: "OUK",
    country: "Kenya",
    city: "Konza",
    role: "Project Coordinator",
    lat: -1.7,
    lng: 37.2,
    contact_name: "SHAPE Project Office",
    contact_email: "shape@ouk.ac.ke",
    responsibilities: "Overall coordination, digital learning leadership, and East Africa dissemination.",
    description: "Coordinator institution for the SHAPE Erasmus+ consortium.",
  },
  {
    id: "2",
    slug: "moi-university",
    name: "Moi University",
    short_name: "MU",
    country: "Kenya",
    city: "Eldoret",
    role: "Partner",
    lat: 0.5143,
    lng: 35.2698,
    responsibilities: "Host kick-off and co-lead curriculum pilots.",
  },
  {
    id: "3",
    slug: "makerere-university",
    name: "Makerere University",
    short_name: "Mak",
    country: "Uganda",
    city: "Kampala",
    role: "Partner",
    lat: 0.3476,
    lng: 32.5825,
  },
  {
    id: "4",
    slug: "kampala-international-university",
    name: "Kampala International University",
    short_name: "KIU",
    country: "Uganda",
    city: "Kampala",
    role: "Partner",
    lat: 0.2945,
    lng: 32.605,
  },
  {
    id: "5",
    slug: "mogadishu-university",
    name: "Mogadishu University",
    short_name: "MU-SOM",
    country: "Somalia",
    city: "Mogadishu",
    role: "Partner",
    lat: 2.0469,
    lng: 45.3182,
  },
  {
    id: "6",
    slug: "red-sea-university",
    name: "Red Sea University",
    short_name: "RSU",
    country: "Somalia",
    city: "Bosaso",
    role: "Partner",
    lat: 11.2842,
    lng: 49.1816,
  },
  {
    id: "7",
    slug: "otto-von-guericke-university",
    name: "Otto von Guericke University",
    short_name: "OVGU",
    country: "Germany",
    city: "Magdeburg",
    role: "EU Partner",
    lat: 52.139,
    lng: 11.64,
  },
  {
    id: "8",
    slug: "university-of-tartu",
    name: "University of Tartu",
    short_name: "UT",
    country: "Estonia",
    city: "Tartu",
    role: "EU Partner",
    lat: 58.378,
    lng: 26.729,
  },
  {
    id: "9",
    slug: "lithuanian-university-of-health-sciences",
    name: "Lithuanian University of Health Sciences",
    short_name: "LSMU",
    country: "Lithuania",
    city: "Kaunas",
    role: "EU Partner",
    lat: 54.8985,
    lng: 23.9036,
  },
];

export const SHAPE_WORK_PACKAGES_FALLBACK: ShapeWorkPackage[] = [
  { id: "1", slug: "wp1-project-management", code: "WP1", title: "Project Management", progress: 40, leader: "Open University of Kenya", summary: "Governance, coordination, and reporting.", order: 1 },
  { id: "2", slug: "wp2-needs-assessment", code: "WP2", title: "Needs Assessment", progress: 55, leader: "Moi University", summary: "Baseline studies across partner cities.", order: 2 },
  { id: "3", slug: "wp3-curriculum-development", code: "WP3", title: "Curriculum Development", progress: 25, leader: "Makerere University", summary: "Smart-city curricula and micro-credentials.", order: 3 },
  { id: "4", slug: "wp4-digital-learning-platform", code: "WP4", title: "Digital Learning Platform", progress: 20, leader: "Open University of Kenya", summary: "Shared digital learning infrastructure.", order: 4 },
  { id: "5", slug: "wp5-pilot-training", code: "WP5", title: "Pilot Training", progress: 10, leader: "Kampala International University", summary: "Trainers and learner cohorts.", order: 5 },
  { id: "6", slug: "wp6-quality-assurance", code: "WP6", title: "Quality Assurance", progress: 30, leader: "University of Tartu", summary: "QA frameworks and peer review.", order: 6 },
  { id: "7", slug: "wp7-dissemination", code: "WP7", title: "Dissemination", progress: 35, leader: "Otto von Guericke University", summary: "Communications and stakeholder outreach.", order: 7 },
  { id: "8", slug: "wp8-sustainability", code: "WP8", title: "Sustainability", progress: 15, leader: "Lithuanian University of Health Sciences", summary: "Long-term institutionalisation.", order: 8 },
];

export const SHAPE_EVENTS_FALLBACK: ShapeEvent[] = [
  {
    id: "1",
    slug: "kick-off-meeting-2026",
    title: "Kick-off Meeting",
    date: "2026-06-18",
    venue: "Moi University",
    country: "Kenya",
    host: "Moi University",
    status: "Completed",
    summary: "Consortium launch and work-package alignment.",
    gallery_urls: [],
    agenda: "Welcome, partner introductions, WP overviews, next steps.",
    outcomes: "Agreed Year-1 roadmap and communication protocols.",
  },
];

export const SHAPE_ACTIVITIES_FALLBACK: ShapeActivity[] = [
  { id: "1", title: "Kick-off Meeting", start: "2026-06", end: "2026-06", status: "completed", work_package: "WP1" },
  { id: "2", title: "Needs Assessment", start: "2026-07", end: "2026-09", status: "in_progress", work_package: "WP2" },
  { id: "3", title: "Curriculum Design", start: "2026-10", end: "2027-03", status: "planned", work_package: "WP3" },
  { id: "4", title: "Platform Development", start: "2027-01", end: "2027-06", status: "planned", work_package: "WP4" },
  { id: "5", title: "Pilot Training", start: "2027-07", end: "2027-12", status: "planned", work_package: "WP5" },
  { id: "6", title: "Evaluation", start: "2028-01", end: "2028-12", status: "planned", work_package: "WP6" },
];

export const SHAPE_DOCUMENTS_FALLBACK: ShapeDocument[] = [
  {
    id: "ph-deliverables",
    title: "Work Package Deliverables Pack",
    category: "deliverables",
    category_label: "Deliverables",
    description: "Placeholder — formal deliverables will appear here as WPs publish outputs.",
    work_package: "WP1",
  },
  {
    id: "1",
    title: "SHAPE Project Brief",
    category: "reports",
    category_label: "Reports",
    description: "Public overview of objectives and partners.",
    published_at: "2026-06-01",
  },
  {
    id: "2",
    title: "Kick-off Agenda",
    category: "minutes",
    category_label: "Minutes",
    description: "Agenda for the June 2026 kick-off.",
    work_package: "WP1",
    published_at: "2026-06-10",
  },
  {
    id: "ph-financial",
    title: "Interim Financial Statement",
    category: "financial",
    category_label: "Financial Reports",
    description: "Placeholder — partner financial summaries will be published after reporting cycles.",
    work_package: "WP1",
  },
  {
    id: "ph-presentations",
    title: "Consortium Kick-off Slide Deck",
    category: "presentations",
    category_label: "Presentations",
    description: "Placeholder — meeting and workshop presentations will be uploaded here.",
    work_package: "WP1",
  },
  {
    id: "ph-policy",
    title: "Smart Cities Higher Education Policy Brief",
    category: "policy_briefs",
    category_label: "Policy Briefs",
    description: "Placeholder — policy briefs for ministries and city partners.",
    work_package: "WP7",
  },
  {
    id: "ph-publications",
    title: "SHAPE Research Note (forthcoming)",
    category: "publications",
    category_label: "Publications",
    description: "Placeholder — peer-reviewed and open publications from the consortium.",
    work_package: "WP7",
  },
  {
    id: "3",
    title: "Dissemination Template",
    category: "templates",
    category_label: "Templates",
    description: "Partner communication template.",
    published_at: "2026-06-15",
  },
];

export const SHAPE_KPIS_FALLBACK: ShapeKpi[] = [
  { id: "1", key: "overall", label: "Overall Completion", value: 28, unit: "%", progress: 28, target: 100 },
  { id: "2", key: "budget", label: "Budget Utilization", value: 18, unit: "%", progress: 18, target: 100 },
  { id: "3", key: "deliverables", label: "Deliverables", value: "6 of 32", progress: 19 },
  { id: "4", key: "meetings", label: "Meetings", value: 4 },
  { id: "5", key: "countries", label: "Countries Engaged", value: 6 },
  { id: "6", key: "students", label: "Students Reached", value: 120, target: 450 },
  { id: "7", key: "training", label: "Training Sessions", value: 3, target: 14 },
  { id: "8", key: "research", label: "Research Outputs", value: 1, target: 5 },
];

export const SHAPE_RISKS_FALLBACK: ShapeRisk[] = [
  {
    id: "1",
    title: "Delayed partner onboarding",
    likelihood: "Medium",
    impact: "High",
    status: "Open",
    mitigation: "Dedicated liaison schedule and shared onboarding pack.",
    owner: "WP1",
  },
  {
    id: "2",
    title: "Curriculum alignment variance",
    likelihood: "Medium",
    impact: "Medium",
    status: "Monitoring",
    mitigation: "Cross-partner curriculum workshops in WP3.",
    owner: "WP3",
  },
];

export const SHAPE_SDLC_FALLBACK: ShapeSdlcStage[] = [
  {
    id: "1",
    title: "Planning",
    order: 1,
    progress: 90,
    status: "completed",
    description: "Grant inception, consortium agreements, and work planning.",
    objectives:
      "Finalize consortium agreements, confirm WP leads, and lock Year-1 workplan and reporting calendar.",
    outputs: "Project handbook · Kick-off minutes · Year-1 workplan",
  },
  {
    id: "2",
    title: "Needs Assessment",
    order: 2,
    progress: 45,
    status: "in_progress",
    description: "Baseline studies and stakeholder mapping.",
    objectives: "Map skills gaps for smart-city higher education across partner cities.",
    outputs: "Needs assessment report · Country briefs · Stakeholder map",
  },
  {
    id: "3",
    title: "Stakeholder Engagement",
    order: 3,
    progress: 40,
    status: "in_progress",
    description: "Partner and community engagement activities.",
    objectives: "Align universities, cities, ministries, and industry around SHAPE priorities.",
    outputs: "Engagement workshops · MoUs · Stakeholder feedback logs",
  },
  {
    id: "4",
    title: "Curriculum Design",
    order: 4,
    progress: 25,
    status: "in_progress",
    description: "Co-creation of modular learning pathways.",
    objectives: "Co-create modular smart-city programmes and micro-credentials.",
    outputs: "Module outlines · Learning outcomes · Assessment frameworks",
  },
  {
    id: "5",
    title: "Platform Development",
    order: 5,
    progress: 20,
    status: "in_progress",
    description: "Digital learning environment build-out.",
    objectives: "Build shared digital learning services for partner institutions.",
    outputs: "Platform MVP · Content upload workflow · Access roles",
  },
  {
    id: "6",
    title: "Testing",
    order: 6,
    progress: 5,
    status: "not_started",
    description: "QA and usability testing of curriculum and platform.",
    objectives: "Validate content quality, accessibility, and platform UX before pilots.",
    outputs: "Test plans · Bug logs · Usability findings",
  },
  {
    id: "7",
    title: "Pilot Implementation",
    order: 7,
    progress: 0,
    status: "not_started",
    description: "Live pilot cohorts across partner institutions.",
    objectives: "Run first learner and trainer cohorts in East African partner universities.",
    outputs: "Pilot cohorts · Trainer packs · Learner feedback",
  },
  {
    id: "8",
    title: "Monitoring",
    order: 8,
    progress: 35,
    status: "in_progress",
    description: "Continuous M&E of activities and outputs.",
    objectives: "Track KPIs, risks, and delivery milestones across all work packages.",
    outputs: "KPI dashboards · Risk register · Progress briefs",
  },
  {
    id: "9",
    title: "Evaluation",
    order: 9,
    progress: 0,
    status: "not_started",
    description: "Mid-term and final evaluation of project impact.",
    objectives: "Assess quality, learning impact, and consortium performance.",
    outputs: "Mid-term evaluation · Final impact report",
  },
  {
    id: "10",
    title: "Sustainability",
    order: 10,
    progress: 5,
    status: "not_started",
    description: "Institutionalization and post-grant continuity.",
    objectives: "Institutionalise curricula, platform, and partnerships beyond the grant.",
    outputs: "Sustainability plan · Institutional adoption roadmap",
  },
];

export const SHAPE_DASHBOARD_FALLBACK: ShapeDashboard = {
  overall_completion: 28,
  budget_utilization: 18,
  deliverables_done: 6,
  deliverables_total: 32,
  meetings: 4,
  countries: 6,
  universities: 9,
  work_packages: 8,
  students_reached: 120,
  training_sessions: 3,
  research_outputs: 1,
  project_years: 3,
  events_held: 1,
};

export const SHAPE_DOCUMENT_CATEGORY_META = [
  { key: "deliverables", label: "Deliverables" },
  { key: "reports", label: "Reports" },
  { key: "minutes", label: "Minutes" },
  { key: "financial", label: "Financial Reports" },
  { key: "presentations", label: "Presentations" },
  { key: "policy_briefs", label: "Policy Briefs" },
  { key: "publications", label: "Publications" },
  { key: "templates", label: "Templates" },
] as const;

/** @deprecated Prefer SHAPE_DOCUMENT_CATEGORY_META — kept as display labels for the 8 menus. */
export const SHAPE_DOCUMENT_CATEGORIES = SHAPE_DOCUMENT_CATEGORY_META.map((c) => c.label);

const DOC_CATEGORY_BY_KEY = new Map(
  SHAPE_DOCUMENT_CATEGORY_META.map((c) => [c.key, c.label] as const),
);
const DOC_CATEGORY_BY_LABEL = new Map(
  SHAPE_DOCUMENT_CATEGORY_META.map((c) => [c.label.toLowerCase(), c.key] as const),
);

export function documentCategoryKey(raw?: string | null): string {
  if (!raw) return "other";
  const lowered = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (DOC_CATEGORY_BY_KEY.has(lowered as any)) return lowered;
  // Accept display labels from older data / UI
  const fromLabel = DOC_CATEGORY_BY_LABEL.get(raw.trim().toLowerCase());
  if (fromLabel) return fromLabel;
  if (lowered === "financial_reports") return "financial";
  return lowered;
}

export function documentCategoryLabel(raw?: string | null): string {
  const key = documentCategoryKey(raw);
  return DOC_CATEGORY_BY_KEY.get(key as any) || raw || "Other";
}

export function normalizeShapeDocument(raw: any): ShapeDocument {
  const category = documentCategoryKey(raw?.category);
  const wp =
    typeof raw?.work_package === "string"
      ? raw.work_package
      : raw?.work_package?.code || raw?.work_package?.title || undefined;
  return {
    id: String(raw?.id || raw?.slug || ""),
    title: raw?.title || "Untitled document",
    category,
    category_label: documentCategoryLabel(category),
    description: raw?.description || undefined,
    file_url: raw?.file_url || undefined,
    work_package: wp,
    published_at: raw?.published_at || undefined,
  };
}

/* ── Public getters ── */

export function normalizeShapePartner(raw: any): ShapePartner {
  const lat = Number(raw?.lat ?? raw?.latitude);
  const lng = Number(raw?.lng ?? raw?.longitude);
  return {
    id: String(raw?.id || raw?.slug || ""),
    slug: raw?.slug || "",
    name: raw?.name || "Partner",
    short_name: raw?.short_name || undefined,
    country: raw?.country || "",
    city: raw?.city || undefined,
    role: raw?.consortium_role || raw?.role || undefined,
    consortium_role: raw?.consortium_role || undefined,
    logo_url: raw?.logo_url || undefined,
    website: raw?.website_url || raw?.website || undefined,
    website_url: raw?.website_url || undefined,
    contact_name: raw?.contact_person || raw?.contact_name || undefined,
    contact_person: raw?.contact_person || undefined,
    contact_email: raw?.contact_email || undefined,
    responsibilities: raw?.responsibilities || undefined,
    deliverables: raw?.deliverables || undefined,
    description: raw?.description || undefined,
    region: raw?.region || undefined,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    latitude: Number.isFinite(lat) ? lat : undefined,
    longitude: Number.isFinite(lng) ? lng : undefined,
    order: Number(raw?.sort_order ?? raw?.order ?? 0) || undefined,
  };
}

export async function getShapePartners(): Promise<ShapePartner[]> {
  const raw = await cachedList<any>("/shape/partners", SHAPE_PARTNERS_FALLBACK);
  return raw.map(normalizeShapePartner);
}

export async function getShapePartner(slug: string): Promise<ShapePartner | null> {
  const fallback = SHAPE_PARTNERS_FALLBACK.find((p) => p.slug === slug) || null;
  const data = await cachedOne<any>(`/shape/partners/${encodeURIComponent(slug)}`, fallback);
  return data ? normalizeShapePartner(data) : null;
}

export async function getShapeWorkPackages(): Promise<ShapeWorkPackage[]> {
  const [raw, partners] = await Promise.all([
    cachedList<any>("/shape/work-packages", SHAPE_WORK_PACKAGES_FALLBACK),
    getShapePartners().catch(() => [] as ShapePartner[]),
  ]);
  return normalizeWorkPackages(raw, partners);
}

export async function getShapeWorkPackage(slug: string): Promise<ShapeWorkPackage | null> {
  const fallback = SHAPE_WORK_PACKAGES_FALLBACK.find((w) => w.slug === slug) || null;
  const [data, partners] = await Promise.all([
    cachedOne<any>(`/shape/work-packages/${encodeURIComponent(slug)}`, fallback),
    getShapePartners().catch(() => [] as ShapePartner[]),
  ]);
  if (!data) return null;
  return normalizeWorkPackage(data, new Map(partners.map((p) => [p.id, p])));
}

export async function getShapeEvents(): Promise<ShapeEvent[]> {
  return cachedList("/shape/events", SHAPE_EVENTS_FALLBACK);
}

export async function getShapeEvent(slug: string): Promise<ShapeEvent | null> {
  const fallback = SHAPE_EVENTS_FALLBACK.find((e) => e.slug === slug) || null;
  return cachedOne(`/shape/events/${encodeURIComponent(slug)}`, fallback);
}

export async function getShapeDocuments(params?: {
  category?: string;
  search?: string;
}): Promise<ShapeDocument[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", documentCategoryKey(params.category));
  if (params?.search) qs.set("q", params.search);
  const suffix = qs.toString() ? `?${qs}` : "";
  let raw: any[] = [];
  try {
    // Prefer fresh CMS data so newly published placeholders appear immediately
    const data = await getApi(`/shape/documents${suffix}`);
    raw = asList<any>(data);
  } catch {
    raw = [];
  }
  if (!raw.length) {
    raw = SHAPE_DOCUMENTS_FALLBACK as any[];
  }
  let docs = raw.map(normalizeShapeDocument);
  if (params?.category) {
    const key = documentCategoryKey(params.category);
    docs = docs.filter((d) => d.category === key);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    docs = docs.filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.category_label?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q),
    );
  }
  return docs;
}

export async function getShapeActivities(): Promise<ShapeActivity[]> {
  try {
    const data = await getApiCached("/shape/activities", { revalidate: 120 });
    const list = asList<any>(data);
    if (!list.length) return SHAPE_ACTIVITIES_FALLBACK;
    return list.map((a) => ({
      id: String(a.id),
      title: a.title,
      start: a.start || a.start_date || "",
      end: a.end || a.end_date || "",
      status: a.status || "planned",
      work_package:
        typeof a.work_package === "string"
          ? a.work_package
          : a.work_package?.code || a.work_package_code || undefined,
    }));
  } catch {
    return SHAPE_ACTIVITIES_FALLBACK;
  }
}

export async function getShapeKpis(): Promise<ShapeKpi[]> {
  return cachedList("/shape/kpis", SHAPE_KPIS_FALLBACK);
}

export async function getShapeRisks(): Promise<ShapeRisk[]> {
  return cachedList("/shape/risks", SHAPE_RISKS_FALLBACK);
}

export async function getShapeSdlc(): Promise<ShapeSdlcStage[]> {
  let raw: any[] = [];
  try {
    const data = await getApi("/shape/sdlc");
    raw = asList<any>(data);
  } catch {
    raw = [];
  }
  if (!raw.length) raw = SHAPE_SDLC_FALLBACK as any[];

  const stages = raw.map((s: any, i: number): ShapeSdlcStage => {
    const fallback = SHAPE_SDLC_FALLBACK.find(
      (f) => f.title.toLowerCase() === String(s.title || "").toLowerCase(),
    );
    const description = s.description || fallback?.description || undefined;
    const objectives =
      s.objectives || fallback?.objectives || description || undefined;
    return {
      id: String(s.id || s.slug || i),
      title: s.title || fallback?.title || `Stage ${i + 1}`,
      order: Number(s.order ?? s.sort_order ?? fallback?.order ?? i + 1),
      description,
      objectives,
      progress: Number(s.progress ?? s.progress_percent ?? fallback?.progress ?? 0),
      outputs: s.outputs || fallback?.outputs || undefined,
      evidence: s.evidence || fallback?.evidence || undefined,
      status: s.status || fallback?.status || "planned",
    };
  });
  return [...stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getShapeDashboard(): Promise<ShapeDashboard> {
  try {
    const data = await getApiCached("/shape/dashboard", { revalidate: 120 });
    if (data && typeof data === "object") {
      const raw = data as Record<string, any>;
      const kpis: any[] = Array.isArray(raw.kpis) ? raw.kpis : [];
      const kpi = (key: string) =>
        kpis.find((k) => k.key === key)?.value ?? undefined;
      const deliverablesRaw = String(kpi("deliverables") ?? "");
      const deliverablesDone =
        Number(kpi("deliverables")) ||
        Number(deliverablesRaw.split(/\D+/)[0]) ||
        SHAPE_DASHBOARD_FALLBACK.deliverables_done;

      return {
        ...SHAPE_DASHBOARD_FALLBACK,
        overall_completion: Number(kpi("overall_completion")) || SHAPE_DASHBOARD_FALLBACK.overall_completion,
        budget_utilization: Number(kpi("budget_utilization")) || SHAPE_DASHBOARD_FALLBACK.budget_utilization,
        deliverables_done: deliverablesDone,
        deliverables_total: Number(kpis.find((k) => k.key === "deliverables")?.target) || 32,
        meetings: Number(kpi("meetings")) || SHAPE_DASHBOARD_FALLBACK.meetings,
        countries: Number(raw.countries_count) || SHAPE_DASHBOARD_FALLBACK.countries,
        universities: Number(raw.partners_count) || SHAPE_DASHBOARD_FALLBACK.universities,
        work_packages: Number(raw.work_packages_count) || SHAPE_DASHBOARD_FALLBACK.work_packages,
        students_reached: Number(kpi("students_reached")) || SHAPE_DASHBOARD_FALLBACK.students_reached,
        training_sessions: Number(kpi("training_sessions")) || SHAPE_DASHBOARD_FALLBACK.training_sessions,
        research_outputs: Number(kpi("research_outputs")) || SHAPE_DASHBOARD_FALLBACK.research_outputs,
        events_held: Number(raw.events_count) || SHAPE_DASHBOARD_FALLBACK.events_held,
        project_years: 3,
      };
    }
  } catch {
    /* fallback */
  }
  return SHAPE_DASHBOARD_FALLBACK;
}

export async function postShapeContact(payload: {
  name: string;
  email: string;
  organisation?: string;
  organization?: string;
  subject?: string;
  message: string;
}) {
  return postApi("/shape/contact", {
    name: payload.name,
    email: payload.email,
    organization: payload.organization || payload.organisation || undefined,
    subject: payload.subject,
    message: payload.message,
  });
}

/* ── Admin helpers ── */

export async function getShapeAdminList(resource: string) {
  try {
    const data = await getApi(`/shape/${resource}/admin`);
    return asList(data);
  } catch {
    return [];
  }
}

/** Full SHAPE PMIS primary navigation. */
export const SHAPE_NAV_LINKS = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Partners", href: "/partners" },
  { title: "Work Packages", href: "/work-packages" },
  { title: "Workplan", href: "/workplan" },
  { title: "Events", href: "/events" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "Documents", href: "/documents" },
  { title: "News", href: "/news" },
  { title: "SDLC", href: "/sdlc" },
  { title: "Monitoring", href: "/monitoring" },
  { title: "Map", href: "/map" },
  { title: "Gallery", href: "/gallery" },
  { title: "Contact", href: "/contact" },
] as const;

export type ShapeObjective = { title: string; text: string };

/** Sensible SHAPE homepage defaults when CMS settings keys are missing. */
export const SHAPE_HOME_DEFAULTS = {
  shape_hero_eyebrow: "East Africa • Higher Education • Smart Cities",
  shape_hero_title: "SHAPE",
  shape_hero_text:
    "Co-funded by the Erasmus+ programme of the European Union, SHAPE strengthens higher education for smart cities across East Africa and Europe — building curricula, digital learning, and institutional capacity with nine partner universities.",
  shape_intro:
    "SHAPE — Strengthening Higher Education for Smart Cities — brings together African and European universities to modernise teaching, research, and digital pedagogy for smarter, more inclusive urban futures. Coordinated by the Open University of Kenya, the consortium aligns programmes with real city challenges across Kenya, Uganda, Somalia, Germany, Estonia, and Lithuania.",
  shape_acronym:
    "SHAPE (Strengthening Higher Education for Smart Cities Across Partner Economies)",
  shape_erasmus_call:
    "ERASMUS-EDU-2024-CBHE (Capacity Building in Higher Education — multi-country partnership)",
  shape_objectives: [
    {
      title: "Strengthening Institutional Capacity",
      text: "Build robust cooperation frameworks and staff skills so partner universities can design and deliver smart-city higher education at scale.",
    },
    {
      title: "Co-designing Smart-City Curricula",
      text: "Co-create modular programmes, micro-credentials, and open resources that connect digital learning with municipal and industry practice.",
    },
    {
      title: "Fostering Collaborative Culture",
      text: "Foster innovation, intercultural exchange, and lasting partnerships that sustain impact beyond the three-year grant period.",
    },
  ] as ShapeObjective[],
  shape_overview:
    "Cities across East Africa are growing quickly. Universities must prepare graduates who can design, govern, and operate smarter urban systems — from digital public services to climate resilience and inclusive mobility. SHAPE addresses this gap through a participative capacity-building approach: empowering educators, enhancing institutional strategies, and fostering academic partnerships aligned with national development visions and Erasmus+ CBHE priorities.",
  shape_overview_image: "",
  site_name: "SHAPE | Strengthening Higher Education for Smart Cities",
  contact_email: "shape@ouk.ac.ke",
} as const;

export const NEWS_HUB_DEFAULTS = {
  news_hub_eyebrow: "Institutional intelligence",
  news_hub_title: "Institutional",
  news_hub_title_accent: "News Hub",
  news_hub_subtitle:
    "Project launches, partner milestones, and consortium updates from across SHAPE.",
  news_hub_search_hint:
    'Showing matches for "{query}" — related wording highlighted below.',
  news_hub_ticker_label: "Latest",
  news_hub_image_tablet: "/uploads/shape/news/news-3d-tablet.png",
  news_hub_image_orb: "/uploads/shape/news/news-3d-search-orb.png",
  news_hub_image_cards: "/uploads/shape/news/news-3d-cards.png",
} as const;

export function resolveNewsHubSettings(settings: Record<string, any> = {}) {
  return {
    eyebrow: settings.news_hub_eyebrow || NEWS_HUB_DEFAULTS.news_hub_eyebrow,
    title: settings.news_hub_title || NEWS_HUB_DEFAULTS.news_hub_title,
    titleAccent: settings.news_hub_title_accent || NEWS_HUB_DEFAULTS.news_hub_title_accent,
    subtitle: settings.news_hub_subtitle || NEWS_HUB_DEFAULTS.news_hub_subtitle,
    searchHint: settings.news_hub_search_hint || NEWS_HUB_DEFAULTS.news_hub_search_hint,
    tickerLabel: settings.news_hub_ticker_label || NEWS_HUB_DEFAULTS.news_hub_ticker_label,
    imageTablet: settings.news_hub_image_tablet || NEWS_HUB_DEFAULTS.news_hub_image_tablet,
    imageOrb: settings.news_hub_image_orb || NEWS_HUB_DEFAULTS.news_hub_image_orb,
    imageCards: settings.news_hub_image_cards || NEWS_HUB_DEFAULTS.news_hub_image_cards,
    relatedTermsJson: settings.search_related_terms_json || "",
  };
}

export function parseShapeObjectives(raw: unknown): ShapeObjective[] {
  if (Array.isArray(raw) && raw.length) {
    return raw
      .map((o: any) => ({
        title: String(o?.title || "").trim(),
        text: String(o?.text || o?.description || "").trim(),
      }))
      .filter((o) => o.title && o.text)
      .slice(0, 3);
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      return parseShapeObjectives(JSON.parse(raw));
    } catch {
      /* fall through */
    }
  }
  return [...SHAPE_HOME_DEFAULTS.shape_objectives];
}

export function resolveShapeHomeSettings(settings: Record<string, any> = {}) {
  const objectives = parseShapeObjectives(
    settings.shape_objectives_json ?? settings.shape_objectives,
  );
  return {
    heroEyebrow: settings.shape_hero_eyebrow || SHAPE_HOME_DEFAULTS.shape_hero_eyebrow,
    heroTitle: settings.shape_hero_title || SHAPE_HOME_DEFAULTS.shape_hero_title,
    heroText: settings.shape_hero_text || SHAPE_HOME_DEFAULTS.shape_hero_text,
    intro: settings.shape_intro || SHAPE_HOME_DEFAULTS.shape_intro,
    acronym: settings.shape_acronym || SHAPE_HOME_DEFAULTS.shape_acronym,
    erasmusCall: settings.shape_erasmus_call || SHAPE_HOME_DEFAULTS.shape_erasmus_call,
    objectives:
      objectives.length === 3 ? objectives : [...SHAPE_HOME_DEFAULTS.shape_objectives],
    overview: settings.shape_overview || SHAPE_HOME_DEFAULTS.shape_overview,
    overviewImage: settings.shape_overview_image || SHAPE_HOME_DEFAULTS.shape_overview_image,
    siteName: settings.site_name || SHAPE_HOME_DEFAULTS.site_name,
    contactEmail: settings.contact_email || SHAPE_HOME_DEFAULTS.contact_email,
  };
}

/** CMS menu seed (optional): mirror SHAPE_NAV_LINKS into header/footer menus if needed. */
