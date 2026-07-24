const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

/** Browser uses same-origin `/api` (proxied by Next.js); SSR hits backend directly. */
export const API_URL = typeof window !== "undefined" ? "/api" : BACKEND_URL;
export { BACKEND_URL };

/**
 * Next.js opts routes into dynamic rendering by throwing an internal error.
 * API helpers must rethrow it — swallowing it causes DYNAMIC_SERVER_USAGE 500s.
 */
function rethrowIfNextDynamic(error: unknown): void {
  if (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
  ) {
    throw error;
  }
}

/** Clear client session when the HttpOnly cookie or bearer token is invalid. */
let logoutInFlight = false;

/**
 * Extract a user-facing message from Nest/API errors (mirrors Flutter apiErrorMessage).
 */
export function getApiErrorMessage(err: unknown, fallback = "Request failed"): string {
  if (!err) return fallback;
  const e = err as {
    message?: string;
    status?: number;
    response?: { data?: { message?: string | string[]; error?: string } };
  };

  const bodyMsg = e?.response?.data?.message;
  if (Array.isArray(bodyMsg) && bodyMsg.length) return bodyMsg.join(", ");
  if (typeof bodyMsg === "string" && bodyMsg.trim()) return bodyMsg.trim();

  const nestError = e?.response?.data?.error;
  if (typeof nestError === "string" && nestError.trim() && nestError !== "Error") {
    // Prefer message when present; otherwise fall through
  }

  if (err instanceof Error && err.message) {
    // Prefer real Nest messages over generic "METHOD failed: Bad Request"
    if (!/^(GET|POST|PUT|PATCH|DELETE|get\w+|uploadFile) failed:/i.test(err.message)) {
      return err.message;
    }
    // Strip "POST failed: " prefix if that's all we have and no body message
    const stripped = err.message.replace(/^[A-Za-z]+ failed:\s*/i, "").trim();
    if (stripped && stripped !== "Bad Request" && stripped !== "Unauthorized") {
      return stripped;
    }
    if (stripped === "Unauthorized") return "Your session has expired. Please sign in again.";
  }

  if (typeof nestError === "string" && nestError.trim()) return nestError.trim();
  return fallback;
}

export function clearAdminSession(options?: { redirect?: boolean }) {
  if (typeof window === "undefined") return;
  // Parallel 401s from Promise.all must not stack redirects / wipe races.
  if (logoutInFlight) return;
  logoutInFlight = true;

  // Clear HttpOnly cookie on the server (best-effort; logout is public).
  void fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});

  localStorage.removeItem("ouk_admin_token");
  localStorage.removeItem("ouk_admin_user");
  if (options?.redirect === false) {
    logoutInFlight = false;
    return;
  }
  const path = window.location.pathname;
  if (
    !path.startsWith("/admin/login") &&
    !path.startsWith("/admin/forgot-password") &&
    !path.startsWith("/admin/reset-password")
  ) {
    window.location.href = "/admin/login?session=expired";
  } else {
    logoutInFlight = false;
  }
}

/** Cookie session via credentials:include — no Bearer token in localStorage. */
function authHeaders(extra?: Record<string, string>): Record<string, string> {
  return { ...(extra || {}) };
}

/**
 * Extra headers for admin fetch calls that bypass getApi/postApi.
 * Always pair with credentials: 'include' and same-origin API_URL (`/api` in browser).
 * Auth is the HttpOnly cookie only (XSS cannot read it).
 */
export function getAdminAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  return authHeaders(extra);
}

/**
 * Soft probe: cookie-only /auth/me (no Authorization).
 * Used after login to confirm the HttpOnly cookie rides the Next /api rewrite.
 */
