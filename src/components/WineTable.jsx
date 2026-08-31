import { Link, useNavigate } from "react-router-dom";
import { winesApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { canManageWinesRole } from "../constants/roles";

// Shared table of wines (one wine per row): Name, Producer, Regions,
// Vintages count and Edit/Delete actions for wine managers.
function WineTable({ wines, onDeleted }) {
  const { user } = useAuth();
  const canManageWines = canManageWinesRole(user);
  const navigate = useNavigate();

  async function handleDelete(wine, e) {
    e.stopPropagation();
    if (
      !window.confirm(`Delete "${wine.name}"? This action cannot be undone.`)
    ) {
      return;
    }
    try {
      await winesApi.destroy(wine.slug);
      if (onDeleted) onDeleted(wine);
    } catch (err) {
      alert(err.message || "Failed to delete wine");
    }
  }

  if (!Array.isArray(wines) || wines.length === 0) {
    return <p className="wine-management__empty-state">No wines yet.</p>;
  }

  return (
    <table className="grapes-table producers-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Producer</th>
          <th>Regions</th>
          <th>Grapes</th>
          <th>Vintages</th>
          {/* {canManageWines && <th>Actions</th>} */}
        </tr>
      </thead>
      <tbody>
        {wines.map((wine, index) => (
          <tr
            key={wine.slug || wine.id}
            className={index % 2 === 0 ? "grapes-row--even" : "grapes-row--odd"}
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
              {Array.isArray(wine.regions) && wine.regions.length > 0
                ? wine.regions.map((region, regionIndex) => (
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
                : "—"}
            </td>
            <td>
              {Array.isArray(wine.grapes) && wine.grapes.length > 0
                ? wine.grapes.map((grape, grapeIndex) => (
                    <span key={grape.id || grapeIndex}>
                      {grapeIndex > 0 && ", "}
                      <Link
                        to={`/grapes/${grape.id}`}
                        className="grapes-table__link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {grape.name}
                      </Link>
                    </span>
                  ))
                : "—"}
            </td>
            <td>
              {Array.isArray(wine.vintages) && wine.vintages.length > 0
                ? `${wine.vintages.length} vintage${
                    wine.vintages.length !== 1 ? "s" : ""
                  }`
                : "—"}
            </td>
            {/* {canManageWines && (
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
            )} */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default WineTable;
