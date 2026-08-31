import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { producersApi, winesApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { canManageWinesRole } from "../constants/roles";

function ProducerWines() {
  const { slug } = useParams();
  const { user } = useAuth();
  // Super Users, Reviewers and Editors may edit or delete wines.
  const canManageWines = canManageWinesRole(user);
  const [producer, setProducer] = useState(null);
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function loadWines() {
    try {
      setLoading(true);
      setError(null);
      const [producerData, winesData] = await Promise.all([
        producersApi.show(slug),
        winesApi.list(),
      ]);
      setProducer(producerData);
      const allWines = Array.isArray(winesData) ? winesData : [];
      setWines(
        allWines.filter((wine) => wine.producer && wine.producer.slug === slug),
      );
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
      <Link to="/producers" className="wine-detail__back">
        &larr; Back to Producers
      </Link>
      <div className="wine-management__header">
        <div>
          <p className="wine-kicker">Cellar</p>
          <h1>Wines of {producer ? producer.name : "Producer"}</h1>
        </div>
      </div>

      {wines.length === 0 ? (
        <div className="wine-management__empty">
          <p>No wines found for this producer.</p>
        </div>
      ) : (
        <table className="grapes-table producers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Producer</th>
              <th>Regions</th>
              <th>Vintages</th>
              {canManageWines && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {wines.map((wine, index) => (
              <tr
                key={wine.slug}
                className={
                  index % 2 === 0 ? "grapes-row--even" : "grapes-row--odd"
                }
                onClick={() => navigate(`/wines/${wine.slug}`)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <Link
                    to={`/wines/${wine.slug}`}
                    className="grapes-table__link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {wine.name}
                  </Link>
                </td>
                <td>
                  {wine.producer ? (
                    <Link
                      to={`/producers/${wine.producer.slug}`}
                      className="grapes-table__link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {wine.producer.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {Array.isArray(wine.regions) && wine.regions.length > 0 ? (
                    wine.regions.map((region, regionIndex) => (
                      <span key={region.id || regionIndex}>
                        {regionIndex > 0 && ", "}
                        <Link
                          to={`/regions/${region.id}`}
                          className="grapes-table__link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {region.name}
                        </Link>
                      </span>
                    ))
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {Array.isArray(wine.vintages) && wine.vintages.length > 0
                    ? `${wine.vintages.length} vintage${
                        wine.vintages.length !== 1 ? "s" : ""
                      }`
                    : "—"}
                </td>
                {canManageWines && (
                  <td className="actions">
                    <Link
                      to={`/wines/${wine.slug}/edit`}
                      className="btn-action"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                    <button
                      className="btn-action btn-action--delete"
                      onClick={(e) => handleDelete(wine, e)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProducerWines;
