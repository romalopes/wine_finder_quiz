import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { regionsApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { isSuperUser, canManageGrapes } from "../constants/roles";

function typeLabel(region) {
  const labels = [];
  if (region.is_state) labels.push("State");
  if (region.is_appellation) labels.push("Appellation");
  return labels.length > 0 ? labels.join(" / ") : "Region";
}

function RegionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const canManage = isSuperUser(user) || canManageGrapes(user);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    regionsApi
      .show(id)
      .then((data) => {
        if (!cancelled) setRegion(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load region");
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
        <p className="grapes-page__loading">Loading region…</p>
      </div>
    );
  }

  if (error || !region) {
    return (
      <div className="grapes-page">
        {error && <div className="flash flash--alert">{error}</div>}
        <Link to="/regions" className="back-link">
          &larr; Back to regions
        </Link>
      </div>
    );
  }

  return (
    <div className="grapes-page">
      <Link to="/regions" className="back-link">
        &larr; Back to regions
      </Link>
      <div className="grapes-page__header">
        <h1 className="grapes-page__title">
          {region.country?.flag_emoji ? `${region.country.flag_emoji} ` : ""}
          {region.name}
        </h1>
        {canManage && (
          <div className="section-header__actions">
            <Link to="/regions" className="btn-primary">
              Manage Regions
            </Link>
          </div>
        )}
      </div>

      <div className="grape-detail">
        <ul className="facts">
          <li>
            <strong>Country:</strong>{" "}
            {region.country?.name || "—"}
          </li>
          <li>
            <strong>Type:</strong> {typeLabel(region)}
          </li>
          <li>
            <strong>Parent:</strong> {region.parent_id ? "Yes" : "—"}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default RegionDetail;