export async function probeAdminCookieSession(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function handleUnauthorized() {
  clearAdminSession();
}

type GetApiOptions = {
  /**
   * When true, a 401 returns null without clearing the session / redirecting.
   * Use for soft probes (e.g. AdminAuthProvider on /admin/login).
   */
  optionalAuth?: boolean;
};

type GetApiCachedOptions = GetApiOptions & {
  /** Next.js Data Cache TTL (seconds). Only applied during SSR/RSC. Default 60. */
  revalidate?: number;
};

async function parseGetApiResponse(path: string, res: Response, options?: GetApiOptions) {
  if (res.status === 401) {
    if (!options?.optionalAuth) {
      handleUnauthorized();
    }
    return null;
  }

  if (!res.ok && res.status !== 503) {
    console.warn(`getApi: Fetch for ${path} returned status ${res.status}. Returning null.`);
    return null;
  }

  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn(`getApi: Response for ${path} was not valid JSON:`, text.substring(0, 100));
    return text;
  }
}

// Generic Helpers — always fresh (admin / authenticated / volatile)
export async function getApi(path: string, options?: GetApiOptions) {
  const headers = authHeaders();

  try {
    const res = await fetch(`${API_URL}${path}`, { cache: 'no-store', headers, credentials: 'include' });
    return parseGetApiResponse(path, res, options);
  } catch (error) {
    rethrowIfNextDynamic(error);
    // If we are on the server side (e.g. build time) and fetch fails, return a safe fallback
    if (typeof window === 'undefined') {
      console.warn(`getApi build-time resilience [${path}]: Fetch failed. Returning safe placeholder.`);
      return null;
    }
    console.error(`Error in getApi(${path}):`, error);
    throw error;
  }
}

/**
 * Public/read-mostly GET helper.
 * - SSR/RSC: uses Next Data Cache (`revalidate`)
 * - Browser: default HTTP cache + credentials (backend Redis still helps)
 * Keep using getApi() for admin, auth, and anything that must never be stale.
 */
export async function getApiCached(path: string, options?: GetApiCachedOptions) {
  const headers = authHeaders();
  const revalidate = options?.revalidate ?? 60;
  const init: RequestInit & { next?: { revalidate: number } } =
    typeof window === "undefined"
      ? { headers, next: { revalidate } }
      : { headers, credentials: "include", cache: "default" };

  try {
    const res = await fetch(`${API_URL}${path}`, init);
    return parseGetApiResponse(path, res, options);
  } catch (error) {
    rethrowIfNextDynamic(error);
    if (typeof window === "undefined") {
      console.warn(`getApiCached build-time resilience [${path}]: Fetch failed. Returning safe placeholder.`);
      return null;
    }
    console.error(`Error in getApiCached(${path}):`, error);
    throw error;
  }
}

/**
 * Like getApi, but throws on non-OK responses so admin UIs can toast the Nest message.
 * Still returns null on 401 after clearing session (caller should treat as logged out).
 */
export async function getApiOrThrow(path: string) {
  const headers = authHeaders();

  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store', headers, credentials: 'include' });
  return handleResponse(res, "GET");
}

async function handleResponse(res: Response, method: string) {
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Your session has expired. Please sign in again.");
  }

  const text = await res.text();
  
  if (!res.ok) {
    let errorData: { message?: string | string[]; error?: string; raw?: string } = {};
    try {
      errorData = text ? JSON.parse(text) : {};
    } catch (e) {
      errorData = { raw: text };
    }
    const backendMessage = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : typeof errorData.message === "string"
        ? errorData.message
        : "";
    const error = new Error(
      backendMessage ||
        (errorData.error && errorData.error !== "Error" ? errorData.error : "") ||
        `${method} failed: ${res.statusText || res.status}`,
    );
    (error as any).response = { data: errorData };
    (error as any).status = res.status;
    throw error;
  }
  
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export async function postApi(path: string, data: any) {
  const headers = authHeaders({ "Content-Type": "application/json" });
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: JSON.stringify(data), credentials: 'include' });
  return handleResponse(res, "POST");
}

export async function putApi(path: string, data: any) {
  const headers = authHeaders({ "Content-Type": "application/json" });
  const res = await fetch(`${API_URL}${path}`, { method: 'PUT', headers, body: JSON.stringify(data), credentials: 'include' });
  return handleResponse(res, "PUT");
}

