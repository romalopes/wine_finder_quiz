import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { winesApi } from "../services/api";

function WineList() {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWines();
  }, []);

  async function loadWines() {
    try {
      setLoading(true);
      setError(null);
      const data = await winesApi.list();
      setWines(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load wines");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(wine, e) {
    e.stopPropagation();
    if (
      !window.confirm(`Delete "${wine.name}"? This action cannot be undone.`)
    ) {
      return;
    }
    try {
      await winesApi.destroy(wine.slug);
      setWines((prev) => prev.filter((w) => w.slug !== wine.slug));
    } catch (err) {
      alert(err.message || "Failed to delete wine");
    }
  }

  if (loading) {
    return (
      <div className="wine-app">
        <p className="wine-management__loading">Loading wines…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wine-app">
        <p className="wine-management__error">{error}</p>
        <button className="auth-form__submit" onClick={loadWines}>
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
          <h1>Wine List</h1>
        </div>
        <Link
          to="/wines/new"
          className="auth-form__submit wine-management__add-btn"
        >
          + Add Wine
        </Link>
      </div>

      {wines.length === 0 ? (
        <div className="wine-management__empty">
          <p>No wines found. Start by adding a new wine!</p>
          <Link to="/wines/new" className="auth-form__submit">
            + Add Your First Wine
          </Link>
        </div>
      ) : (
        <div className="wine-management__grid">
          {wines.map((wine) => (
            <div
              key={wine.slug}
              className="wine-management__card"
              onClick={() => navigate(`/wines/${wine.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/wines/${wine.slug}`);
                }
              }}
            >
              <div className="wine-management__card-header">
                <h3>{wine.name}</h3>
                <span
                  className={`wine-management__color-badge wine-management__color-badge--${wine.color}`}
                >
                  {wine.color}
                </span>
              </div>
              <p className="wine-management__region">{wine.region}</p>
              {wine.producer && (
                <p className="wine-management__producer">
                  {wine.producer.name}
                </p>
              )}
              {wine.vintages && wine.vintages.length > 0 && (
                <p className="wine-management__vintage-count">
                  {wine.vintages.length} vintage
                  {wine.vintages.length !== 1 ? "s" : ""}
                </p>
              )}
              <div className="wine-management__card-actions">
                <Link
                  to={`/wines/${wine.slug}/edit`}
                  className="wine-management__edit-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
                <button
                  className="wine-management__delete-btn"
                  onClick={(e) => handleDelete(wine, e)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WineList;
