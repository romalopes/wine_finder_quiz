import { useEffect, useState } from "react";
import { categoriesApi } from "../services/api";

/**
 * Loads categories once and exposes a map of category name -> sort order
 * for the given sort key ("sort_order_wine" | "sort_order_review" |
 * "sort_order_article").
 */
export function useCategoryOrder(sortKey) {
  const [orderMap, setOrderMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    categoriesApi
      .list()
      .then((cats) => {
        if (cancelled) return;
        const map = {};
        (Array.isArray(cats) ? cats : []).forEach((c) => {
          map[c.name] = c[sortKey] ?? null;
        });
        setOrderMap(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sortKey]);

  return orderMap;
}

/**
 * Sorts grouped-category keys by their stored sort order.
 * Ordered categories come first (ascending), unordered ones follow
 * alphabetically, and "Uncategorized" is always last.
 */
export function sortCategoryNames(names, orderMap) {
  return [...names].sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    const oa = orderMap[a];
    const ob = orderMap[b];
    if (oa != null && ob != null) return oa - ob || a.localeCompare(b);
    if (oa != null) return -1;
    if (ob != null) return 1;
    return a.localeCompare(b);
  });
}