export async function patchApi(path: string, data: any) {
  const headers = authHeaders({ "Content-Type": "application/json" });
  const res = await fetch(`${API_URL}${path}`, { method: 'PATCH', headers, body: JSON.stringify(data), credentials: 'include' });
  return handleResponse(res, "PATCH");
}

export async function deleteApi(path: string) {
  const headers = authHeaders();
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE', headers, credentials: 'include' });
  return handleResponse(res, "DELETE");
}

// Specific Helpers
export async function getMenus(position?: string, locale?: string) {
  try {
    const params = new URLSearchParams();
    if (position) params.set("position", position);
    if (locale) params.set("locale", locale);
    const qs = params.toString();
    const url = qs ? `${API_URL}/menus?${qs}` : `${API_URL}/menus`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    return await handleResponse(res, "getMenus");
  } catch (error) {
    rethrowIfNextDynamic(error);
    console.error("Error fetching menus:", error);
    return [];
  }
}

export async function getSettings(locale?: string) {
  try {
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const res = await fetch(`${API_URL}/settings/public${qs}`, { next: { revalidate: 300 } });
    return await handleResponse(res, "getSettings");
  } catch (error) {
    rethrowIfNextDynamic(error);
    console.error("Error fetching settings:", error);
    return {};
  }
}

