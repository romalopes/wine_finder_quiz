import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { producersApi, winesApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { canManageWinesRole } from "../constants/roles";
import WineTable from "./WineTable";

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

      {producer.logo_url && (
        <div style={{ margin: "0 0 1rem" }}>
          <img
            src={producer.logo_url}
            alt={`${producer.name} logo`}
            style={{ maxWidth: 180 }}
          />
        </div>
      )}

      {Array.isArray(producer.images) && producer.images.length > 0 && (
        <div className="wine-detail__images">
          {producer.images.map((src, i) => (
            <img key={i} src={src} alt={`${producer.name} ${i + 1}`} />
          ))}
        </div>
      )}

      <section className="detail-card">
        <ul className="facts" aria-label="Producer details">
          <li>
            <strong>Status:</strong>{" "}
            {producer.active === false ? "Inactive" : "Active"}
          </li>
          <li>
            <strong>Country:</strong>{" "}
            {producer.country
              ? `${producer.country.flag_emoji || ""} ${producer.country.name}`.trim()
              : "—"}
          </li>
          <li>
            <strong>Legal name:</strong> {producer.legal_name || "—"}
          </li>
          <li>
            <strong>Address:</strong> {producer.address || "—"}
          </li>
          <li>
            <strong>Location:</strong>{" "}
            {[producer.city, producer.state, producer.postal_code]
              .filter(Boolean)
              .join(", ") || "—"}
          </li>
          <li>
            <strong>Phone:</strong> {producer.phone || "—"}
          </li>
          <li>
            <strong>Founded:</strong> {producer.founded_year || "—"}
          </li>
          <li>
            <strong>Type:</strong>{" "}
            {producer.producer_type
              ? producer.producer_type
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
              : "—"}
          </li>
          <li>
            <strong>Email:</strong>{" "}
            {producer.email ? (
              <a href={`mailto:${producer.email}`}>{producer.email}</a>
            ) : (
              "—"
            )}
          </li>
          <li>
            <strong>Website:</strong>{" "}
            {producer.website ? (
              <a href={producer.website} target="_blank" rel="noreferrer">
                {producer.website}
              </a>
            ) : (
              "—"
            )}
          </li>
          <li>
            <strong>Instagram:</strong>{" "}
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
          </li>
          <li>
            <strong>Facebook:</strong>{" "}
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
          </li>
          <li>
            <strong>Description:</strong> {producer.description || "—"}
          </li>
        </ul>
      </section>

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

      {Array.isArray(producer.regions) && producer.regions.length > 0 && (
        <div className="wine-detail__section">
          <h2>Regions</h2>
          <p>
            {producer.regions
              .map((r) =>
                r.country_name ? `${r.name} (${r.country_name})` : r.name,
              )
              .join(", ")}
          </p>
        </div>
      )}

      {Array.isArray(producer.grapes) && producer.grapes.length > 0 && (
        <div className="wine-detail__section">
          <h2>Grapes</h2>
          <p>
            {producer.grapes
              .map((g) => (g.color ? `${g.name} (${g.color})` : g.name))
              .join(", ")}
          </p>
        </div>
      )}

      {/* {canManageProducers && (
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
                style={{
                  display: "grid",
                  gap: 6,
                  listStyle: "none",
                  padding: 0,
                }}
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
      )} */}

      {/* {Array.isArray(producer.wines) &&
        producer.wines.length > 0 &&
        (() => {
          const categoryMap = new Map();
          producer.wines.forEach((w) => {
            const cats =
              w.categories ||
              (w.category ? [{ id: w.category_id, name: w.category }] : []);
            cats.forEach((c) => {
              if (c && c.id && !categoryMap.has(c.id)) categoryMap.set(c.id, c);
            });
          });
          const categories = Array.from(categoryMap.values());
          if (categories.length === 0) return null;
          return (
            <div className="wine-detail__section">
              <h2>Categories</h2>
              <p>
                {categories
                  .map((c) => (
                    <Link
                      key={c.id}
                      to={`/categories/${c.id}`}
                      style={{ marginRight: 8 }}
                    >
                      {c.name}
                    </Link>
                  ))
                  .reduce(
                    (prev, curr, i) =>
                      i === 0 ? [curr] : [...prev, ", ", curr],
                    [],
                  )}
              </p>
            </div>
          );
        })()} */}
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
                style={{
                  display: "grid",
                  gap: 6,
                  listStyle: "none",
                  padding: 0,
                }}
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
          <WineTable
            wines={producer.wines}
            onDeleted={(deleted) =>
              setProducer((prev) => ({
                ...prev,
                wines: prev.wines.filter((w) => w.slug !== deleted.slug),
              }))
            }
            linkContext={{
              type: "producer",
              id: producer.id,
              name: producer.name,
            }}
            onWineLinked={() => {
              producersApi
                .show(producer.slug)
                .then(setProducer)
                .catch(() => {});
            }}
          />
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
