import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { wineriesApi } from "../services/api";

function WineryList() {
  const [wineries, setWineries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWineries();
  }, []);

  async function loadWineries() {
    try {
      setLoading(true);
      setError(null);
      const data = await wineriesApi.list();
      setWineries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load wineries");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="wine-app">
        <p className="wine-management__loading">Loading wineries…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wine-app">
        <p className="wine-management__error">{error}</p>
        <button className="auth-form__submit" onClick={loadWineries}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="wine-app">
      <div className="wine-management__header">
        <div>
          <p className="wine-kicker">Cellar</p>
          <h1>Wineries</h1>
        </div>
        <Link
          to="/wineries/new"
          className="auth-form__submit wine-management__add-btn"
        >
          + Add Winery
        </Link>
      </div>

      {wineries.length === 0 ? (
        <div className="wine-management__empty">
          <p>No wineries found. Start by adding a new winery!</p>
          <Link to="/wineries/new" className="auth-form__submit">
            + Add Your First Winery
          </Link>
        </div>
      ) : (
        <div className="wine-management__grid">
          {wineries.map((winery) => (
            <div
              key={winery.slug}
              className="wine-management__card"
              onClick={() => navigate(`/wineries/${winery.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/wineries/${winery.slug}`);
                }
              }}
            >
              <div className="wine-management__card-header">
                <h3>{winery.name}</h3>
              </div>
              {winery.address && (
                <p className="wine-management__region">{winery.address}</p>
              )}
              {winery.email && (
                <p className="wine-management__winery">{winery.email}</p>
              )}
              {winery.wines && winery.wines.length > 0 && (
                <p className="wine-management__vintage-count">
                  {winery.wines.length} wine
                  {winery.wines.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WineryList;