export async function getPrograms(filters: any = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const url = `${API_URL}/programmes?${query}`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    return await handleResponse(res, "getPrograms");
  } catch (error) {
    if (typeof window === 'undefined') {
      console.warn("getPrograms build-time resilience: Returning default structure.");
      return { data: [], total: 0, totalPages: 0 };
    }
    console.error("Error fetching programmes:", error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

export async function getAdminPrograms(filters: any = {}) {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
  ) as Record<string, string>;
  const query = new URLSearchParams(cleanFilters).toString();
  return getApi(`/programmes/admin?${query}`);
}

export async function getFeeStructures() {
  try {
    const res = await fetch(`${API_URL}/fee-structures/public`, { next: { revalidate: 3600 } });
    return await handleResponse(res, "getFeeStructures");
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    return [];
  }
}

export async function getAdminFeeStructures() {
  return getApi('/fee-structures/admin');
}

export async function getFeeStructure(id: string) {
  return getApi(`/fee-structures/${id}`);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getProgram(id: string, locale?: string) {
  try {
    const isUuid = UUID_REGEX.test(id);
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const url = isUuid ? `${API_URL}/programmes/${id}${qs}` : `${API_URL}/programmes/slug/${id}${qs}`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    return await handleResponse(res, "getProgram");
  } catch (error) {
    return null;
  }
}

export async function getUnit(code: string) {
  try {
    const isUuid = UUID_REGEX.test(code);
    const encoded = encodeURIComponent(code);
    const url = isUuid ? `${API_URL}/course-units/${code}` : `${API_URL}/course-units/lookup/${encoded}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    return await handleResponse(res, "getUnit");
  } catch (error) {
    return null;
  }
}

export async function getCourseUnits() {
  try {
    const res = await fetch(`${API_URL}/course-units`, { next: { revalidate: 600 } });
    return await handleResponse(res, "getCourseUnits");
  } catch (error) {
    console.error("Error fetching course units:", error);
    return [];
  }
}

export async function getSchools(locale?: string) {
  try {
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const res = await fetch(`${API_URL}/schools${qs}`, { next: { revalidate: 600 } });
    const data = await handleResponse(res, "getSchools");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getDepartments() {
  try {
    const res = await fetch(`${API_URL}/departments?limit=100`, { next: { revalidate: 600 } });
    const data = await handleResponse(res, "getDepartments");
    
    // Handle both direct arrays and paginated objects { data: [] }
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    
    return [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

export async function getSchool(idOrSlug: string) {
  try {
    const isUuid = idOrSlug.length === 36 && idOrSlug.includes('-');
    const url = `${API_URL}/schools/${idOrSlug}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    return await handleResponse(res, "getSchool");
  } catch (error) {
    return null;
  }
}

export async function getNews(params: { page?: number, limit?: number, search?: string, type?: string, category?: string, locale?: string } = {}) {
  const { page = 1, limit = 10, search = '', type = 'All', category = '', locale } = params;
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    type,
    category
  });
  if (locale) query.set('locale', locale);
  try {
    const res = await fetch(`${API_URL}/news?${query.toString()}`, { next: { revalidate: 120 } });
    return await handleResponse(res, "getNews");
  } catch (error) {
    console.error("Error fetching news:", error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

export async function getAdminNews(params: { page?: number, limit?: number, search?: string, type?: string, category?: string, status?: string } = {}) {
  const { page = 1, limit = 10, search = '', type = 'All', category = '', status = '' } = params;
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    type,
    category,
  });
  if (status) query.set('status', status);
  return getApi(`/news/admin?${query.toString()}`);
}

export async function getPage(slug: string, locale?: string) {
  const cleanSlug = slug.replace(/^\//, '');
  if (cleanSlug.startsWith('admin/')) {
    return null;
  }
  try {
    const params = new URLSearchParams({ slug });
    if (locale) params.set('locale', locale);
    const res = await fetch(`${API_URL}/pages/slug?${params.toString()}`, { next: { revalidate: 600 } });
    return await handleResponse(res, "getPage");
  } catch (error) {
    console.error(`getPage Error [${slug}]:`, error);
    return null;
  }
}

export async function getNewsItem(slug: string, locale?: string) {
  try {
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const res = await fetch(`${API_URL}/news/${slug}${qs}`, { next: { revalidate: 300 } });
    return await handleResponse(res, "getNewsItem");
  } catch (error) {
    return null;
  }
}

export async function getHeroSlides(locale?: string) {
  try {
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const res = await fetch(`${API_URL}/hero-slides${qs}`, { next: { revalidate: 300 } });
    const data = await handleResponse(res, "getHeroSlides");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return [];
  }
}

export async function getIntroVideos(params: any = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/intro-videos?${query}`, { next: { revalidate: 300 } });
    const data = await handleResponse(res, "getIntroVideos");
    return data; // Return full response for pagination
  } catch (error) {
    console.error("Error fetching intro videos:", error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

export async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/pages/categories`, { next: { revalidate: 600 } });
    const data = await handleResponse(res, "getCategories");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Short Courses API
export async function getShortCourses(filters: any = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/short-courses?${query}`, { next: { revalidate: 300 } });
    return await handleResponse(res, "getShortCourses");
  } catch (error) {
    console.error("Error fetching short courses:", error);
    return { data: [], total: 0, totalPages: 0 };
  }
}

export async function getShortCourse(slug: string, locale?: string) {
  try {
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const res = await fetch(`${API_URL}/short-courses/slug/${slug}${qs}`, { next: { revalidate: 300 } });
    return await handleResponse(res, "getShortCourse");
  } catch (error) {
    console.error("Error fetching short course:", error);
    return null;
  }
}

export async function getShortCourseCategories() {
  try {
    const res = await fetch(`${API_URL}/short-courses/taxonomies/categories`, { next: { revalidate: 600 } });
    const data = await handleResponse(res, "getShortCourseCategories");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getShortCourseMethods() {
  try {
    const res = await fetch(`${API_URL}/short-courses/taxonomies/methods`, { next: { revalidate: 600 } });
    const data = await handleResponse(res, "getShortCourseMethods");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getShortCourseDepartments() {
  try {
    const res = await fetch(`${API_URL}/short-courses/taxonomies/departments`, { next: { revalidate: 600 } });
    const data = await handleResponse(res, "getShortCourseDepartments");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getRelatedShortCourses(id: string) {
  try {
    const res = await fetch(`${API_URL}/short-courses/${id}/related`, { next: { revalidate: 300 } });
    const data = await handleResponse(res, "getRelatedShortCourses");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getRelatedProgrammes(id: string) {
  try {
    const res = await fetch(`${API_URL}/short-courses/${id}/related-programmes`, { next: { revalidate: 300 } });
    const data = await handleResponse(res, "getRelatedProgrammes");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getPeerLearners(filters: any = {}) {
  try {
    const cleanFilters: any = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        cleanFilters[key] = filters[key];
      }
    });

    const query = new URLSearchParams(cleanFilters).toString();
    const url = `${API_URL}/peer-learners${query ? `?${query}` : ''}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    return await handleResponse(res, "getPeerLearners");
  } catch (error) {
    console.error("Error fetching peer learners:", error);
    return filters.page ? { data: [], total: 0, totalPages: 0 } : [];
  }
}

// Timetables API
export async function getPlannerProgrammes(schoolId: string) {
  try {
    const res = await fetch(`${API_URL}/timetables/programmes?school_id=${schoolId}`, { next: { revalidate: 120 } });
    const data = await handleResponse(res, "getPlannerProgrammes");
    return data || { programmes: [] };
  } catch (error) {
    return { programmes: [] };
  }
}

export async function getPlannerLevels(schoolId: string, programmeId: string) {
  try {
    const res = await fetch(`${API_URL}/timetables/levels?school_id=${schoolId}&programme_id=${programmeId}`, { next: { revalidate: 120 } });
    const data = await handleResponse(res, "getPlannerLevels");
    return data || { data: [] };
  } catch (error) {
    return { data: [] };
  }
}

export async function getExams(filters: any = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/timetables/exams?${query}`, { next: { revalidate: 60 } });
    const data = await handleResponse(res, "getExams");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getClassTimetable(filters: any = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/timetables/class?${query}`, { next: { revalidate: 60 } });
    const data = await handleResponse(res, "getClassTimetable");
    return data || { days: [], timeSlots: [], data: {} };
  } catch (error) {
    return { days: [], timeSlots: [], data: {} };
  }
}

