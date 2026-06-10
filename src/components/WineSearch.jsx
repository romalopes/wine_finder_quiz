import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { wineProfilesApi } from "../services/api";

function WineSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const performSearch = useCallback(async (q) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setSearched(false);
      return;
    }
    try {
      setSearching(true);
      setError(null);
      const data = await wineProfilesApi.search(trimmed);
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.message || "Search failed");
      setResults(null);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleInputChange(e) {
    const value = e.target.value;
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => performSearch(value), 300);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      if (timerRef.current) clearTimeout(timerRef.current);
      performSearch(query);
    }
  }

  function getWineTypeLabel(wine) {
    const wineType = wine.color
      ? wine.color.charAt(0).toUpperCase() + wine.color.slice(1)
      : "";
    return wineType;
  }

  function getVarietyGrapes(profile) {
    try {
      const grapes =
        typeof profile.grapes === "string"
          ? JSON.parse(profile.grapes)
          : profile.grapes;
      return Array.isArray(grapes) ? grapes.join(", ") : "";
    } catch {
      return "";
    }
  }

  return (
    <div className="wine-app">
      <div className="wine-search__hero">
        <p className="wine-kicker">Find your wine</p>
        <h1>Search Wines & Varieties</h1>
        <p className="wine-search__subtitle">
          Type a wine name, grape variety, or region. Typos are OK — our fuzzy
          search will still find results.
        </p>
      </div>

      <div className="wine-search__bar">
        <input
          type="text"
          className="wine-search__input"
          placeholder='e.g. "penfolds", "cabernet", "Burgundy", "shiraz"…'
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button
          className="auth-form__submit"
          onClick={() => performSearch(query)}
          disabled={searching || query.trim().length < 2}
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </div>

      {error && <p className="auth-form__error">{error}</p>}

      {searching && <p className="wine-management__loading">Searching…</p>}

      {!searching && searched && results && (
        <div className="wine-search__results">
          {/* Wine profiles (varieties) */}
          {results.wine_profiles && results.wine_profiles.length > 0 && (
            <div className="wine-search__section">
              <h2>Varieties</h2>
              <div className="wine-management__grid">
                {results.wine_profiles.map((profile) => (
                  <div
                    key={profile.slug}
                    className="wine-management__card"
                    onClick={() => navigate(`/quiz`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/quiz`);
                    }}
                  >
                    <div className="wine-management__card-header">
                      <h3>{profile.name}</h3>
                      <span
                        className={`wine-management__color-badge wine-management__color-badge--${profile.color?.toLowerCase()}`}
                      >
                        {profile.color}
                      </span>
                    </div>
                    <p className="wine-search__detail">
                      {getVarietyGrapes(profile) && (
                        <>
                          <strong>Grapes:</strong> {getVarietyGrapes(profile)}
                        </>
                      )}
                    </p>
                    {profile.regions && (
                      <p className="wine-search__detail">
                        <strong>Regions:</strong>{" "}
                        {(Array.isArray(profile.regions)
                          ? profile.regions
                          : JSON.parse(profile.regions || "[]")
                        ).join(", ")}
                      </p>
                    )}
                    <div className="wine-search__card-footer">
                      <span className="wine-search__cta">
                        View in Quiz &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wines */}
          {results.wines && results.wines.length > 0 && (
            <div className="wine-search__section">
              <h2>Wines</h2>
              <div className="wine-management__grid">
                {results.wines.map((wine) => (
                  <div
                    key={wine.slug}
                    className="wine-management__card"
                    onClick={() => navigate(`/wines/${wine.slug}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/wines/${wine.slug}`);
                    }}
                  >
                    <div className="wine-management__card-header">
                      <h3>{wine.name}</h3>
                      <span
                        className={`wine-management__color-badge wine-management__color-badge--${wine.color}`}
                      >
                        {getWineTypeLabel(wine)}
                      </span>
                    </div>
                    <p className="wine-search__detail">
                      <strong>Region:</strong> {wine.region}
                    </p>
                    {wine.vintages && wine.vintages.length > 0 && (
                      <p className="wine-management__vintage-count">
                        {wine.vintages.length} vintage
                        {wine.vintages.length !== 1 ? "s" : ""}
                      </p>
                    )}
                    <div className="wine-search__card-footer">
                      <span className="wine-search__cta">
                        View Details &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!results.wine_profiles || results.wine_profiles.length === 0) &&
            (!results.wines || results.wines.length === 0) && (
              <div className="wine-management__empty">
                <p>No results found for &ldquo;{query}&rdquo;.</p>
                <p>
                  Try a different spelling, a grape variety (e.g.
                  &ldquo;cabernet&rdquo;), or a region.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default WineSearch;
