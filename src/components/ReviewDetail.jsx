import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { reviewsApi } from "../services/api";
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
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      <div className="wine-detail__header">
        <h1>{review.title || "Untitled review"}</h1>
        <span className="review-card__score">{review.score}</span>
      </div>

      <p className="review-card__comment">
        {[
          review.wine_name ? `${review.wine_name}${review.vintage_year ? ` ${review.vintage_year}` : ""}` : null,
          `by ${review.reviewer_name}`,
          review.published_at
            ? new Date(review.published_at).toLocaleDateString()
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        <span className={`review-card__status`}> {review.status}</span>
      </p>

      {review.wine_slug && (
        <p>
          <Link to={`/wines/${review.wine_slug}`} className="my-reviews__wine-link">
            View the wine page &rarr;
          </Link>
        </p>
      )}

      {review.comment && (
        <div className="wine-detail__section">
          <RichComment html={review.comment} />
        </div>
      )}
    </main>
  );
}

export default ReviewDetail;