export async function getPlannerSchools() {
  try {
    const res = await fetch(`${API_URL}/timetables/schools`, { next: { revalidate: 600 } });
    const data = await handleResponse(res, "getPlannerSchools");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
    credentials: 'include',
  });
  return await handleResponse(res, "uploadFile");
}

export function resolveImageUrl(path?: string) {
  if (!path || path === "/uploads" || path === "/uploads/") return "";
  if (path.startsWith('http')) return path;
  // Return a stable, same-origin relative path. `/uploads/*` is proxied to the
  // backend by a Next.js rewrite, so this resolves identically during SSR and on
  // the client — avoiding the hydration mismatch that arises from the
  // window-dependent `API_URL` (backend origin on the server, `/api` in the browser).
  if (path.startsWith('/uploads')) return path;
  if (path.startsWith('/images')) return path; // Next.js public folder
  return path;
}

export function extractYoutubeId(url: string) {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}

// --- STAFF DIRECTORY LOGIC ---
export async function getStaffDirectory(executive_type?: string, staff_type?: string, department?: string, limit?: number) {
  let url = `${API_URL}/staff?`;
  if (executive_type) url += `executive_type=${encodeURIComponent(executive_type)}&`;
  if (staff_type) url += `staff_type=${encodeURIComponent(staff_type)}&`;
  if (department) url += `department=${encodeURIComponent(department)}&`;
  if (limit) url += `limit=${limit}`;
  
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await handleResponse(res, "getStaffDirectory");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function getStaffProfile(slug: string) {
  const res = await fetch(`${API_URL}/staff/${slug}`, { next: { revalidate: 60 } });
  try {
    return await handleResponse(res, "getStaffProfile");
  } catch (e) {
    return null;
  }
}

export async function getExecutiveTypes() {
  const res = await fetch(`${API_URL}/staff/executive-types`, { next: { revalidate: 3600 } });
  const data = await handleResponse(res, "getExecutiveTypes");
  return Array.isArray(data) ? data : [];
}

export async function getStaffTypes() {
  const res = await fetch(`${API_URL}/staff/staff-types`, { next: { revalidate: 3600 } });
  const data = await handleResponse(res, "getStaffTypes");
  return Array.isArray(data) ? data : [];
}

// --- CAREERS LOGIC ---
export async function getJobs(params: any = {}) {
  const cleanParams: any = {};
  Object.keys(params || {}).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      cleanParams[key] = params[key];
    }
  });
  const queryParams = new URLSearchParams(cleanParams).toString();
  const url = `${API_URL}/careers?${queryParams}`;
  
  const res = await fetch(url, { next: { revalidate: 60 } });
  try {
    const data = await handleResponse(res, "getJobs");
    // Handle fallback if backend hasn't completely updated shape
    return Array.isArray(data) ? { data, total: data.length, page: 1, limit: 10, lastPage: 1 } : (data || { data: [], total: 0, page: 1, limit: 10, lastPage: 1 });
  } catch (e) {
    return { data: [], total: 0, page: 1, limit: 10, lastPage: 1 };
  }
}

