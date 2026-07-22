"use client";

import React, { createContext, useContext, useMemo } from "react";
import {
  DEFAULT_RELATED_TERMS,
  parseRelatedTerms,
  type RelatedTermsMap,
} from "@/lib/searchHighlight";

const SearchRelatedTermsContext = createContext<RelatedTermsMap>(DEFAULT_RELATED_TERMS);

export function SearchHighlightProvider({
  relatedTermsJson,
  children,
}: {
  relatedTermsJson?: string | Record<string, string[]> | null;
  children: React.ReactNode;
}) {
  const map = useMemo(
    () => parseRelatedTerms(relatedTermsJson ?? DEFAULT_RELATED_TERMS),
    [relatedTermsJson],
  );

  return (
    <SearchRelatedTermsContext.Provider value={map}>
      {children}
    </SearchRelatedTermsContext.Provider>
  );
}

export function useRelatedTerms(): RelatedTermsMap {
  return useContext(SearchRelatedTermsContext);
}
