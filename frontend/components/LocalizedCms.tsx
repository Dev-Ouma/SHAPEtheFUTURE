import React from "react";
import {
  cmsProtectAttrs,
  i18nProtectAttrs,
  mergeProtectClass,
} from "@/lib/cms-locale";
import { sanitizeHtml } from "@/lib/sanitize";

type TagName = "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "section" | "article";

type CommonProps = {
  locale: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Renders CMS plain text. Real *_sw → notranslate; EN fallback stays GT-open.
 */
export function LocalizedText({
  locale,
  swSource,
  as: Tag = "span",
  className,
  children,
  ...rest
}: CommonProps & {
  swSource?: string | null;
  as?: TagName;
} & React.HTMLAttributes<HTMLElement>) {
  const protect = cmsProtectAttrs(locale, swSource);
  return (
    <Tag
      {...rest}
      className={mergeProtectClass(className, protect)}
      translate={protect.translate}
      lang={protect.lang}
    >
      {children}
    </Tag>
  );
}

/**
 * Renders sanitized CMS HTML. Real *_sw → notranslate; EN fallback stays GT-open.
 * Always runs through sanitizeHtml — callers may pre-sanitize; that is harmless.
 */
export function LocalizedHtml({
  locale,
  swSource,
  html,
  as: Tag = "div",
  className,
  ...rest
}: CommonProps & {
  swSource?: string | null;
  html: string;
  as?: TagName;
} & Omit<React.HTMLAttributes<HTMLElement>, "dangerouslySetInnerHTML" | "children">) {
  const protect = cmsProtectAttrs(locale, swSource);
  const clean = sanitizeHtml(html);
  return (
    <Tag
      {...rest}
      className={mergeProtectClass(className, protect)}
      translate={protect.translate}
      lang={protect.lang}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

/**
 * Protects next-intl / site chrome strings when locale is sw.
 */
export function I18nProtect({
  locale,
  as: Tag = "span",
  className,
  children,
  ...rest
}: CommonProps & {
  as?: TagName;
} & React.HTMLAttributes<HTMLElement>) {
  const protect = i18nProtectAttrs(locale);
  return (
    <Tag
      {...rest}
      className={mergeProtectClass(className, protect)}
      translate={protect.translate}
      lang={protect.lang}
    >
      {children}
    </Tag>
  );
}
