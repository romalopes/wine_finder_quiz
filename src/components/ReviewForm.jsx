import { useState } from "react";
import { reviewsApi } from "../services/api";

function ReviewForm({ wineSlug, vintageId, review, onSaved, onCancel }) {
  const isEditing = Boolean(review);

  const [form, setForm] = useState(
    review
      ? {
          comment: review.comment || "",
          score: review.score ?? 80,
          status: review.status || "draft",
        }
      : {
          comment: "",
          score: 80,
          status: "draft",
        },
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function updateField(field) {
    return (e) => {
      const value = field === "score" ? Number(e.target.value) : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...form,
        published_at:
          form.status === "published" ? new Date().toISOString() : null,
      };

      if (isEditing) {
        await reviewsApi.update(review.id, payload);
      } else {
        await reviewsApi.create(wineSlug, vintageId, payload);
      }

      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form__field">
        <label htmlFor="review-score">Score</label>
        <div className="review-form__score-row">
          <input
            id="review-score"
            type="range"
            min={0}
            max={100}
            step={1}
            value={form.score}
            onChange={updateField("score")}
          />
          <output className="review-form__score-value">{form.score}</output>
        </div>
      </div>

      <div className="review-form__field">
        <label htmlFor="review-comment">Comment</label>
        <textarea
          id="review-comment"
          rows={3}
          value={form.comment}
          onChange={updateField("comment")}
          placeholder="What did you think of this vintage?"
        />
      </div>

      <div className="review-form__status-row">
        <button
          type="button"
          className={`review-form__status-btn ${form.status === "draft" ? "review-form__status-btn--active" : ""}`}
          onClick={() => setForm((prev) => ({ ...prev, status: "draft" }))}
        >
          Save as Draft
        </button>
        <button
          type="button"
          className={`review-form__status-btn ${form.status === "published" ? "review-form__status-btn--active" : ""}`}
          onClick={() => setForm((prev) => ({ ...prev, status: "published" }))}
        >
          Publish
        </button>
      </div>

      {error && <p className="review-form__error">{error}</p>}

      <div className="review-form__actions">
        <button
          className="auth-form__submit"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : isEditing
              ? "Update Review"
              : "Submit Review"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="review-form__cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ReviewForm;
