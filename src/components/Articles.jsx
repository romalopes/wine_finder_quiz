import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { articlesApi } from "../services/api";
import ArticleForm from "./ArticleForm";
import { useAuth } from "../contexts/AuthContext";
import { isSuperUser, canManageWinesRole } from "../constants/roles";

function excerpt(text, max = 50) {
  if (!text) return "";
  // Strip HTML tags for a plain-text excerpt
  const stripped = text.replace(/<[^>]+>/g, "").trim();
  if (stripped.length <= max) return stripped;
  return stripped.slice(0, max) + "…";
}

function Articles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canSeeAll = isSuperUser(user);
  // Super Users, Editors and Reviewers see the management filters and the
  // add button; Guests/Readers only see published articles.
  const canManageContent = canManageWinesRole(user);
  const [articles, setArticles] = useState([]);
  const [myArticles, setMyArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [scope, setScope] = useState("all"); // "all" | "mine"
  const [statusFilter, setStatusFilter] = useState("all");

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

  const loadMyArticles = useCallback(async () => {
    try {
      const data = await articlesApi.myArticles();
      setMyArticles(Array.isArray(data) ? data : []);
    } catch {
      setMyArticles([]);
    }
  }, []);

  useEffect(() => {
    loadArticles();
    if (user) loadMyArticles();
    else setMyArticles([]);
  }, [user, loadArticles, loadMyArticles]);

  function canManage(article) {
    return Boolean(
      user && (canSeeAll || Number(article.user_id) === Number(user.id)),
    );
  }

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
        {canManageContent && (
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

      {!showForm &&
        (loading ? (
          <p className="wine-management__loading">Loading articles…</p>
        ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {(!canManageContent ? [] : [
            { key: "all", label: "All Articles" },
            ...(user ? [{ key: "mine", label: "My Articles" }] : []),
          ]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              style={{
                border: "1px solid #d7c8bb",
                borderRadius: "999px",
                padding: "8px 14px",
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
                background: scope === key ? "#27615e" : "#fff",
                color: scope === key ? "#f7fff9" : "#4f4440",
                borderColor: scope === key ? "#27615e" : "#d7c8bb",
              }}
              onClick={() => setScope(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {canManageContent && (
          <>
          {/* Status filter: All / Draft / Published */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["all", "draft", "published"].map((filter) => (
              <button
                key={filter}
                type="button"
                style={{
                  border: "1px solid #d7c8bb",
                  borderRadius: "999px",
                  padding: "6px 12px",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  background: statusFilter === filter ? "#8a273c" : "#fff",
                  color: statusFilter === filter ? "#fff8f2" : "#4f4440",
                  borderColor: statusFilter === filter ? "#8a273c" : "#d7c8bb",
                }}
                onClick={() => setStatusFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          </>
        )}

          {(() => {
            // Guests/Readers only ever see published articles.
            const effectiveScope = canManageContent ? scope : "all";
            const effectiveStatus = canManageContent
              ? statusFilter
              : "published";
            const source =
              effectiveScope === "mine" ? myArticles : articles;
            const filtered =
              effectiveStatus === "all"
                ? source
                : source.filter((a) => a.status === effectiveStatus);

            if (effectiveScope === "mine" && !user) {
              return (
                <p className="wine-management__empty-state">
                  Sign in to see your articles.
                </p>
              );
            }
            if (filtered.length === 0) {
              return (
                <p className="wine-management__empty-state">
                  {source.length === 0
                    ? scope === "mine"
                      ? "You haven't written any articles yet."
                      : "No articles yet. Write the first one!"
                    : `No ${statusFilter} articles.`}
                </p>
              );
            }
            // Group by category
            const grouped = filtered.reduce((acc, article) => {
              const key = article.category || "Uncategorized";
              if (!acc[key]) acc[key] = [];
              acc[key].push(article);
              return acc;
            }, {});

            return (
              <div className="content-grid-groups">
                {Object.entries(grouped).map(([category, articlesInGroup]) => (
                  <section key={category} className="content-grid-group">
                    <h2 className="content-grid-group__title">{category}</h2>
                    <div className="content-grid">
                      {articlesInGroup.map((article) => (
                        <div key={article.id} className="review-card" style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/articles/${article.id}`)}>
                          {Array.isArray(article.images) && article.images.length > 0 && (
                            <img
                              src={article.images[0]}
                              alt={article.title}
                              className="wine-management__thumb"
                            />
                          )}
                          <div className="review-card__top">
                            <span className="my-reviews__wine-link">{article.title}</span>
                            {canManageContent && (
                              <span className="review-card__status">{article.status}</span>
                            )}
                            {canManageContent && article.published_at && (
                              <span className="review-card__time">
                                {new Date(article.published_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="review-card__comment">
                            {[`by ${article.author_name}`].filter(Boolean).join(" · ")}
                          </p>
                          {Array.isArray(article.tags) && article.tags.length > 0 && (
                            <p className="review-card__comment">Tags: {article.tags.join(", ")}</p>
                          )}
                          {excerpt(article.body, 50) && (
                            <p className="review-card__comment">{excerpt(article.body, 50)}</p>
                          )}

                          {canManage(article) && (
                            <div className="review-card__actions" onClick={(e) => e.stopPropagation()}>
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
                  </section>
                ))}
              </div>
            );
          })()}
        </>
        )
      )}
    </main>
  );
}

export default Articles;