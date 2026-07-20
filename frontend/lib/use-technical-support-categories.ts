"use client";

import { useEffect, useMemo, useState } from "react";
import { getApi } from "@/lib/api";
import {
  technicalSupportCategoriesForRequesterType,
  type TechnicalSupportCategoryGroup,
} from "@/lib/technical-support-categories";

/** Map admin requester type → backend catalogue role. */
export function catalogueRoleForRequesterType(requesterType: string): string {
  switch (requesterType) {
    case "Staff":
    case "Faculty":
      return "staff";
    case "Other":
      return "other";
    default:
      return "student";
  }
}

function normalizeGroups(raw: unknown): TechnicalSupportCategoryGroup[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const groups: TechnicalSupportCategoryGroup[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const name = String((item as { name?: unknown }).name || "").trim();
    const subsRaw = (item as { subcategories?: unknown }).subcategories;
    if (!name || !Array.isArray(subsRaw)) continue;
    const subcategories = subsRaw
      .map((s) => String(s || "").trim())
      .filter(Boolean);
    groups.push({ name, subcategories });
  }
  return groups.length > 0 ? groups : null;
}

/**
 * Prefer live backend catalogue (same source as OUK-APP); fall back to the
 * local mirror so Log Ticket / My Tickets never break offline.
 */
export function useTechnicalSupportCategories(requesterType: string): {
  groups: TechnicalSupportCategoryGroup[] | null;
  fromApi: boolean;
  loading: boolean;
} {
  const role = catalogueRoleForRequesterType(requesterType);
  const fallback = useMemo(
    () => technicalSupportCategoriesForRequesterType(requesterType),
    [requesterType],
  );
  const [groups, setGroups] = useState<TechnicalSupportCategoryGroup[] | null>(
    fallback,
  );
  const [fromApi, setFromApi] = useState(false);
  const [loading, setLoading] = useState(role !== "other" && fallback !== null);

  useEffect(() => {
    if (role === "other" || fallback === null) {
      setGroups(null);
      setFromApi(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setGroups(fallback);
    setFromApi(false);
    setLoading(true);

    getApi(`/api/technical-support/categories?role=${encodeURIComponent(role)}`)
      .then((data) => {
        if (cancelled) return;
        const apiGroups = normalizeGroups(data?.groups);
        if (apiGroups) {
          setGroups(apiGroups);
          setFromApi(true);
        }
      })
      .catch(() => {
        /* keep fallback */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role, fallback]);

  return { groups, fromApi, loading };
}

/** Drop stale category/subcategory when the catalogue list changes. */
export function sanitizeCatalogueSelection(
  groups: TechnicalSupportCategoryGroup[] | null | undefined,
  categoryName: string,
  subcategory: string,
): { category_name: string; subcategory: string } {
  if (!groups?.length) {
    return { category_name: categoryName, subcategory };
  }
  const group = groups.find((g) => g.name === categoryName);
  if (!group) {
    return { category_name: "", subcategory: "" };
  }
  if (subcategory && !group.subcategories.includes(subcategory)) {
    return { category_name: categoryName, subcategory: "" };
  }
  return { category_name: categoryName, subcategory };
}
