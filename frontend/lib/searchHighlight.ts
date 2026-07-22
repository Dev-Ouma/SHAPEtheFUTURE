/**
 * World-class search term expansion + match helpers.
 * Expands queries into tokens and related phrases (acronyms, aliases)
 * so result UIs can highlight the query and closely related wording.
 *
 * Default map is a fallback; production values load from CMS
 * (`settings.search_related_terms_json`) via SearchHighlightProvider.
 */

export type RelatedTermsMap = Record<string, string[]>;

export const DEFAULT_RELATED_TERMS: RelatedTermsMap = {
  ouk: ["ouk", "open university of kenya", "open university"],
  shape: ["shape", "erasmus+", "erasmus", "smart cities", "smart city", "shapethefuture"],
  moi: ["moi", "moi university"],
  makerere: ["makerere", "makerere university", "mak"],
  mak: ["mak", "makerere", "makerere university"],
  kiu: ["kiu", "kampala international university"],
  mogadishu: ["mogadishu", "mogadishu university", "mog"],
  mog: ["mog", "mogadishu", "mogadishu university"],
  rsu: ["rsu", "red sea university"],
  ovgu: ["ovgu", "otto von guericke", "magdeburg"],
  tartu: ["tartu", "university of tartu"],
  lsmu: ["lsmu", "lithuanian university of health sciences"],
  erasmus: ["erasmus", "erasmus+", "eu-funded", "european union"],
  kenya: ["kenya", "kenyan", "east africa"],
  uganda: ["uganda", "ugandan"],
  somalia: ["somalia", "somali"],
  germany: ["germany", "german"],
  estonia: ["estonia", "estonian"],
  lithuania: ["lithuania", "lithuanian"],
  news: ["news", "announcement", "update", "press"],
  partner: ["partner", "partners", "partnership", "consortium"],
  workpackage: ["work package", "work packages", "wp"],
  wp: ["wp", "work package", "work packages"],
};

export function parseRelatedTerms(raw: unknown): RelatedTermsMap {
  let obj: unknown = raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      obj = JSON.parse(raw);
    } catch {
      return { ...DEFAULT_RELATED_TERMS };
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return { ...DEFAULT_RELATED_TERMS };
  }

  const out: RelatedTermsMap = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const k = String(key).trim().toLowerCase();
    if (!k) continue;
    if (Array.isArray(value)) {
      const aliases = value
        .map((v) => String(v || "").trim().toLowerCase())
        .filter((v) => v.length >= 2);
      if (aliases.length) out[k] = aliases;
    } else if (typeof value === "string" && value.trim()) {
      out[k] = value
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter((v) => v.length >= 2);
    }
  }

  return Object.keys(out).length ? out : { ...DEFAULT_RELATED_TERMS };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Unique search tokens plus related phrases for highlighting. */
export function expandSearchTerms(
  query: string,
  relatedMap: RelatedTermsMap = DEFAULT_RELATED_TERMS,
): string[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [];

  const tokens = raw.split(/[\s,/|;]+/).filter((t) => t.length >= 2);
  const terms = new Set<string>();
  const map = relatedMap && Object.keys(relatedMap).length ? relatedMap : DEFAULT_RELATED_TERMS;

  if (raw.length >= 2) terms.add(raw);

  for (const token of tokens) {
    terms.add(token);
    const related = map[token];
    if (related) related.forEach((r) => terms.add(r));

    for (const [key, aliases] of Object.entries(map)) {
      if (key.includes(token) || token.includes(key)) {
        aliases.forEach((r) => terms.add(r));
      }
    }
  }

  return Array.from(terms).sort((a, b) => b.length - a.length);
}

export function buildHighlightRegex(
  query: string,
  relatedMap: RelatedTermsMap = DEFAULT_RELATED_TERMS,
): RegExp | null {
  const terms = expandSearchTerms(query, relatedMap);
  if (!terms.length) return null;
  const pattern = terms.map(escapeRegExp).join("|");
  return new RegExp(`(${pattern})`, "gi");
}

/** Snippet of `text` centered on the first match for the query. */
export function matchSnippet(
  text: string,
  query: string,
  radius = 110,
  relatedMap: RelatedTermsMap = DEFAULT_RELATED_TERMS,
): string {
  const plain = text.replace(/\s+/g, " ").trim();
  if (!plain) return "";
  if (!query.trim()) {
    return plain.length > radius * 2 ? `${plain.slice(0, radius * 2).trim()}…` : plain;
  }

  const regex = buildHighlightRegex(query, relatedMap);
  if (!regex) return plain.slice(0, radius * 2);

  const match = regex.exec(plain);
  if (!match || match.index == null) {
    return plain.length > radius * 2 ? `${plain.slice(0, radius * 2).trim()}…` : plain;
  }

  const start = Math.max(0, match.index - radius);
  const end = Math.min(plain.length, match.index + match[0].length + radius);
  const slice = plain.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${slice}${end < plain.length ? "…" : ""}`;
}

export function textMatchesQuery(
  text: string,
  query: string,
  relatedMap: RelatedTermsMap = DEFAULT_RELATED_TERMS,
): boolean {
  if (!query.trim()) return true;
  const hay = text.toLowerCase();
  return expandSearchTerms(query, relatedMap).some((term) => hay.includes(term.toLowerCase()));
}
