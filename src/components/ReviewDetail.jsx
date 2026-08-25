import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { reviewsApi } from "../services/api";
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

function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner =
    Boolean(user && review && Number(review.user_id) === Number(user.id));

  const loadReview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewsApi.show(id);
      setReview(data);
    } catch (err) {
      setError(err.message || "Failed to load review");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  async function handleDelete() {
    if (
      !window.confirm(
        "Delete this review? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      setDeleting(true);
      await reviewsApi.destroy(review.id);
      navigate("/reviews");
    } catch (err) {
      setError(err.message || "Failed to delete review");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="wine-app">
        <p className="wine-management__loading">Loading review…</p>
      </main>
    );
  }

  if (error || !review) {
    return (
      <main className="wine-app">
        <p className="wine-management__error">{error || "Review not found."}</p>
        <Link to="/reviews" className="auth-form__submit">
          Back to Reviews
        </Link>
      </main>
    );
  }

  return (
    <main className="wine-app">
      <Link to="/reviews" className="wine-detail__back">
        &larr; Back to Reviews
      </Link>

      {Array.isArray(review.images) && review.images.length > 0 && (
        <div className="wine-detail__images">
          {review.images.map((src, i) => (
            <img key={i} src={src} alt={`${review.title} ${i + 1}`} />
          ))}
        </div>
      )}

      {error && <p className="wine-management__error">{error}</p>}

      {isOwner && !editing && (
        <div className="review-form__actions">
          <button
            type="button"
            className="auth-form__submit"
            onClick={() => setEditing(true)}
          >
            Edit Review
          </button>
          <button
            type="button"
            className="review-form__cancel"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete Review"}
          </button>
        </div>
      )}

      {isOwner && editing && (
        <ReviewForm
          review={review}
          onSaved={() => {
            setEditing(false);
            loadReview();
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      <div className="wine-detail__header">
        <h1>{review.title || "Untitled review"}</h1>
        <span className="review-card__score">{review.score}</span>
      </div>

      <p className="review-card__comment">
        {[
          review.wine_name
            ? `${review.wine_name}${review.vintage_year ? ` ${review.vintage_year}` : ""}`
            : null,
          `by ${review.reviewer_name}`,
          review.published_at
            ? new Date(review.published_at).toLocaleDateString()
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        <span className={`review-card__status`}> {review.status}</span>
      </p>

      {review.comment && (
        <div className="wine-detail__section">
          <RichComment html={review.comment} />
        </div>
      )}
    </main>
  );
}

export default ReviewDetail;
