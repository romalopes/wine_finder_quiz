import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { wineriesApi } from "../services/api";

function WineryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [winery, setWinery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWinery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wineriesApi.show(slug);
      setWinery(data);
    } catch (err) {
      setError(err.message || "Failed to load winery");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadWinery();
  }, [loadWinery]);

  if (loading) {
    return (
      <div className="wine-app">
        <p className="wine-management__loading">Loading winery details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wine-app">
        <p className="wine-management__error">{error}</p>
        <Link to="/wineries" className="auth-form__submit">
          Back to Wineries
        </Link>
      </div>
    );
  }

  if (!winery) return null;

  return (
    <div className="wine-app">
      <Link to="/wineries" className="wine-detail__back">
        &larr; Back to Wineries
      </Link>
      <div className="wine-detail__header">
        <div>
          <p className="wine-kicker">Winery</p>
          <h1>{winery.name}</h1>
        </div>
      </div>

      <div className="wine-detail__specs">
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Address</span>
          <span className="wine-detail__spec-value">
            {winery.address || "—"}
          </span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Email</span>
          <span className="wine-detail__spec-value">{winery.email || "—"}</span>
        </div>
      </div>

      <div className="wine-detail__actions">
        <Link
          to={`/wineries/${winery.slug}/edit`}
          className="auth-form__submit"
        >
          Edit Winery
        </Link>
        <button
          className="wine-management__delete-btn"
          onClick={async () => {
            if (
              !window.confirm(
                `Delete "${winery.name}"? This action cannot be undone.`,
              )
            )
              return;
            try {
              await wineriesApi.destroy(winery.slug);
              navigate("/wineries", { replace: true });
            } catch (err) {
              alert(err.message || "Failed to delete winery");
            }
          }}
        >
          Delete Winery
        </button>
      </div>

      <div className="wine-detail__section">
        <h2>Wines</h2>
        {winery.wines && winery.wines.length > 0 ? (
          <ul className="wine-list">
            {winery.wines.map((wine) => (
              <li key={wine.slug}>
                <Link to={`/wines/${wine.slug}`}>{wine.name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="wine-management__empty-state">
            No wines are associated with this winery yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default WineryDetail;
