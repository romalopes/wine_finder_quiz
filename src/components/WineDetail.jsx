import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { winesApi, reviewsApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import ReviewForm from "./ReviewForm";

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return `${m} minute${m !== 1 ? "s" : ""} ago`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return `${h} hour${h !== 1 ? "s" : ""} ago`;
  }
  if (diffSec < 2592000) {
    const d = Math.floor(diffSec / 86400);
    return `${d} day${d !== 1 ? "s" : ""} ago`;
  }
  const m = Math.floor(diffSec / 2592000);
  return `${m} month${m !== 1 ? "s" : ""} ago`;
}

function WineDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wine, setWine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsByVintage, setReviewsByVintage] = useState({});
  const [loadingReviews, setLoadingReviews] = useState({});
  const [activeFormVintage, setActiveFormVintage] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  const loadWine = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await winesApi.show(slug);
      setWine(data);
    } catch (err) {
      setError(err.message || "Failed to load wine");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadWine();
  }, [loadWine]);

  async function loadReviews(vintageId) {
    setLoadingReviews((prev) => ({ ...prev, [vintageId]: true }));
    try {
      const data = await reviewsApi.list(slug, vintageId);
      setReviewsByVintage((prev) => ({ ...prev, [vintageId]: data }));
    } catch {
      // silently fail
    } finally {
      setLoadingReviews((prev) => ({ ...prev, [vintageId]: false }));
    }
  }

  function handleToggleReviews(vintageId) {
    if (reviewsByVintage[vintageId]) {
      setReviewsByVintage((prev) => {
        const next = { ...prev };
        delete next[vintageId];
        return next;
      });
    } else {
      loadReviews(vintageId);
    }
  }

  function handleReviewSaved(vintageId) {
    setActiveFormVintage(null);
    setEditingReview(null);
    loadReviews(vintageId);
  }

  async function handleDeleteReview(reviewId, vintageId) {
    if (!window.confirm("Delete this review?")) return;
    try {
      await reviewsApi.destroy(reviewId);
      loadReviews(vintageId);
    } catch (err) {
      alert(err.message || "Failed to delete review");
    }
  }

  if (loading) {
    return (
      <div className="wine-app">
        <p className="wine-management__loading">Loading wine details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wine-app">
        <p className="wine-management__error">{error}</p>
        <Link to="/wines" className="auth-form__submit">
          Back to Wines
        </Link>
      </div>
    );
  }

  if (!wine) return null;

  return (
    <div className="wine-app">
      <Link to="/wines" className="wine-detail__back">
        &larr; Back to Wines
      </Link>

      <div className="wine-detail__header">
        <div>
          <p className="wine-kicker">{wine.region}</p>
          <h1>{wine.name}</h1>
        </div>
        <span
          className={`wine-management__color-badge wine-management__color-badge--${wine.color}`}
        >
          {wine.color}
        </span>
      </div>

      {wine.prompt && <p className="wine-detail__prompt">{wine.prompt}</p>}

      <div className="wine-detail__specs">
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Closure</span>
          <span className="wine-detail__spec-value">{wine.closure || "—"}</span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Color</span>
          <span className="wine-detail__spec-value">{wine.color || "—"}</span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Alcohol</span>
          <span className="wine-detail__spec-value">
            {wine.alcohol_percentage != null
              ? `${wine.alcohol_percentage}%`
              : "—"}
          </span>
        </div>
        <div className="wine-detail__spec">
          <span className="wine-detail__spec-label">Volume</span>
          <span className="wine-detail__spec-value">
            {wine.volume_ml != null ? `${wine.volume_ml}ml` : "—"}
          </span>
        </div>
      </div>

      <div className="wine-detail__actions">
        <Link to={`/wines/${wine.slug}/edit`} className="auth-form__submit">
          Edit Wine
        </Link>
        <button
          className="wine-management__delete-btn"
          onClick={async () => {
            if (
              !window.confirm(
                `Delete "${wine.name}"? This action cannot be undone.`,
              )
            ) {
              return;
            }
            try {
              await winesApi.destroy(wine.slug);
              navigate("/wines", { replace: true });
            } catch (err) {
              alert(err.message || "Failed to delete wine");
            }
          }}
        >
          Delete Wine
        </button>
      </div>

      <div className="wine-detail__section">
        <h2>Vintages</h2>
        {wine.vintages && wine.vintages.length > 0 ? (
          <div className="wine-detail__vintages">
            {wine.vintages.map((vintage) => (
              <div key={vintage.id} className="wine-detail__vintage">
                <div className="wine-detail__vintage-header">
                  <strong>{vintage.year}</strong>
                  <button
                    type="button"
                    className="review-toggle-btn"
                    onClick={() => handleToggleReviews(vintage.id)}
                  >
                    {reviewsByVintage[vintage.id] ? "Hide reviews" : "Reviews"}
                  </button>
                </div>

                {vintage.prompt && <p>{vintage.prompt}</p>}

                {/* Reviews */}
                {loadingReviews[vintage.id] && (
                  <p className="review-loading">Loading reviews…</p>
                )}

                {reviewsByVintage[vintage.id] &&
                  reviewsByVintage[vintage.id].length === 0 && (
                    <p className="review-empty">
                      No reviews yet. Be the first!
                    </p>
                  )}

                {reviewsByVintage[vintage.id] &&
                  reviewsByVintage[vintage.id].length > 0 && (
                    <div className="review-list">
                      {reviewsByVintage[vintage.id].map((review) => (
                        <div
                          key={review.id}
                          className={`review-card ${review.status === "draft" ? "review-card--draft" : ""}`}
                        >
                          <div className="review-card__top">
                            <span className="review-card__score">
                              {review.score}
                            </span>
                            <span className="review-card__status">
                              {review.status}
                            </span>
                            {review.published_at && (
                              <span className="review-card__time">
                                {timeAgo(review.published_at)}
                              </span>
                            )}
                          </div>
                          {review.comment && (
                            <p className="review-card__comment">
                              {review.comment}
                            </p>
                          )}
                          <div className="review-card__meta">
                            <span className="review-card__reviewer">
                              {review.reviewer_name}
                            </span>
                          </div>
                          {user && user.id === review.user_id && (
                            <div className="review-card__actions">
                              <button
                                type="button"
                                className="review-card__edit"
                                onClick={() => {
                                  setActiveFormVintage(null);
                                  setEditingReview({
                                    ...review,
                                    vintageId: vintage.id,
                                  });
                                }}
                              >
                                Edit
                              </button>
                              {review.status === "draft" ? (
                                <button
                                  type="button"
                                  className="review-card__publish"
                                  onClick={async () => {
                                    try {
                                      await reviewsApi.update(review.id, {
                                        status: "published",
                                        published_at: new Date().toISOString(),
                                      });
                                      loadReviews(vintage.id);
                                    } catch (err) {
                                      alert(
                                        err.message ||
                                          "Failed to publish review",
                                      );
                                    }
                                  }}
                                >
                                  Publish
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="review-card__unpublish"
                                  onClick={async () => {
                                    try {
                                      await reviewsApi.update(review.id, {
                                        status: "draft",
                                      });
                                      loadReviews(vintage.id);
                                    } catch (err) {
                                      alert(
                                        err.message ||
                                          "Failed to unpublish review",
                                      );
                                    }
                                  }}
                                >
                                  Unpublish
                                </button>
                              )}
                              <button
                                type="button"
                                className="review-card__delete"
                                onClick={() =>
                                  handleDeleteReview(review.id, vintage.id)
                                }
                                title="Delete review"
                              >
                                &times;
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Edit Review form */}
                {editingReview && editingReview.vintageId === vintage.id && (
                  <div className="review-form-wrapper">
                    <ReviewForm
                      wineSlug={slug}
                      vintageId={vintage.id}
                      review={editingReview}
                      onSaved={() => handleReviewSaved(vintage.id)}
                      onCancel={() => setEditingReview(null)}
                    />
                  </div>
                )}

                {/* Add Review button / form */}
                {user && (
                  <div className="review-form-wrapper">
                    {activeFormVintage === vintage.id ? (
                      <ReviewForm
                        wineSlug={slug}
                        vintageId={vintage.id}
                        onSaved={() => handleReviewSaved(vintage.id)}
                        onCancel={() => setActiveFormVintage(null)}
                      />
                    ) : (
                      <button
                        type="button"
                        className="review-add-btn"
                        onClick={() => {
                          setEditingReview(null);
                          setActiveFormVintage(vintage.id);
                        }}
                      >
                        + Add Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="wine-management__empty-state">
            No vintages recorded yet.
          </p>
        )}
      </div>

      {wine.parameters && Object.keys(wine.parameters).length > 0 && (
        <div className="wine-detail__section">
          <h2>Taste Parameters</h2>
          <div className="wine-detail__params">
            {Object.entries(wine.parameters).map(([key, score]) => (
              <div key={key} className="wine-detail__param">
                <span className="wine-detail__param-label">{key}</span>
                <div className="wine-meter">
                  <span style={{ width: `${(score / 5) * 100}%` }} />
                </div>
                <span className="wine-detail__param-score">{score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WineDetail;
