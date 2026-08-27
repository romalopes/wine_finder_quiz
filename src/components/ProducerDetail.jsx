import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { producersApi, winesApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { canManageWinesRole } from "../constants/roles";

function ProducerDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Super Users, Reviewers and Editors may manage producers / link wines.
  const canManageProducers = canManageWinesRole(user);
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inline wine search for linking wines to this producer.
  const [wineQuery, setWineQuery] = useState("");
  const [wineResults, setWineResults] = useState(null);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState(null);

  const loadProducer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await producersApi.show(slug);
      setProducer(data);
    } catch (err) {
      setError(err.message || "Failed to load producer");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProducer();
  }, [loadProducer]);

  // Debounced wine search for the linking UI.
  useEffect(() => {
    if (!canManageProducers) return undefined;
    const query = wineQuery.trim();
    if (query.length < 2) {
      setWineResults(null);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const results = await winesApi.search(query);
        if (!cancelled) setWineResults(results.slice(0, 8));
      } catch {
        if (!cancelled) setWineResults([]);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [wineQuery, canManageProducers]);

  async function handleLinkWine(wine) {
    const current = wine.producer?.name;
    const message =
      current && current !== producer.name
        ? `"${wine.name}" is currently linked to "${current}". Reassign it to "${producer.name}"?`
        : `Link "${wine.name}" to "${producer.name}"?`;
    if (!window.confirm(message)) return;
    setLinking(true);
    setLinkError(null);
    try {
      await winesApi.update(wine.slug, { producer_id: producer.id });
      await loadProducer();
    } catch (err) {
      setLinkError(err.message || "Failed to link wine");
    } finally {
      setLinking(false);
    }
  }

  if (loading) {
    return (
      <div className="wine-app">
        <p className="wine-management__loading">Loading producer details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wine-app">
        <p className="wine-management__error">{error}</p>
        <Link to="/producers" className="auth-form__submit">
          Back to Producers
        </Link>
      </div>
    );
  }

  if (!producer) return null;

  return (
    <div className="wine-app">
      <Link to="/producers" className="wine-detail__back">
        &larr; Back to Producers
      </Link>
      <div className="wine-detail__header">
        <div>
          <p className="wine-kicker">Producer</p>
          <h1>{producer.name}</h1>
        </div>
      </div>

      {Array.isArray(producer.images) && producer.images.length > 0 && (
        <div className="wine-detail__images">
          {producer.images.map((src, i) => (
            <img key={i} src={src} alt={`${producer.name} ${i + 1}`} />
          ))}
        </div>
      )}

      <div className="wine-detail__specs">
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Address</span>
          <span className="wine-detail__spec-value">
            {producer.address || "—"}
          </span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Type</span>
          <span className="wine-detail__spec-value">
            {producer.producer_type
              ? producer.producer_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
              : "—"}
          </span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Email</span>
          <span className="wine-detail__spec-value">
            {producer.email || "—"}
          </span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Website</span>
          <span className="wine-detail__spec-value">
            {producer.website ? (
              <a
                href={producer.website}
                target="_blank"
                rel="noreferrer"
              >
                {producer.website}
              </a>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Instagram</span>
          <span className="wine-detail__spec-value">
            {producer.instagram ? (
              <a
                href={
                  producer.instagram.startsWith("http")
                    ? producer.instagram
                    : `https://instagram.com/${producer.instagram.replace("@", "")}`
                }
                target="_blank"
                rel="noreferrer"
              >
                {producer.instagram}
              </a>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Facebook</span>
          <span className="wine-detail__spec-value">
            {producer.facebook ? (
              <a
                href={
                  producer.facebook.startsWith("http")
                    ? producer.facebook
                    : `https://facebook.com/${producer.facebook}`
                }
                target="_blank"
                rel="noreferrer"
              >
                {producer.facebook}
              </a>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Description</span>
          <span className="wine-detail__spec-value">
            {producer.description || "—"}
          </span>
        </div>
      </div>

      {canManageProducers && (
        <div className="wine-detail__actions">
        <Link
          to={`/producers/${producer.slug}/edit`}
          className="auth-form__submit"
        >
          Edit Producer
        </Link>
        <button
          className="wine-management__delete-btn"
          onClick={async () => {
            if (
              !window.confirm(
                `Delete "${producer.name}"? This action cannot be undone.`,
              )
            )
              return;
            try {
              await producersApi.destroy(producer.slug);
              navigate("/producers", { replace: true });
            } catch (err) {
              alert(err.message || "Failed to delete producer");
            }
          }}
        >
          Delete Producer
        </button>
        </div>
      )}

      {canManageProducers && (
        <div className="wine-detail__section">
          <h2>Link a Wine</h2>
          <div className="review-form__field">
            <label htmlFor="producer-wine-search">
              Search wines by name to link them to {producer.name}
            </label>
            <input
              id="producer-wine-search"
              type="text"
              value={wineQuery}
              onChange={(e) => setWineQuery(e.target.value)}
              placeholder="Search wines by name…"
            />
          </div>
          {linkError && <p className="review-form__error">{linkError}</p>}
          {wineResults != null &&
            (wineResults.length === 0 ? (
              <p className="wine-management__empty-state">No matching wines.</p>
            ) : (
              <ul
                className="wine-list"
                style={{ display: "grid", gap: 6, listStyle: "none", padding: 0 }}
              >
                {wineResults.map((wine) => {
                  const linkedHere =
                    wine.producer?.slug === producer.slug ||
                    wine.producer?.id === producer.id;
                  return (
                    <li
                      key={wine.slug}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        border: "1px solid #d8c8c0",
                        borderRadius: 8,
                        padding: "8px 12px",
                        background: "#fff",
                      }}
                    >
                      <strong>{wine.name}</strong>
                      {linkedHere ? (
                        <span style={{ color: "#2e7d43", fontWeight: 700 }}>
                          Linked here ✓
                        </span>
                      ) : (
                        <>
                          <span style={{ color: "#666", fontSize: ".85rem" }}>
                            {wine.producer?.name
                              ? `currently with ${wine.producer.name}`
                              : "no producer"}
                          </span>
                          <button
                            type="button"
                            className="review-form__status-btn"
                            disabled={linking}
                            onClick={() => handleLinkWine(wine)}
                          >
                            Link
                          </button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            ))}
        </div>
      )}

      <div className="wine-detail__section">
        <h2>Wines</h2>
        {producer.wines && producer.wines.length > 0 ? (
          <ul className="wine-list">
            {producer.wines.map((wine) => (
              <li key={wine.slug}>
                <Link to={`/wines/${wine.slug}`}>{wine.name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="wine-management__empty-state">
            No wines are associated with this producer yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default ProducerDetail;
