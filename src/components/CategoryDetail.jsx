import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { categoriesApi, winesApi, reviewsApi, articlesApi } from "../services/api";
import WineTable from "./WineTable";
import Pagination from "./Pagination";
import usePagedList from "../hooks/usePagedList";

function CategoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Three independent paginated lists — paging one does not disturb the others.
  const wines = usePagedList({
    fetcher: (params) => winesApi.list({ ...params, category_id: category?.id }),
    enabled: Boolean(category?.id),
  });
  const reviews = usePagedList({
    fetcher: (params) => reviewsApi.all({ ...params, category_id: category?.id }),
    enabled: Boolean(category?.id),
  });
  const articles = usePagedList({
    fetcher: (params) => articlesApi.list({ ...params, category_id: category?.id }),
    enabled: Boolean(category?.id),
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCategory(null);
    categoriesApi
      .show(slug)
      .then(setCategory)
      .catch((err) => setError(err.message || "Failed to load category"))
      .finally(() => setLoading(false));
  }, [slug]);

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
        <h2>
          Wines{!wines.loading && ` (${wines.totalCount})`}
        </h2>
        {wines.loading ? (
          <p className="wine-management__loading">Loading wines…</p>
        ) : wines.items.length > 0 ? (
          <>
            <WineTable
              wines={wines.items}
              onDeleted={() => wines.reload()}
              linkContext={{ type: "category", id: category?.id, name: category.name }}
              onWineLinked={() => wines.reload()}
            />
            <Pagination
              page={wines.page}
              totalPages={wines.totalPages}
              totalCount={wines.totalCount}
              onPageChange={wines.setPage}
            />
          </>
        ) : (
          <p className="wine-management__empty-state">
            No wines in this category yet.
          </p>
        )}

      <section className="detail-card" style={{ padding: "1rem 1.5rem" }}>
        <h2>
          Reviews{!reviews.loading && ` (${reviews.totalCount})`}
        </h2>
        {reviews.loading ? (
          <p className="wine-management__loading">Loading reviews…</p>
        ) : reviews.items.length > 0 ? (
          <>
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
                {reviews.items.map((review, index) => (
                  <tr
                    key={review.id}
                    className={
                      index % 2 === 0 ? "grapes-row--even" : "grapes-row--odd"
                    }
                    onClick={() => navigate(`/reviews/${review.slug}`)}
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
                    <td>{review.vintage_year ?? "—"}</td>
                    <td>{review.reviewer_name || "—"}</td>
                    <td>{review.status || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={reviews.page}
              totalPages={reviews.totalPages}
              totalCount={reviews.totalCount}
              onPageChange={reviews.setPage}
            />
          </>
        ) : (
          <p className="wine-management__empty-state">
            No reviews in this category yet.
          </p>
        )}
      </section>
      </section>

      <section className="detail-card" style={{ padding: "1rem 1.5rem" }}>
        <h2>
          Articles{!articles.loading && ` (${articles.totalCount})`}
        </h2>
        {articles.loading ? (
          <p className="wine-management__loading">Loading articles…</p>
        ) : articles.items.length > 0 ? (
          <>
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
                {articles.items.map((article, index) => (
                  <tr
                    key={article.id}
                    className={
                      index % 2 === 0 ? "grapes-row--even" : "grapes-row--odd"
                    }
                    onClick={() => navigate(`/articles/${article.slug}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <Link
                        to={`/articles/${article.slug}`}
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
            <Pagination
              page={articles.page}
              totalPages={articles.totalPages}
              totalCount={articles.totalCount}
              onPageChange={articles.setPage}
            />
          </>
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