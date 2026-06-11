import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { winesApi } from "../services/api";

function WineDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWine();
  }, [slug]);

  async function loadWine() {
    try {
      setLoading(true);
      setError(null);
      const data = await winesApi.show(slug);
      setWine(data);
    } catch (err) {
      setError(err.message || "Failed to load wine");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(`Delete "${wine.name}"? This action cannot be undone.`)
    ) {
      return;
    }
    try {
      await winesApi.destroy(wine.slug);
      navigate("/wines", { replace: true });
    } catch (err) {
      alert(err.message || "Failed to delete wine");
    }
  }

  if (loading) {
    return (
      <div className="wine-app">
        <p className="wine-management__loading">Loading wine details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wine-app">
        <p className="wine-management__error">{error}</p>
        <Link to="/wines" className="auth-form__submit">
          Back to Wines
        </Link>
      </div>
    );
  }

  if (!wine) return null;

  return (
    <div className="wine-app">
      <Link to="/wines" className="wine-detail__back">
        &larr; Back to Wines
      </Link>

      <div className="wine-detail__header">
        <div>
          <p className="wine-kicker">{wine.region}</p>
          <h1>{wine.name}</h1>
        </div>
        <span
          className={`wine-management__color-badge wine-management__color-badge--${wine.color}`}
        >
          {wine.color}
        </span>
      </div>

      {wine.prompt && <p className="wine-detail__prompt">{wine.prompt}</p>}

      {/* Details: closure, alcohol, volume */}
      <div className="wine-detail__specs">
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Closure</span>
          <span className="wine-detail__spec-value">{wine.closure || "—"}</span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Color</span>
          <span className="wine-detail__spec-value">{wine.color || "—"}</span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Alcohol</span>
          <span className="wine-detail__spec-value">
            {wine.alcohol_percentage != null
              ? `${wine.alcohol_percentage}%`
              : "—"}
          </span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Volume</span>
          <span className="wine-detail__spec-value">
            {wine.volume_ml != null ? `${wine.volume_ml}ml` : "—"}
          </span>
        </div>
      </div>

      <div className="wine-detail__actions">
        <Link to={`/wines/${wine.slug}/edit`} className="auth-form__submit">
          Edit Wine
        </Link>
        <button className="wine-management__delete-btn" onClick={handleDelete}>
          Delete Wine
        </button>
      </div>

      <div className="wine-detail__section">
        <h2>Vintages</h2>
        {wine.vintages && wine.vintages.length > 0 ? (
          <div className="wine-detail__vintages">
            {wine.vintages.map((vintage) => (
              <div key={vintage.id} className="wine-detail__vintage">
                <strong>{vintage.year}</strong>
                {vintage.prompt && <p>{vintage.prompt}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="wine-management__empty-state">
            No vintages recorded yet.
          </p>
        )}
      </div>

      {wine.parameters && Object.keys(wine.parameters).length > 0 && (
        <div className="wine-detail__section">
          <h2>Taste Parameters</h2>
          <div className="wine-detail__params">
            {Object.entries(wine.parameters).map(([key, score]) => (
              <div key={key} className="wine-detail__param">
                <span className="wine-detail__param-label">{key}</span>
                <div className="wine-meter">
                  <span style={{ width: `${(score / 5) * 100}%` }} />
                </div>
                <span className="wine-detail__param-score">{score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WineDetail;
