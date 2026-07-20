import DOMPurify from "isomorphic-dompurify";

const DEFAULT_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "blockquote",
  "code",
  "pre",
  "span",
  "div",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "img",
  "figure",
  "figcaption",
  "hr",
  "sub",
  "sup",
];

const DEFAULT_ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "class",
  "id",
  "width",
  "height",
  "colspan",
  "rowspan",
  // TipTap text-align uses inline style; DOMPurify still sanitizes CSS values.
  "style",
];

let hooksInstalled = false;

/** RSC/Node has no DOM `Element` global — duck-type instead of instanceof. */
function isElementLike(
  node: unknown,
): node is {
  tagName?: string;
  nodeName?: string;
  getAttribute: (name: string) => string | null;
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
} {
  return (
    typeof node === "object" &&
    node !== null &&
    typeof (node as { getAttribute?: unknown }).getAttribute === "function" &&
    typeof (node as { setAttribute?: unknown }).setAttribute === "function" &&
    typeof (node as { removeAttribute?: unknown }).removeAttribute === "function"
  );
}

function ensureHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (!isElementLike(node)) return;

    const tag = String(node.tagName || node.nodeName || "").toUpperCase();

    if (tag === "A") {
      const href = node.getAttribute("href") || "";
      if (/^\s*javascript:/i.test(href) || /^\s*data:/i.test(href)) {
        node.removeAttribute("href");
      }
      if (node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer");
      }
    }

    if (tag === "IMG") {
      const src = node.getAttribute("src") || "";
      if (/^\s*javascript:/i.test(src) || /^\s*data:text\//i.test(src)) {
        node.removeAttribute("src");
      }
    }
  });
}

/**
 * Sanitize CMS/editor HTML before dangerouslySetInnerHTML.
 * Safe to call with null/undefined — returns empty string.
 * Idempotent for already-clean HTML. Safe in RSC (Node) and the browser.
 */
export function sanitizeHtml(
  dirty: string | null | undefined,
  options?: {
    allowedTags?: string[];
    allowedAttr?: string[];
  },
): string {
  if (!dirty) return "";
  ensureHooks();
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: options?.allowedTags ?? DEFAULT_ALLOWED_TAGS,
    ALLOWED_ATTR: options?.allowedAttr ?? DEFAULT_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}
