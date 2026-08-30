import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { countriesApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { isSuperUser, canManageGrapes } from "../constants/roles";

function CountryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const canManage = isSuperUser(user) || canManageGrapes(user);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    countriesApi
      .show(id)
      .then((data) => {
        if (!cancelled) setCountry(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load country");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="grapes-page">
        <p className="grapes-page__loading">Loading country…</p>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="grapes-page">
        {error && <div className="flash flash--alert">{error}</div>}
        <Link to="/countries" className="back-link">
          &larr; Back to countries
        </Link>
      </div>
    );
  }

  return (
    <div className="grapes-page">
      <Link to="/countries" className="back-link">
        &larr; Back to countries
      </Link>
      <div className="grapes-page__header">
        <h1 className="grapes-page__title">
          {country.flag_emoji} {country.name}
        </h1>
        {canManage && (
          <div className="section-header__actions">
            <Link to={`/countries/${country.id}`} className="btn-primary">
              Show
            </Link>
          </div>
        )}
      </div>

      <div className="grape-detail">
        <ul className="facts">
          <li>
            <strong>ISO code:</strong> {country.code}
          </li>
          <li>
            <strong>Continent:</strong> {country.continent || "—"}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CountryDetail;