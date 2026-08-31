import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { categoriesApi, winesApi } from "../services/api";
import WineTable from "./WineTable";

function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadCategory() {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesApi.show(id);
      setCategory(data);
    } catch (err) {
      setError(err.message || "Failed to load category");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="wine-app">
        <p className="wine-management__loading">Loading category…</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="wine-app">
        <p className="wine-management__error">{error || "Category not found."}</p>
        <Link to="/categories" className="auth-form__submit">
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="wine-app">
      <Link to="/categories" className="wine-detail__back">
        &larr; Back to Categories
      </Link>
      <div className="wine-management__header">
        <div>
          <p className="wine-kicker">Cellar</p>
          <h1>Category: {category.name}</h1>
        </div>
      </div>

      <section className="detail-card" style={{ padding: "1rem 1.5rem" }}>
        <h2>Wines</h2>
        {Array.isArray(category.wines) && category.wines.length > 0 ? (
          <WineTable
            wines={category.wines}
            onDeleted={(deleted) =>
              setCategory((prev) => ({
                ...prev,
                wines: prev.wines.filter((w) => w.slug !== deleted.slug),
              }))
            }
          />
        ) : (
          <p className="wine-management__empty-state">
            No wines in this category yet.
          </p>
        )}
      </section>

      <section className="detail-card" style={{ padding: "1rem 1.5rem" }}>
        <h2>Reviews</h2>
        {Array.isArray(category.reviews) && category.reviews.length > 0 ? (
          <table className="grapes-table producers-table">
            <thead>
              <tr>
                <th>Score</th>
                <th>Wine</th>
                <th>Vintage</th>
                <th>Reviewer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {category.reviews.map((review, index) => (
                <tr
                  key={review.id}
                  className={
                    index % 2 === 0 ? "grapes-row--even" : "grapes-row--odd"
                  }
                  onClick={() => navigate(`/reviews/${review.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <strong>{review.score ?? "—"}</strong>
                  </td>
                  <td>
                    {review.wine_slug ? (
                      <Link
                        to={`/wines/${review.wine_slug}`}
                        className="grapes-table__link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {review.wine_name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {review.vintage_year ?? "—"}
                  </td>
                  <td>{review.reviewer_name || "—"}</td>
                  <td>{review.status || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="wine-management__empty-state">
            No reviews in this category yet.
          </p>
        )}
      </section>

      <section className="detail-card" style={{ padding: "1rem 1.5rem" }}>
        <h2>Articles</h2>
        {Array.isArray(category.articles) && category.articles.length > 0 ? (
          <table className="grapes-table producers-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Published</th>
              </tr>
            </thead>
            <tbody>
              {category.articles.map((article, index) => (
                <tr
                  key={article.id}
                  className={
                    index % 2 === 0 ? "grapes-row--even" : "grapes-row--odd"
                  }
                  onClick={() => navigate(`/articles/${article.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <Link
                      to={`/articles/${article.id}`}
                      className="grapes-table__link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td>{article.author || "—"}</td>
                  <td>{article.status || "—"}</td>
                  <td>
                    {article.published_at
                      ? article.published_at.slice(0, 10)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="wine-management__empty-state">
            No articles in this category yet.
          </p>
        )}
      </section>
    </div>
  );
}

export default CategoryDetail;
