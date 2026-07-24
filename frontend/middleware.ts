import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
const intlMiddleware = createMiddleware(routing);

/** Edge-isolate cache so bursts of crawlers share one status fetch. */
const MAINTENANCE_TTL_MS = 15_000;
const MAINTENANCE_FETCH_TIMEOUT_MS = 800;
let maintenanceCache: { data: any; expiresAt: number } | null = null;

function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (maybeLocale && routing.locales.includes(maybeLocale as "en" | "sw")) {
    const rest = segments.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

/** Attach locale-stripped path for RSC metadata (hreflang / canonical). */
function withSeoRequestHeaders(request: NextRequest): NextRequest {
  const pathname = request.nextUrl.pathname;
  const path = stripLocalePrefix(pathname) || "/";
  const first = pathname.split("/")[1];
  const locale =
    first && routing.locales.includes(first as "en" | "sw") ? first : "en";

  const headers = new Headers(request.headers);
  headers.set("x-ouk-pathname", path);
  headers.set("x-ouk-locale", locale);
  return new NextRequest(request, { headers });
}

function runIntl(request: NextRequest) {
  return intlMiddleware(withSeoRequestHeaders(request));
}

async function fetchMaintenanceStatus(): Promise<any | null> {
  const now = Date.now();
  if (maintenanceCache && maintenanceCache.expiresAt > now) {
    return maintenanceCache.data;
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    MAINTENANCE_FETCH_TIMEOUT_MS,
  );

  try {
    const statusRes = await fetch(`${API_URL}/maintenance/status`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!statusRes.ok) return null;

    const status = await statusRes.json();
    maintenanceCache = {
      data: status,
      expiresAt: now + MAINTENANCE_TTL_MS,
    };
    return status;
  } catch {
    // Fail open — never block the public site if maintenance API is slow/down
    return maintenanceCache?.data ?? null;
  } finally {
    clearTimeout(timer);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hotlink protection for images
  if (
    pathname.startsWith("/_next/image") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
  ) {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const host = request.headers.get("host") || "localhost:3000";
        if (!refererUrl.host.includes(host.split(":")[0])) {
          return new NextResponse("Hotlinking Not Allowed", { status: 403 });
        }
      } catch {
        // Invalid referer
      }
    }
    return NextResponse.next();
  }

  // Never locale-prefix or rewrite these surfaces
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  // Fence leftover OUK public routes → SHAPE project hub
  const pathNoLocale = stripLocalePrefix(pathname);
  const legacyRoots = new Set([
    "academics",
    "academic-affairs",
    "admissions",
    "alumni",
    "careers",
    "library",
    "programmes",
    "research",
    "students",
    "tenders",
    "units",
    "virtual-tour",
    "partnerships",
    "service-charter",
    "about",
    "about-us",
    "faqs",
    "social",
    "support",
    "outputs",
  ]);
  const top = pathNoLocale.split("/").filter(Boolean)[0];
  if (top && legacyRoots.has(top)) {
    const url = request.nextUrl.clone();
    const first = pathname.split("/")[1];
    const hasLocale =
      first && routing.locales.includes(first as "en" | "sw");
    url.pathname = hasLocale ? `/${first}/the-project` : "/the-project";
    return NextResponse.redirect(url, 308);
  }

  // Standalone maintenance page (app/maintenance) — not under [locale]
  if (pathname === "/maintenance" || pathname.startsWith("/maintenance/")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // Admins bypass public maintenance gates
  const adminToken = request.cookies.get("ouk_admin_token");
  if (adminToken?.value) {
    return runIntl(request);
  }

  // No maintenance API round-trip for non-GET document navigations
  if (request.method !== "GET") {
    return runIntl(request);
  }

  const pathForMaintenance = stripLocalePrefix(pathname);

  try {
    const status = await fetchMaintenanceStatus();

    if (status) {
      if (status.mode === "FULL") {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.rewrite(url);
      }

      if (status.mode === "PARTIAL") {
        const topLevelRoute = pathForMaintenance.split("/")[1];
        let requestedModule = topLevelRoute;

        if (
          pathForMaintenance.includes("/professional-development") ||
          pathForMaintenance.includes("/short-courses")
        ) {
          requestedModule = "short-courses";
        } else if (pathForMaintenance.includes("/staff")) {
          requestedModule = "staff";
        } else if (pathForMaintenance === "/" || pathForMaintenance === "") {
          return runIntl(request);
        }

        if (
          requestedModule &&
          Array.isArray(status.allowed_modules) &&
          !status.allowed_modules.includes(requestedModule)
        ) {
          const url = request.nextUrl.clone();
          url.pathname = "/maintenance";
          url.searchParams.set("module", requestedModule);
          return NextResponse.rewrite(url);
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch maintenance status in middleware", err);
  }

  return runIntl(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|admin|portal|uploads|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image|icon.png|apple-icon).*)",
  ],
};
