import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { grapesApi, winesApi } from "../services/api";
import WineTable from "./WineTable";

function GrapeWines() {
  const { id } = useParams();
  const [grape, setGrape] = useState(null);
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadWines() {
    try {
      setLoading(true);
      setError(null);
      const [grapeData, winesData] = await Promise.all([
        grapesApi.show(id),
        winesApi.list(),
      ]);
      setGrape(grapeData);
      const allWines = Array.isArray(winesData) ? winesData : [];
      setWines(
        allWines.filter(
          (wine) =>
            Array.isArray(wine.grapes) &&
            wine.grapes.some((g) => String(g.id) === String(id)),
        ),
      );
    } catch (err) {
      setError(err.message || "Failed to load wines");
    } finally {
      setLoading(false);
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
      <Link to="/grapes" className="wine-detail__back">
        &larr; Back to Grapes
      </Link>
      <div className="wine-management__header">
        <div>
          <p className="wine-kicker">Cellar</p>
          <h1>Wines of {grape ? grape.name : "Grape"}</h1>
        </div>
      </div>

      {wines.length === 0 ? (
        <div className="wine-management__empty">
          <p>No wines found for this grape.</p>
        </div>
      ) : (
        <WineTable
          wines={wines}
          onDeleted={(deleted) =>
            setWines((prev) => prev.filter((w) => w.slug !== deleted.slug))
          }
        />
      )}
    </div>
  );
}

export default GrapeWines;
