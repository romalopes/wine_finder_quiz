import { useRef, useState } from "react";
import { producersApi } from "../services/api";

// Producer picker used in the wine form. Debounced search (like the wine
// search on the Reviews page); if no producer matches, an inline creation
// form appears so a new producer can be created on the fly.
function ProducerSearch({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const selectedProducer = value || null;

  function performSearch(q) {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults(null);
      return;
    }
    setSearching(true);
    setError(null);
    producersApi
      .search(trimmed)
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Search failed"))
      .finally(() => setSearching(false));
  }

  function handleInputChange(e) {
    const newValue = e.target.value;
    setQuery(newValue);
    setShowCreate(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => performSearch(newValue), 300);
  }

  function handleSelect(producer) {
    onChange(producer.id, producer.name);
    setQuery("");
    setResults(null);
    setShowCreate(false);
  }

  function handleClear() {
    onChange("", "");
    setQuery("");
    setResults(null);
    setShowCreate(false);
    setError(null);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const created = await producersApi.create({
        name: query.trim(),
        address: "",
        // Email and producer_type are mandatory on the backend; the inline
        // quick-create fills in sensible defaults (placeholder email, winery).
        email: `${query.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}@example.com`,
        producer_type: "winery",
      });
      handleSelect(created);
    } catch (err) {
      // The API returns { errors: [...] } on validation failure
      const message =
        err.errors?.join(", ") ||
        err.message ||
        "Failed to create producer";
      setError(message);
    } finally {
      setCreating(false);
    }
  }

  const noResults =
    query.trim().length >= 2 &&
    !searching &&
    results !== null &&
    results.length === 0;

  return (
    <div className="producer-search">
      <span>Producer *</span>
      {selectedProducer ? (
        <div className="producer-search__selected">
          <strong>{value}</strong>
          <button
            type="button"
            className="wine-form__remove-vintage"
            onClick={handleClear}
            title="Change producer"
          >
            &times;
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Start typing a producer name…"
            autoComplete="off"
          />
          {searching && <p className="wine-management__loading">Searching…</p>}
          {error && <p className="review-form__error">{error}</p>}
          {results !== null && results.length > 0 && (
            <div className="review-list">
              {results.map((producer) => (
                <button
                  key={producer.id}
                  type="button"
                  className="review-card"
                  onClick={() => handleSelect(producer)}
                >
                  <div className="review-card__top">
                    <strong>{producer.name}</strong>
                  </div>
                  {producer.address && (
                    <span className="review-card__comment">
                      {producer.address}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {(noResults || showCreate) && (
            <div className="review-form">
              <p className="wine-management__empty-state">
                No producer found. Add it below.
              </p>
              <button
                type="button"
                className="auth-form__submit"
                onClick={handleCreate}
                disabled={creating || query.trim().length < 2}
              >
                {creating ? "Creating…" : `Create "${query.trim()}"`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProducerSearch;
