import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reviewsApi, winesApi } from "../services/api";
import ReviewForm from "./ReviewForm";
import { useAuth } from "../contexts/AuthContext";
import DOMPurify from "dompurify";

function RichComment({ html }) {
  return (
    <div
      className="review-card__comment"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}

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

function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [wines, setWines] = useState([]);
  const [selectedWineSlug, setSelectedWineSlug] = useState("");
  const [selectedVintageId, setSelectedVintageId] = useState("");

  async function loadReviews() {
    try {
      const data = await reviewsApi.all();
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  // Load wines (with vintages) when the Add Review panel is opened.
  useEffect(() => {
    if (showForm && wines.length === 0) {
      winesApi
        .list()
        .then((data) => setWines(Array.isArray(data) ? data : []))
        .catch(() => setWines([]));
    }
  }, [showForm, wines.length]);

  const selectedWine = wines.find((w) => w.slug === selectedWineSlug);

  function handleWineChange(e) {
    setSelectedWineSlug(e.target.value);
    setSelectedVintageId("");
  }

  function closeForm() {
    setShowForm(false);
    setSelectedWineSlug("");
    setSelectedVintageId("");
  }

  return (
    <main className="wine-app">
      <div className="wine-management__header">
        <h1>Reviews</h1>
        {user && (
          <button
            type="button"
            className="auth-form__submit"
            onClick={() => (showForm ? closeForm() : setShowForm(true))}
          >
            + Add Review
          </button>
        )}
      </div>

      {!user && (
        <p className="wine-management__empty-state">
          Sign in to write a review or see your own drafts.
        </p>
      )}

      {showForm && (
        <div className="review-form-wrapper">
          {selectedVintageId ? (
            <ReviewForm
              wineSlug={selectedWineSlug}
              vintageId={Number(selectedVintageId)}
              onSaved={() => {
                closeForm();
                loadReviews();
              }}
              onCancel={closeForm}
            />
          ) : (
            <div className="review-form">
              <div className="review-form__field">
                <label htmlFor="add-review-wine">Wine</label>
                <select
                  id="add-review-wine"
                  value={selectedWineSlug}
                  onChange={handleWineChange}
                >
                  <option value="">Select a wine…</option>
                  {wines.map((wine) => (
                    <option key={wine.slug} value={wine.slug}>
                      {wine.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="review-form__field">
                <label htmlFor="add-review-vintage">Vintage</label>
                <select
                  id="add-review-vintage"
                  value={selectedVintageId}
                  onChange={(e) => setSelectedVintageId(e.target.value)}
                  disabled={!selectedWine}
                >
                  <option value="">
                    {selectedWine ? "Select a vintage…" : "Choose a wine first"}
                  </option>
                  {(selectedWine?.vintages || []).map((vintage) => (
                    <option key={vintage.id} value={vintage.id}>
                      {vintage.year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="wine-management__loading">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="wine-management__empty-state">
          No reviews yet. Be the first!
        </p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`review-card ${review.status === "draft" ? "review-card--draft" : ""}`}
            >
              <div className="review-card__top">
                <h3 className="review-card__title">
                  <Link to={`/reviews/${review.id}`}>{review.title || "Untitled review"}</Link>
                </h3>
                <span className="review-card__score">{review.score}</span>
                <span className="review-card__status">{review.status}</span>
                {review.published_at && (
                  <span className="review-card__time">
                    {timeAgo(review.published_at)}
                  </span>
                )}
              </div>
              {(review.wine_name || review.vintage_year) && (
                <p className="review-card__comment">
                  <Link
                    to={review.wine_slug ? `/wines/${review.wine_slug}` : "#"}
                    className="my-reviews__wine-link"
                  >
                    {review.wine_name || "Unknown wine"}
                    {review.vintage_year ? ` (${review.vintage_year})` : ""}
                  </Link>
                </p>
              )}
              {review.reviewer_name && (
                <p className="review-card__comment">
                  by {review.reviewer_name}
                </p>
              )}
              {review.comment && <RichComment html={review.comment} />}
              {(Array.isArray(review.images) && review.images.length > 0
                ? review.images[0]
                : review.wine_image) && (
                <img
                  src={
                    Array.isArray(review.images) && review.images.length > 0
                      ? review.images[0]
                      : review.wine_image
                  }
                  alt={review.title || review.wine_name || "review"}
                  className="wine-management__thumb"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Reviews;