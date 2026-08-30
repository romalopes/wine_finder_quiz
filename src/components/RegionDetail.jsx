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

  // Get the full path from country to region
  const path = region.full_path || [
    {
      type: "country",
      name: region.country?.name || "Unknown Country",
      flag_emoji: region.country?.flag_emoji,
    },
    {
      type: "region",
      name: region.name,
    },
  ];

  return (
    <div className="grapes-page">
      <div className="region-detail__header">
        <h1 className="region-detail__title">
          {region.country?.flag_emoji ? `${region.country.flag_emoji} ` : ""}
          {region.name}
        </h1>
        {canManage && (
          <div className="region-detail__actions">
            <Link to="/regions" className="btn-primary">
              Manage Regions
            </Link>
          </div>
        )}
      </div>

      {/* Region Path/Breadcrumb */}
      <div className="region-detail__path">
        {path.map((item, index) => (
          <span key={index} className="region-detail__path-item">
            {index > 0 && " → "}
            {item.flag_emoji && <span className="region-detail__flag">{item.flag_emoji} </span>}
            <Link
              to={item.type === "country" ? `/countries/${region.country.id}` : `/regions/${item.id}`}
              className="region-detail__path-link"
            >
              {item.name}
            </Link>
          </span>
        ))}
      </div>

      <div className="region-detail__section">
        <h2>Details</h2>
        <ul className="facts">
          <li>
            <strong>Country:</strong>{" "}
            {region.country?.flag_emoji ? `${region.country.flag_emoji} ` : ""}
            {region.country?.name || "—"}
          </li>
          <li>
            <strong>Type:</strong> {typeLabel(region)}
          </li>
          <li>
            <strong>Parent:</strong> {region.parent_name ? `Yes (${region.parent_name})` : "—"}
          </li>
        </ul>
      </div>

      <div className="region-detail__section">
        <h2>Wines</h2>
        {region.wines?.length > 0 ? (
          <ul>
            {region.wines.map((wine) => (
              <li key={wine.id}>
                <Link to={`/wines/${wine.slug}`}>{wine.name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No wines are associated with this region yet.</p>
        )}
      </div>

      <div className="page-actions">
        <Link to="/regions" className="btn-secondary">
          ← Back to Regions
        </Link>
        {canManage && (
          <>
            <Link to={`/regions/${region.id}/edit`} className="btn-secondary">
              Edit
            </Link>
            <button
              className="btn-action btn-action--delete"
              onClick={() => {
                if (window.confirm("Delete this region? This action cannot be undone.")) {
                  // Delete logic would go here
                }
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default RegionDetail;