export async function getJobProfile(slug: string, locale?: string) {
  const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
  const res = await fetch(`${API_URL}/careers/slug/${slug}${qs}`, { next: { revalidate: 60 } });
  try {
    return await handleResponse(res, "getJobProfile");
  } catch (e) {
    return null;
  }
}

export async function getJobDivisions() {
  const res = await fetch(`${API_URL}/careers/taxonomies/divisions`, { next: { revalidate: 3600 } });
  return handleResponse(res, "getJobDivisions");
}

export async function getJobCategories() {
  const res = await fetch(`${API_URL}/careers/taxonomies/categories`, { next: { revalidate: 3600 } });
  return handleResponse(res, "getJobCategories");
}

export async function getJobSpecializations() {
  const res = await fetch(`${API_URL}/careers/taxonomies/specializations`, { next: { revalidate: 3600 } });
  return handleResponse(res, "getJobSpecializations");
}

// --- RESEARCH PUBLICATIONS LOGIC ---
export async function getPublications(params: any = {}) {
  // Clean up params
  const cleanParams: any = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });

  const queryParams = new URLSearchParams(cleanParams).toString();
  const url = `${API_URL}/research/publications?${queryParams}`;
  
  const res = await fetch(url, { next: { revalidate: 60 } });
  try {
    const data = await handleResponse(res, "getPublications");
    return data || { data: [], total: 0, page: 1, limit: 10, lastPage: 1 };
  } catch (e) {
    return { data: [], total: 0, page: 1, limit: 10, lastPage: 1 };
  }
}

export async function getPublication(slug: string, locale?: string) {
  const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
  const res = await fetch(`${API_URL}/research/publications/slug/${slug}${qs}`, { next: { revalidate: 60 } });
  try {
    return await handleResponse(res, "getPublication");
  } catch (e) {
    return null;
  }
}

export async function getProjects(params: any = {}) {
  const cleanParams: any = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });

  const queryParams = new URLSearchParams(cleanParams).toString();
  const url = `${API_URL}/research/projects?${queryParams}`;
  
  const res = await fetch(url, { next: { revalidate: 60 } });
  try {
    const data = await handleResponse(res, "getProjects");
    return data || { data: [], total: 0, page: 1, limit: 10, lastPage: 1 };
  } catch (e) {
    return { data: [], total: 0, page: 1, limit: 10, lastPage: 1 };
  }
}

export async function getGrants(params: any = {}) {
  const cleanParams: any = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });

  const queryParams = new URLSearchParams(cleanParams).toString();
  const url = `${API_URL}/research/grants?${queryParams}`;
  
  const res = await fetch(url, { next: { revalidate: 60 } });
  try {
    const data = await handleResponse(res, "getGrants");
    return data || { data: [], total: 0, page: 1, limit: 10, lastPage: 1 };
  } catch (e) {
    return { data: [], total: 0, page: 1, limit: 10, lastPage: 1 };
  }
}

export async function getResearchStats() {
  const res = await fetch(`${API_URL}/research/stats`, { next: { revalidate: 300 } });
  try {
    const data = await handleResponse(res, "getResearchStats");
    return data || { publications: 0, projects: 0, grants: 0, citations: 0, partners: 0 };
  } catch (e) {
    if (typeof window === 'undefined') {
      return { publications: 0, projects: 0, grants: 0, citations: 0, partners: 0 };
    }
    return { publications: 0, projects: 0, grants: 0, citations: 0, partners: 0 };
  }
}

