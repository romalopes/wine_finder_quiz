import { useState } from "react";
import { reviewsApi, imagesApi } from "../services/api";
import ImageManager from "./ImageManager";
import RichTextEditor from "./RichTextEditor";

function ReviewForm({ wineSlug, vintageId, review, onSaved, onCancel }) {
  const isEditing = Boolean(review);

  const [form, setForm] = useState(
    review
      ? {
          title: review.title || "",
          comment: review.comment || "",
          score: review.score ?? 80,
          status: review.status || "draft",
        }
      : {
          title: "",
          comment: "",
          score: 80,
          status: "draft",
        },
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState(null);
  const [existingImages, setExistingImages] = useState(review?.images || []);
  const [existingImageIds, setExistingImageIds] = useState(review?.image_ids || []);

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
        if (images && images.length > 0) {
          await imagesApi.upload("review", review.id, images);
        }
      } else {
        const saved = await reviewsApi.create(wineSlug, vintageId, payload);
        if (images && images.length > 0 && saved?.id) {
          await imagesApi.upload("review", saved.id, images);
        }
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
        <label htmlFor="review-title">Title</label>
        <input
          id="review-title"
          type="text"
          required
          value={form.title}
          onChange={updateField("title")}
          placeholder="Give your review a short title"
        />
      </div>

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
        <span className="image-manager__label">Comment</span>
        <RichTextEditor
          value={form.comment}
          onChange={(html) =>
            setForm((prev) => ({ ...prev, comment: html }))
          }
          placeholder="What did you think of this vintage?"
        />
      </div>

      <div className="review-form__field">
        <span className="image-manager__label">Images (click + to add, × to remove)</span>
        <ImageManager
          imageableType="review"
          images={existingImages}
          imageIds={existingImageIds}
          imageableId={isEditing ? review.id : null}
          onFilesChange={(files) => setImages(files)}
          onImagesChange={async () => {
            if (isEditing) {
              const reloaded = await reviewsApi.show(review.id);
              setExistingImages(reloaded.images || []);
              setExistingImageIds(reloaded.image_ids || []);
            }
          }}
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
