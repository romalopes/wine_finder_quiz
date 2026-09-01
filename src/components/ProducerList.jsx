import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { producersApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { canManageWinesRole } from "../constants/roles";

function ProducerList() {
  const { user } = useAuth();
  // Super Users, Reviewers and Editors may add, edit or delete wines.
  const canManageProducers = canManageWinesRole(user);
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
        {canManageProducers && (
          <Link
            to="/producers/new"
            className="auth-form__submit wine-management__add-btn"
          >
            + Add Producer
          </Link>
        )}
      </div>

      {producers.length === 0 ? (
        <div className="wine-management__empty">
          <p>No producers found. Start by adding a new producer!</p>
          <Link to="/producers/new" className="auth-form__submit">
            + Add Your First Producer
          </Link>
        </div>
      ) : (
        <table className="grapes-table producers-table">
          <thead>
            <tr>
              <th className="producers-table__image-col">Image</th>
              <th>Name</th>
              <th>Country</th>
              <th>Type</th>
              <th>Status</th>
              <th>Address</th>
              <th>Email</th>
              <th>Wines</th>
              {canManageProducers && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {producers.map((producer, index) => (
              <tr
                key={producer.slug}
                className={
                  index % 2 === 0 ? "grapes-row--even" : "grapes-row--odd"
                }
                onClick={() => navigate(`/producers/${producer.slug}`)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  {producer.logo_url ? (
                    <img
                      src={producer.logo_url}
                      alt={producer.name}
                      className="producers-table__thumb"
                    />
                  ) : Array.isArray(producer.images) &&
                    producer.images.length > 0 ? (
                    <img
                      src={producer.images[0]}
                      alt={producer.name}
                      className="producers-table__thumb"
                    />
                  ) : (
                    <span
                      className="producers-table__thumb producers-table__thumb--empty"
                      aria-hidden="true"
                    />
                  )}
                </td>
                <td>
                  <Link
                    to={`/producers/${producer.slug}`}
                    className="grapes-table__link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {producer.name}
                  </Link>
                </td>
                <td>
                  {producer.country
                    ? `${producer.country.flag_emoji || ""} ${producer.country.name}`.trim()
                    : "—"}
                </td>
                <td>
                  {producer.producer_type
                    ? producer.producer_type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    : "—"}
                </td>
                <td>
                  {producer.active === false ? "Inactive" : "Active"}
                </td>
                <td>{producer.address || "—"}</td>
                <td>{producer.email || "—"}</td>
                <td>
                  {producer.wines && producer.wines.length > 0 ? (
                    <Link
                      to={`/producers/${producer.slug}/wines`}
                      className="grapes-table__link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {`${producer.wines.length} wine${
                        producer.wines.length !== 1 ? "s" : ""
                      }`}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                {canManageProducers && (
                  <td className="actions">
                    <Link
                      to={`/producers/${producer.slug}/edit`}
                      className="btn-action"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
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

export default ProducerList;
