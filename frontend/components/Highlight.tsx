"use client";

import React, { useId, useMemo } from "react";
import { buildHighlightRegex, expandSearchTerms } from "@/lib/searchHighlight";
import { useRelatedTerms } from "@/components/SearchHighlightProvider";

export interface HighlightProps {
  text: string;
  query: string;
  /** Override mark styles. Defaults to animated brand highlight. */
  className?: string;
  /** When true, skip pulse animation (dense tables). */
  quiet?: boolean;
}

const DEFAULT_MARK =
  "search-mark relative rounded-[2px] bg-secondary/25 text-primary-darker font-bold px-0.5 shadow-[inset_0_-1px_0_rgba(255,127,80,0.45)]";

/**
 * Highlights query tokens and related phrases inside `text`.
 * Related phrases come from CMS (`search_related_terms_json`) via provider.
 */
const Highlight: React.FC<HighlightProps> = ({
  text,
  query,
  className,
  quiet = false,
}) => {
  const uid = useId();
  const markClass = className ?? DEFAULT_MARK;
  const relatedMap = useRelatedTerms();

  const { parts, matchSet } = useMemo(() => {
    if (!text || !query?.trim()) {
      return { parts: [text || ""], matchSet: new Set<string>() };
    }
    const terms = expandSearchTerms(query, relatedMap);
    const regex = buildHighlightRegex(query, relatedMap);
    if (!regex || !terms.length) {
      return { parts: [text], matchSet: new Set<string>() };
    }
    return {
      parts: text.split(regex),
      matchSet: new Set(terms.map((t) => t.toLowerCase())),
    };
  }, [text, query, relatedMap]);

  if (!query?.trim() || parts.length <= 1) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        if (matchSet.has(part.toLowerCase())) {
          return (
            <mark
              key={`${uid}-${index}`}
              className={`${markClass}${quiet ? "" : " search-mark-pulse"}`}
            >
              {part}
            </mark>
          );
        }
        return <React.Fragment key={`${uid}-${index}`}>{part}</React.Fragment>;
      })}
    </>
  );
};

export default Highlight;
