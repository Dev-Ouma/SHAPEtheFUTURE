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
  logo_url?: string;
  website?: string;
  contact_name?: string;
  contact_email?: string;
  responsibilities?: string;
  deliverables?: string;
  description?: string;
  lat?: number;
  lng?: number;
  order?: number;
};

export type ShapeWorkPackage = {
  id: string;
  slug: string;
  code: string;
  title: string;
  summary?: string;
  objectives?: string;
  leader?: string;
  leader_partner_slug?: string;
  partners?: string[];
  timeline_start?: string;
  timeline_end?: string;
  milestones?: { title: string; due?: string; status?: string }[];
  deliverables?: { title: string; status?: string }[];
  documents?: { title: string; url: string }[];
  progress?: number;
  order?: number;
};

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
  category: string;
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
  { id: "1", title: "SHAPE Project Brief", category: "Reports", description: "Public overview of objectives and partners.", published_at: "2026-06-01" },
  { id: "2", title: "Kick-off Agenda", category: "Minutes", description: "Agenda for the June 2026 kick-off.", work_package: "WP1", published_at: "2026-06-10" },
  { id: "3", title: "Dissemination Template", category: "Templates", description: "Partner communication template.", published_at: "2026-06-15" },
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
  { id: "1", title: "Planning", order: 1, progress: 80, status: "completed", objectives: "Define scope, roles, and governance." },
  { id: "2", title: "Needs Assessment", order: 2, progress: 55, status: "in_progress", objectives: "Map skills gaps for smart-city HE." },
  { id: "3", title: "Stakeholder Engagement", order: 3, progress: 40, status: "in_progress", objectives: "Align cities, ministries, and industry." },
  { id: "4", title: "Curriculum Design", order: 4, progress: 20, status: "planned", objectives: "Co-create modular smart-city programmes." },
  { id: "5", title: "Platform Development", order: 5, progress: 15, status: "planned", objectives: "Build shared digital learning services." },
  { id: "6", title: "Testing", order: 6, progress: 5, status: "planned", objectives: "Validate content and platform UX." },
  { id: "7", title: "Pilot Implementation", order: 7, progress: 0, status: "planned", objectives: "Run first learner cohorts." },
  { id: "8", title: "Monitoring", order: 8, progress: 25, status: "in_progress", objectives: "Track KPIs and risks." },
  { id: "9", title: "Evaluation", order: 9, progress: 0, status: "planned", objectives: "Assess impact and quality." },
  { id: "10", title: "Sustainability", order: 10, progress: 10, status: "planned", objectives: "Institutionalise results beyond the grant." },
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

export const SHAPE_DOCUMENT_CATEGORIES = [
  "Deliverables",
  "Reports",
  "Minutes",
  "Financial Reports",
  "Presentations",
  "Policy Briefs",
  "Publications",
  "Templates",
] as const;

/* ── Public getters ── */

export async function getShapePartners(): Promise<ShapePartner[]> {
  return cachedList("/shape/partners", SHAPE_PARTNERS_FALLBACK);
}

export async function getShapePartner(slug: string): Promise<ShapePartner | null> {
  const fallback = SHAPE_PARTNERS_FALLBACK.find((p) => p.slug === slug) || null;
  return cachedOne(`/shape/partners/${encodeURIComponent(slug)}`, fallback);
}

export async function getShapeWorkPackages(): Promise<ShapeWorkPackage[]> {
  return cachedList("/shape/work-packages", SHAPE_WORK_PACKAGES_FALLBACK);
}

export async function getShapeWorkPackage(slug: string): Promise<ShapeWorkPackage | null> {
  const fallback = SHAPE_WORK_PACKAGES_FALLBACK.find((w) => w.slug === slug) || null;
  const data = await cachedOne<ShapeWorkPackage>(
    `/shape/work-packages/${encodeURIComponent(slug)}`,
    fallback,
  );
  if (data && !data.milestones && fallback) {
    return {
      ...fallback,
      ...data,
      milestones: data.milestones || [
        { title: "Kick-off aligned", due: "2026-06", status: "done" },
        { title: "Mid-term review", due: "2027-06", status: "planned" },
      ],
      deliverables: data.deliverables || [
        { title: `${data.code || fallback.code} inception report`, status: "in_progress" },
      ],
      objectives:
        data.objectives ||
        `Deliver the ${data.title || fallback.title} outcomes for the SHAPE consortium.`,
    };
  }
  return data;
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
  if (params?.category) qs.set("category", params.category);
  if (params?.search) qs.set("q", params.search);
  const suffix = qs.toString() ? `?${qs}` : "";
  let docs = await cachedList(`/shape/documents${suffix}`, SHAPE_DOCUMENTS_FALLBACK);
  if (params?.category) {
    docs = docs.filter((d) => d.category?.toLowerCase() === params.category!.toLowerCase());
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    docs = docs.filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
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
  const stages = await cachedList("/shape/sdlc", SHAPE_SDLC_FALLBACK);
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