export async function getScholarProfile(slug: string) {
  const res = await fetch(`${API_URL}/research/scholar/${slug}`, { next: { revalidate: 60 } });
  try {
    return await handleResponse(res, "getScholarProfile");
  } catch (e) {
    return null;
  }
}

export async function getResearchProgrammes(params: any = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_URL}/research/programmes?${queryParams}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  try {
    return await handleResponse(res, "getResearchProgrammes");
  } catch (e) {
    return { data: [], total: 0, page: 1, limit: 10, lastPage: 1 };
  }
}

// --- LIBRARY LOGIC ---
export async function getLibraryDatabases(category?: string) {
  let url = `${API_URL}/library/databases?status=Published`;
  if (category && category !== 'all') url += `&category=${category}`;
  
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await handleResponse(res, "getLibraryDatabases");
  return Array.isArray(data) ? data : [];
}

/** Admin catalogue — includes drafts/unpublished. Requires knowledge_hub.view|manage. */
export async function getAdminLibraryDatabases(category?: string) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  const qs = params.toString();
  const data = await getApi(`/library/databases/admin${qs ? `?${qs}` : ''}`);
  return Array.isArray(data) ? data : [];
}

export async function getLibraryWorkshops() {
  const res = await fetch(`${API_URL}/library/training/workshops?status=Published`, { next: { revalidate: 60 } });
  const data = await handleResponse(res, "getLibraryWorkshops");
  return Array.isArray(data) ? data : [];
}

export async function getAdminLibraryWorkshops() {
  const data = await getApi('/library/training/workshops/admin');
  return Array.isArray(data) ? data : [];
}

export async function getLibraryTutorials() {
  const res = await fetch(`${API_URL}/library/training/tutorials?status=Published`, { next: { revalidate: 60 } });
  const data = await handleResponse(res, "getLibraryTutorials");
  return Array.isArray(data) ? data : [];
}

export async function getAdminLibraryTutorials() {
  const data = await getApi('/library/training/tutorials/admin');
  return Array.isArray(data) ? data : [];
}

export async function getResearchProgramme(slugOrId: string) {
  const isUuid = slugOrId.length === 36 && slugOrId.includes('-');
  const url = isUuid ? `${API_URL}/research/programmes/${slugOrId}` : `${API_URL}/research/programmes/slug/${slugOrId}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  try {
    return await handleResponse(res, "getResearchProgramme");
  } catch (e) {
    return null;
  }
}

// --- E-RESOURCES LOGIC ---
export async function getEResources(filters: any = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `${API_URL}/library/e-resources?${queryParams.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await handleResponse(res, "getEResources");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching E-Resources:", error);
    return [];
  }
}

