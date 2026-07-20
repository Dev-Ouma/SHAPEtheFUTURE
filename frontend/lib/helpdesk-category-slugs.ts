/**
 * Mirrors backend `HELPDESK_ONLY_SLUGS` in `ict-service-group.ts`.
 * Keep this list identical — FE lane filters depend on it.
 */
export const HELPDESK_ONLY_SLUGS = new Set([
  "student-services",
  "library-physical-resources",
  "health-wellness",
  "finance-payments-desk",
  "general-inquiry",
]);

export type HelpdeskCategoryLike = {
  slug?: string | null;
  is_infrastructure?: boolean | null;
};

export function isHelpdeskCategory(cat?: HelpdeskCategoryLike | null): boolean {
  if (!cat) return false;
  if (cat.is_infrastructure) return true;
  return Boolean(cat.slug && HELPDESK_ONLY_SLUGS.has(cat.slug));
}
