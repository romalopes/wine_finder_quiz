import { useRef, useState } from "react";
import { grapesApi } from "../services/api";

// Grape picker used in the wine form. Debounced search-as-you-type; allows
// adding multiple grapes to a wine, shown as removable tags.
function GrapeSearch({ selected, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef(null);

  function performSearch(q) {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults(null);
      return;
    }
    setSearching(true);
    grapesApi
      .search(trimmed)
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }

  function handleInputChange(e) {
    const newValue = e.target.value;
    setQuery(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => performSearch(newValue), 300);
  }

  function handleSelect(grape) {
    if (!selected.some((g) => g.id === grape.id)) {
      onChange([...selected, { id: grape.id, name: grape.name }]);
    }
    setQuery("");
    setResults(null);
  }

  function handleRemove(id) {
    onChange(selected.filter((g) => g.id !== id));
  }

  return (
    <div className="producer-search">
      <span>Grapes</span>
      {selected.length > 0 && (
        <div className="grape-search__selected">
          {selected.map((grape) => (
            <span key={grape.id} className="grape-tag">
              {grape.name}
              <button
                type="button"
                className="wine-form__remove-vintage"
                onClick={() => handleRemove(grape.id)}
                title={`Remove ${grape.name}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Start typing a grape name…"
        autoComplete="off"
      />
      {searching && <p className="wine-management__loading">Searching…</p>}
      {results !== null && results.length > 0 && (
        <div className="review-list">
          {results.map((grape) => (
            <button
              key={grape.id}
              type="button"
              className="review-card"
              onClick={() => handleSelect(grape)}
            >
              <strong>{grape.name}</strong>
              {grape.color && <span> ({grape.color})</span>}
              {Array.isArray(grape.synonyms) && grape.synonyms.length > 0 && (
                <span className="grape-search__synonyms">
                  {" "}({grape.synonyms.join(", ")})
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {results !== null &&
        !searching &&
        results.length === 0 &&
        query.trim().length >= 2 && (
          <p className="wine-management__empty-state">No grapes found.</p>
        )}
    </div>
  );
}

export default GrapeSearch;