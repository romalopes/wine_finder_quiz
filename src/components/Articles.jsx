import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { articlesApi } from "../services/api";
import ArticleForm from "./ArticleForm";
import { useAuth } from "../contexts/AuthContext";

function Articles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadArticles = useCallback(async () => {
    try {
      const data = await articlesApi.list();
      setArticles(Array.isArray(data) ? data : []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this article?")) return;
    try {
      await articlesApi.destroy(id);
      loadArticles();
    } catch (err) {
      alert(err.message || "Failed to delete article");
    }
  }

  async function togglePublish(article) {
    try {
      await articlesApi.update(article.id, {
        status: article.status === "draft" ? "published" : "draft",
      });
      loadArticles();
    } catch (err) {
      alert(err.message || "Failed to update article");
    }
  }

  return (
    <main className="wine-app">
      <div className="wine-management__header">
        <h1>Articles</h1>
        {user && (
          <button
            type="button"
            className="auth-form__submit"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? "Close" : "+ Add Article"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="review-form-wrapper">
          <ArticleForm
            onSaved={() => {
              setShowForm(false);
              loadArticles();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <p className="wine-management__loading">Loading articles…</p>
      ) : articles.length === 0 ? (
        <p className="wine-management__empty-state">
          No articles yet{user ? ". Write the first one!" : "."}
        </p>
      ) : (
        <div className="review-list">
          {articles.map((article) => (
            <div key={article.id} className="review-card">
              <div className="review-card__top">
                <Link to={`/articles/${article.id}`} className="my-reviews__wine-link">
                  {article.title}
                </Link>
                <span className="review-card__status">{article.status}</span>
                {article.published_at && (
                  <span className="review-card__time">
                    {new Date(article.published_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="review-card__comment">
                {[article.category, `by ${article.author_name}`].filter(Boolean).join(" · ")}
              </p>
              {Array.isArray(article.tags) && article.tags.length > 0 && (
                <p className="review-card__comment">Tags: {article.tags.join(", ")}</p>
              )}
              {article.abstract && (
                <p className="review-card__comment">{article.abstract}</p>
              )}

              {user?.id === article.user_id && (
                <div className="review-card__actions">
                  <Link to={`/articles/${article.id}/edit`} className="review-card__edit">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className={article.status === "draft" ? "review-card__publish" : "review-card__unpublish"}
                    onClick={() => togglePublish(article)}
                  >
                    {article.status === "draft" ? "Publish" : "Unpublish"}
                  </button>
                  <button
                    type="button"
                    className="review-card__delete"
                    onClick={() => handleDelete(article.id)}
                    title="Delete article"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Articles;