import { useState } from "react";
import { reviewsApi, imagesApi } from "../services/api";
import ImageManager from "./ImageManager";
import RichTextEditor from "./RichTextEditor";

function ReviewForm({ wineSlug, vintageId, vintageYear, review, onSaved, onCancel }) {
  const isEditing = Boolean(review);

  const [form, setForm] = useState(
    review
      ? {
          title: review.title || "",
          comment: review.comment || "",
          score: review.score ?? 80,
          status: review.status || "draft",
          drink_from: review.drink_from ?? "",
          drink_to: review.drink_to ?? "",
          drink_plus: Boolean(review.drink_plus),
        }
      : {
          title: "",
          comment: "",
          score: 80,
          status: "draft",
          drink_from: "",
          drink_to: "",
          drink_plus: false,
        },
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState(null);
  const [existingImages, setExistingImages] = useState(review?.images || []);
  const [existingImageIds, setExistingImageIds] = useState(review?.image_ids || []);

  function updateField(field) {
    return (e) => {
      let value;
      if (field === "drink_plus") {
        value = e.target.checked;
      } else if (
        field === "score" ||
        field === "drink_from" ||
        field === "drink_to"
      ) {
        value = e.target.value === "" ? "" : Number(e.target.value);
      } else {
        value = e.target.value;
      }
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
        drink_from: form.drink_from === "" ? null : Number(form.drink_from),
        drink_to: form.drink_to === "" ? null : Number(form.drink_to),
        drink_plus: Boolean(form.drink_plus),
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
        <label htmlFor="review-drink-from">Drink From</label>
        <div className="review-form__score-row">
          <input
            id="review-drink-from"
            type="number"
            min={vintageYear || 1900}
            value={form.drink_from}
            onChange={updateField("drink_from")}
            placeholder={vintageYear ? `e.g. ${vintageYear}` : "e.g. 2026"}
          />
        </div>
      </div>
      <div className="review-form__field">
        <label htmlFor="review-drink-to">Drink To</label>
        <div className="review-form__score-row">
          <input
            id="review-drink-to"
            type="number"
            min={form.drink_from === "" ? undefined : form.drink_from}
            value={form.drink_to}
            onChange={updateField("drink_to")}
            placeholder="e.g. 2035"
          />
        </div>
      </div>
      <div
        className="review-form__field"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <input
          id="review-drink-plus"
          type="checkbox"
          checked={form.drink_plus}
          onChange={updateField("drink_plus")}
        />
        <label htmlFor="review-drink-plus" style={{ margin: 0 }}>
          Drinking window can be extended (+)
        </label>
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
