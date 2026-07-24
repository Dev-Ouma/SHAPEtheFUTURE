import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-demand ISR revalidation.
 *
 * Call this right after a CMS/admin mutation so public pages refresh
 * immediately instead of waiting for the time-based `revalidate` window.
 *
 *   POST /api/revalidate
 *   header: x-revalidate-secret: <REVALIDATE_SECRET>
 *   body:   { "paths": ["/", "/dashboard"] }   // optional; omit to refresh the default set
 *
 * Each locale-agnostic path is revalidated for both `en` (no prefix) and
 * `sw` (`/sw` prefix). Configure REVALIDATE_SECRET in the environment.
 *
 * Backend integration: after a successful save, the NestJS admin controllers
 * (or the admin UI) should POST here, e.g. mapping the mutated entity to the
 * pages it appears on (partners → ["/", "/partners"], kpis → ["/", "/dashboard"]).
 */
export const runtime = "nodejs";

const SECRET = process.env.REVALIDATE_SECRET;

/** Public pages that surface CMS-managed data. */
const DEFAULT_PATHS = [
  "/",
  "/dashboard",
  "/partners",
  "/work-packages",
  "/events",
  "/documents",
  "/news",
  "/sdlc",
  "/monitoring",
];

export async function POST(req: NextRequest) {
  if (!SECRET) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET not configured" },
      { status: 501 },
    );
  }
  if (req.headers.get("x-revalidate-secret") !== SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { paths?: string[]; path?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty/invalid body → default set */
  }

  const requested =
    body.paths ?? (body.path ? [body.path] : DEFAULT_PATHS);
  const revalidated: string[] = [];

  for (const raw of requested) {
    const clean = raw.startsWith("/") ? raw : `/${raw}`;
    const localeVariants = [clean, clean === "/" ? "/sw" : `/sw${clean}`];
    for (const full of localeVariants) {
      revalidatePath(full);
      revalidated.push(full);
    }
  }

  return NextResponse.json({
    ok: true,
    revalidated,
    at: new Date().toISOString(),
  });
}
