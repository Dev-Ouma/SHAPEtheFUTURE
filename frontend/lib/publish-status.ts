/** Canonical CMS publish statuses — keep in sync with backend PublishStatus enum. */
export const PUBLISH_STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;
export type PublishStatusValue = (typeof PUBLISH_STATUSES)[number];

const LEGACY_STATUS_MAP: Record<string, PublishStatusValue> = {
  IN_REVIEW: "REVIEW",
  APPROVED: "PUBLISHED",
  draft: "DRAFT",
  review: "REVIEW",
  published: "PUBLISHED",
  archived: "ARCHIVED",
};

export function normalizePublishStatus(
  status?: string | null,
  fallbackPublished = false,
): PublishStatusValue {
  if (!status) return fallbackPublished ? "PUBLISHED" : "DRAFT";
  const upper = status.toUpperCase();
  if ((PUBLISH_STATUSES as readonly string[]).includes(upper)) {
    return upper as PublishStatusValue;
  }
  return LEGACY_STATUS_MAP[status] || LEGACY_STATUS_MAP[upper] || "DRAFT";
}

export function publishStatusLabel(status?: string | null): string {
  switch (normalizePublishStatus(status)) {
    case "DRAFT":
      return "Draft";
    case "REVIEW":
      return "In review";
    case "PUBLISHED":
      return "Published";
    case "ARCHIVED":
      return "Archived";
    default:
      return "Draft";
  }
}

export function publishStatusClass(status?: string | null): string {
  switch (normalizePublishStatus(status)) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "REVIEW":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "ARCHIVED":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-100";
  }
}

export const PUBLISH_STATUS_OPTIONS: { value: PublishStatusValue; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "REVIEW", label: "In review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];
