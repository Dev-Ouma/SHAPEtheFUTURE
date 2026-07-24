/**
 * Serialize data for safe embedding inside a
 * `<script type="application/ld+json">…</script>` element.
 *
 * `JSON.stringify` does NOT escape `<`, `>` or `&`, so any CMS-controlled value
 * (news/staff/programme titles, settings, etc.) containing `</script>` can break
 * out of the script context and inject markup (stored XSS). Escaping the three
 * HTML-significant characters as unicode escapes keeps the JSON semantically
 * identical while making breakout impossible.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
