import { useSearchParams } from "react-router-dom";

/**
 * Returns the currently selected ?category= query param (or null).
 */
export function useSelectedCategory() {
  const [searchParams] = useSearchParams();
  return searchParams.get("category");
}
