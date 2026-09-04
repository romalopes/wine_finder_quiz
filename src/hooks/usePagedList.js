import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Reusable paginated-list state. Fetches one page at a time from an API
// endpoint that returns the envelope { items, page, per_page, total_count,
// total_pages } and keeps the current page in the URL search params
// (?page=N) so browser back/forward work without a full page reload.
//
// Usage:
//   const list = usePagedList({ fetcher: (params) => producersApi.list(params) });
//   list.items / list.page / list.totalPages / list.loading ...
//
// `extraParams` (e.g. { grape_id: 5 }) is merged into every request; changing
// it resets the pagination to page 1.
function usePagedList({ fetcher, extraParams = {}, enabled = true, paramKey = "page", perPage = 20 }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Math.max(parseInt(searchParams.get(paramKey), 10) || 1, 1);

  const [items, setItems] = useState([]);
  const [page, setPageState] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const extraKey = JSON.stringify(extraParams);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetcher({ page, per_page: perPage, ...JSON.parse(extraKey) });
        if (cancelled) return;
        if (Array.isArray(data)) {
          // Endpoint did not paginate (no page param honoured) — show all.
          setItems(data);
          setTotalPages(1);
          setTotalCount(data.length);
        } else {
          setItems(Array.isArray(data.items) ? data.items : []);
          setPageState(data.page || page);
          setTotalPages(Math.max(data.total_pages || 1, 1));
          setTotalCount(data.total_count ?? (data.items?.length || 0));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load list");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, extraKey, reloadToken, enabled, perPage]);

  // Keep the URL in sync when the page changes; a URL change (back/forward)
  // flows back into `page` on the next render.
  const setPage = useCallback(
    (next) => {
      const value = Math.max(Number(next) || 1, 1);
      const params = new URLSearchParams(searchParams);
      if (value === 1) params.delete(paramKey);
      else params.set(paramKey, String(value));
      setSearchParams(params, { replace: false });
      setPageState(value);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [searchParams, setSearchParams, paramKey],
  );

  // Follow back/forward navigation.
  useEffect(() => {
    if (pageFromUrl !== page) setPageState(pageFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFromUrl]);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return {
    items,
    page,
    setPage,
    totalPages,
    totalCount,
    loading,
    error,
    reload,
  };
}

export default usePagedList;