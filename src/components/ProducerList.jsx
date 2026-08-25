import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { producersApi } from "../services/api";

function ProducerList() {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducers();
  }, []);

  async function loadProducers() {
    try {
      setLoading(true);
      setError(null);
      const data = await producersApi.list();
      setProducers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load producers");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="wine-app">
        <p className="wine-management__loading">Loading producers…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wine-app">
        <p className="wine-management__error">{error}</p>
        <button className="auth-form__submit" onClick={loadProducers}>
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
          <h1>Producers</h1>
        </div>
        <Link
          to="/producers/new"
          className="auth-form__submit wine-management__add-btn"
        >
          + Add Producer
        </Link>
      </div>

      {producers.length === 0 ? (
        <div className="wine-management__empty">
          <p>No producers found. Start by adding a new producer!</p>
          <Link to="/producers/new" className="auth-form__submit">
            + Add Your First Producer
          </Link>
        </div>
      ) : (
        <div className="wine-management__grid">
          {producers.map((producer) => (
            <div
              key={producer.slug}
              className="wine-management__card"
              onClick={() => navigate(`/producers/${producer.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/producers/${producer.slug}`);
                }
              }}
            >
              {Array.isArray(producer.images) && producer.images.length > 0 && (
                <img
                  src={producer.images[0]}
                  alt={producer.name}
                  className="wine-management__thumb"
                />
              )}
              <div className="wine-management__card-header">
                <h3>{producer.name}</h3>
              </div>
              {producer.address && (
                <p className="wine-management__region">{producer.address}</p>
              )}
              {producer.email && (
                <p className="wine-management__producer">{producer.email}</p>
              )}
              {producer.wines && producer.wines.length > 0 && (
                <p className="wine-management__vintage-count">
                  {producer.wines.length} wine
                  {producer.wines.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProducerList;
