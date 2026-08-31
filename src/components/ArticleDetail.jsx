import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { articlesApi } from "../services/api";
import ArticleForm from "./ArticleForm";
import DOMPurify from "dompurify";
import { useAuth } from "../contexts/AuthContext";

function RichBody({ html }) {
  return (
    <div
      className="article-detail__body"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}

function ArticleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const loadArticle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await articlesApi.show(id);
      setArticle(data);
    } catch (err) {
      setError(err.message || "Failed to load article");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  async function togglePublish() {
    try {
      await articlesApi.update(article.id, {
        status: article.status === "draft" ? "published" : "draft",
      });
      loadArticle();
    } catch (err) {
      alert(err.message || "Failed to update article");
    }
  }

  if (loading) {
    return (
      <main className="wine-app">
        <p className="wine-management__loading">Loading article…</p>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="wine-app">
        <p className="wine-management__error">{error || "Article not found."}</p>
        <Link to="/articles" className="auth-form__submit">
          Back to Articles
        </Link>
      </main>
    );
  }

  const isAuthor = user?.id === article.user_id;
  // Reviews shown under the article: link must be published AND review published.
  const visibleReviews = (article.reviews || []).filter(
    (r) => r.link_status === "published" && r.status === "published",
  );

  return (
    <main className="wine-app">
      <Link to="/articles" className="wine-detail__back">
        &larr; Back to Articles
      </Link>

      {Array.isArray(article.images) && article.images.length > 0 && (
        <div className="wine-detail__images">
          {article.images.map((src, i) => (
            <img key={i} src={src} alt={`${article.title} ${i + 1}`} />
          ))}
        </div>
      )}

      <div className="wine-detail__header">
        <div>
          <h1>{article.title}</h1>
        </div>
        <span className={`review-card__status ${article.status === "draft" ? "" : ""}`}>
          {article.status}
        </span>
      </div>

      <p className="review-card__comment">
        {article.category && article.category_id ? (
          <>
            <Link to={`/categories/${article.category_id}`}>
              {article.category}
            </Link>{" "}
            ·{" "}
          </>
        ) : article.category ? (
          <>{article.category} · </>
        ) : null}
        {`by ${article.author_name}`}
        {article.published_at
          ? ` · ${new Date(article.published_at).toLocaleDateString()}`
          : ""}
        {article.tags?.length > 0 ? ` — ${article.tags.join(", ")}` : ""}
      </p>

      {isAuthor && (
        <div className="wine-detail__actions">
          {!editing && (
            <>
              <button type="button" className="auth-form__submit" onClick={() => setEditing(true)}>
                Edit Article
              </button>
              <button type="button" className="review-card__publish" onClick={togglePublish}>
                {article.status === "draft" ? "Publish" : "Unpublish"}
              </button>
            </>
          )}
        </div>
      )}

      {editing ? (
        <div className="review-form-wrapper">
          <ArticleForm
            article={article}
            onSaved={() => {
              setEditing(false);
              loadArticle();
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <>
          {article.abstract && (
            <p className="wine-detail__prompt">{article.abstract}</p>
          )}
          {article.body && (
            <div className="wine-detail__section">
              <RichBody html={article.body} />
            </div>
          )}
        </>
      )}

      {visibleReviews.length > 0 && (
        <div className="wine-detail__section">
          <h2>Reviews</h2>
          <div className="review-list">
            {visibleReviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-card__top">
                  <span>{review.title}</span>
                  <span className="review-card__score">{review.score}</span>
                </div>
                <p className="review-card__comment">by {review.reviewer_name}</p>
                {review.comment && <RichBody html={review.comment} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {(article.vintages?.length > 0 || article.producers?.length > 0) && (
        <div className="wine-detail__section">
          {article.vintages?.length > 0 && (
            <>
              <h2>Wines &amp; vintages</h2>
              <ul>
                {article.vintages.map((vintage) => (
                  <li key={vintage.id}>
                    <Link to={`/wines/${vintage.wine_slug}`}>
                      {vintage.wine_name} {vintage.year}
                    </Link>
                    {vintage.region ? ` — ${vintage.region}` : ""}
                  </li>
                ))}
              </ul>
            </>
          )}
          {article.producers?.length > 0 && (
            <>
              <h2>Producers</h2>
              <ul>
                {article.producers.map((producer) => (
                  <li key={producer.id}>
                    <Link to={`/producers/${producer.slug}`}>{producer.name}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </main>
  );
}

export default ArticleDetail;