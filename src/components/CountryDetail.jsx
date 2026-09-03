import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { countriesApi } from "../services/api";
import WineTable from "./WineTable";

function CountryDetail() {
  const { id } = useParams();
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

  // If we navigated here from a country-list count link ("#producers" /
  // "#wines"), scroll to the relevant section once the country has loaded.
  useEffect(() => {
    if (!country) return;
    const hash = window.location.hash;
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, [country]);

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
      </div>

      <div className="grape-detail">
        <ul className="facts">
          <li>
            <strong>ISO code:</strong> {country.code}
          </li>
          <li>
            <strong>Continent:</strong> {country.continent || "—"}
          </li>
          <li>
            <strong>Wine country:</strong>{" "}
            {country.is_wine_country ? "Yes" : "No"}
          </li>
        </ul>
      </div>

      <section id="producers" className="country-detail__section">
        <h2>Producers</h2>
        {country.producers?.length ? (
          <table className="grapes-table producers-table">
            <thead>
              <tr>
                <th className="producers-table__image-col" />
                <th>Name</th>
                <th>Type</th>
                <th>Wines</th>
              </tr>
            </thead>
            <tbody>
              {country.producers.map((producer, index) => (
                <tr
                  key={producer.slug || producer.id}
                  className={
                    index % 2 === 0 ? "grapes-row--even" : "grapes-row--odd"
                  }
                >
                  <td>
                    {producer.logo_url ? (
                      <img
                        src={producer.logo_url}
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
                    >
                      {producer.name}
                    </Link>
                  </td>
                  <td>
                    {producer.producer_type
                      ? producer.producer_type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())
                      : "—"}
                  </td>
                  <td>{producer.wines_count ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No producers for this country yet.</p>
        )}
      </section>

      <section id="wines" className="country-detail__section">
        <h2>Wines</h2>
        <WineTable
          wines={country.wines}
          onDeleted={(deleted) =>
            setCountry((prev) => ({
              ...prev,
              wines: prev.wines.filter((w) => w.slug !== deleted.slug),
            }))
          }
        />
      </section>
    </div>
  );
}

export default CountryDetail;