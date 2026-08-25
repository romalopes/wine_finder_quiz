import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { producersApi } from "../services/api";

function ProducerDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [producer, setProducer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <span className="wine-detail__spec-label">Email</span>
          <span className="wine-detail__spec-value">
            {producer.email || "—"}
          </span>
        </div>
      </div>

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