/** Admin catalogue — includes drafts. Requires knowledge_hub.view|manage. */
export async function getAdminEResources(filters: any = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    const qs = queryParams.toString();
    const data = await getApi(`/library/e-resources/admin${qs ? `?${qs}` : ''}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching admin E-Resources:", error);
    return [];
  }
}

export async function getEResource(slug: string) {
  try {
    const res = await fetch(`${API_URL}/library/e-resources/slug/${slug}`, { next: { revalidate: 3600 } });
    return await handleResponse(res, "getEResource");
  } catch (error) {
    console.error(`Error fetching E-Resource [${slug}]:`, error);
    return null;
  }
}

export async function getEResourceProviders() {
  try {
    const res = await fetch(`${API_URL}/library/e-resources/providers`, { next: { revalidate: 3600 } });
    const data = await handleResponse(res, "getEResourceProviders");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function getEResourceSubjects() {
  try {
    const res = await fetch(`${API_URL}/library/e-resources/subjects`, { next: { revalidate: 3600 } });
    const data = await handleResponse(res, "getEResourceSubjects");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function trackEResourceView(id: string) {
  try {
    return await postApi(`/library/e-resources/${id}/view`, {});
  } catch (error) {
    console.warn("Failed to track E-Resource view", error);
  }
}

export async function trackEResourceClick(id: string) {
  try {
    return await postApi(`/library/e-resources/${id}/click`, {});
  } catch (error) {
    console.warn("Failed to track E-Resource click", error);
  }
}

export async function createEResource(data: any) {
  return postApi('/library/e-resources', data);
}

export async function updateEResource(id: string, data: any) {
  return patchApi(`/library/e-resources/${id}`, data);
}

export async function deleteEResource(id: string) {
  return deleteApi(`/library/e-resources/${id}`);
}

export async function createEResourceProvider(data: any) {
  return postApi('/library/e-resources/providers', data);
}

export async function createEResourceSubject(data: any) {
  return postApi('/library/e-resources/subjects', data);
}

export async function getLibraryInfoLiteracy(): Promise<any> {
  return getApi('/library/information-literacy');
}

export async function updateLibraryInfoLiteracy(data: any): Promise<any> {
  return patchApi('/library/information-literacy', data);
}

// --- FAQ & CONTACT LOGIC ---
export async function getFaqs(params?: any) {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'all' && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await fetch(`${API_URL}/faqs${queryString}`, { next: { revalidate: 3600 } });
    const data = await handleResponse(res, "getFaqs");
    return data; // Return full response (data, total, etc.)
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
}

export async function submitContactForm(data: any) {
  return postApi('/contact-submissions', data);
}
export async function triggerIndexing() {
  return postApi('/chats/admin/index', {});
}

// --- ADVERTS LOGIC ---
export async function getAdverts(locale?: string) {
  try {
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const res = await fetch(`${API_URL}/adverts${qs}`, { next: { revalidate: 300 } });
    const data = await handleResponse(res, "getAdverts");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching adverts:", error);
    return [];
  }
}

// --- TESTIMONIALS LOGIC ---
export async function getTestimonials(locale?: string) {
  try {
    const qs = locale ? `?locale=${encodeURIComponent(locale)}` : "";
    const res = await fetch(`${API_URL}/testimonials${qs}`, { next: { revalidate: 3600 } });
    const data = await handleResponse(res, "getTestimonials");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

// --- ADMIN SIDEBAR LOGIC ---
export async function getAdminSidebar() {
  const { getAdminSidebarSections } = await import("./admin-navigation");
  return getAdminSidebarSections();
}

// ─── INSTITUTIONAL ANALYTICS API ──────────────────────────────────────────────

export async function getAnalyticsOverview(days: number = 30) {
  try {
    return await getApi(`/analytics/overview?days=${days}`);
  } catch { return null; }
}

export async function getAnalyticsTrend(granularity: string = 'daily', days: number = 30) {
  try {
    const data = await getApi(`/analytics/trend?granularity=${granularity}&days=${days}`);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function getAnalyticsPages(days: number = 30, limit: number = 50) {
  try {
    const data = await getApi(`/analytics/pages?days=${days}&limit=${limit}`);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function getAnalyticsDevices(days: number = 30) {
  try {
    return await getApi(`/analytics/devices?days=${days}`);
  } catch { return { devices: [], browsers: [], os: [] }; }
}

export async function getAnalyticsGeographic(days: number = 30) {
  try {
    return await getApi(`/analytics/geographic?days=${days}`);
  } catch { return { countries: [], regions: [] }; }
}

export async function getAnalyticsSources(days: number = 30) {
  try {
    return await getApi(`/analytics/sources?days=${days}`);
  } catch { return { sources: [], searchEngines: [], referrals: [] }; }
}

export async function getAnalyticsSearch(days: number = 30) {
  try {
    return await getApi(`/analytics/search?days=${days}`);
  } catch { return { topSearches: [], failedSearches: [], summary: { total: 0, failed: 0, failureRate: 0 } }; }
}

export async function getAnalyticsChat(days: number = 30) {
  try {
    return await getApi(`/analytics/chat?days=${days}`);
  } catch { return { summary: {}, topFailures: [], trend: [] }; }
}

export async function getAnalyticsRealtime() {
  try {
    return await getApi('/analytics/realtime');
  } catch { return { activeUsers: 0, heartbeats: 0, topCurrentPages: [], timestamp: new Date() }; }
}
