import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reviewsApi } from "../services/api";
import ReviewForm from "./ReviewForm";
import { useAuth } from "../contexts/AuthContext";

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadReviews() {
    try {
      const data = await reviewsApi.myReviews();
      setReviews(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleDelete(reviewId) {
    if (!window.confirm("Delete this review?")) return;
    try {
      await reviewsApi.destroy(reviewId);
      loadReviews();
    } catch (err) {
      alert(err.message || "Failed to delete review");
    }
  }

  if (loading) {
    return (
      <main className="wine-app">
        <p className="wine-management__loading">Loading your reviews…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="wine-app">
        <p className="wine-management__loading">
          Sign in to view your reviews.
        </p>
      </main>
    );
  }

  const filtered =
    statusFilter === "all"
      ? reviews
      : reviews.filter((r) => r.status === statusFilter);

  return (
    <main className="wine-app">
      <div className="wine-management__header">
        <h1>My Reviews</h1>
      </div>

      {reviews.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["all", "draft", "published"].map((filter) => (
            <button
              key={filter}
              type="button"
              className={`wine-segmented button ${statusFilter === filter ? "active" : ""}`}
              style={{
                border: "1px solid #d7c8bb",
                borderRadius: "999px",
                padding: "8px 14px",
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
                background: statusFilter === filter ? "#27615e" : "#fff",
                color: statusFilter === filter ? "#f7fff9" : "#4f4440",
                borderColor: statusFilter === filter ? "#27615e" : "#d7c8bb",
              }}
              onClick={() => setStatusFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="wine-management__empty-state">
          You haven't written any reviews yet.
        </p>
      ) : filtered.length === 0 ? (
        <p className="wine-management__empty-state">
          No {statusFilter} reviews found.
        </p>
      ) : (
        <div className="my-reviews-list">
          {filtered.map((review) => (
            <div
              key={review.id}
              className={`review-card ${review.status === "draft" ? "review-card--draft" : ""}`}
            >
              <div className="review-card__top">
                <Link
                  to={`/wines/${review.wine_slug}`}
                  className="my-reviews__wine-link"
                >
                  {review.wine_name} ({review.vintage_year})
                </Link>
                <span className="review-card__score">{review.score}</span>
                <span className="review-card__status">{review.status}</span>
                {review.published_at && (
                  <span className="review-card__time">
                    {timeAgo(review.published_at)}
                  </span>
                )}
              </div>
              {review.comment && (
                <p className="review-card__comment">{review.comment}</p>
              )}

              <div className="review-card__actions">
                <button
                  type="button"
                  className="review-card__edit"
                  onClick={() => setEditingReview(review)}
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
                        loadReviews();
                      } catch (err) {
                        alert(err.message || "Failed to publish");
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
                        loadReviews();
                      } catch (err) {
                        alert(err.message || "Failed to unpublish");
                      }
                    }}
                  >
                    Unpublish
                  </button>
                )}
                <button
                  type="button"
                  className="review-card__delete"
                  onClick={() => handleDelete(review.id)}
                  title="Delete review"
                >
                  &times;
                </button>
              </div>

              {editingReview && editingReview.id === review.id && (
                <div className="review-form-wrapper" style={{ marginTop: 12 }}>
                  <ReviewForm
                    wineSlug={review.wine_slug}
                    vintageId={review.vintage_id}
                    review={editingReview}
                    onSaved={() => {
                      setEditingReview(null);
                      loadReviews();
                    }}
                    onCancel={() => setEditingReview(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyReviews;
