import { useEffect, useState } from "react";
import { articlesApi, categoriesApi, winesApi, producersApi } from "../services/api";
import ImageManager from "./ImageManager";

function ArticleForm({ article, onSaved, onCancel }) {
  const isEditing = Boolean(article);

  const [form, setForm] = useState({
    title: article?.title || "",
    abstract: article?.abstract || "",
    body: article?.body || "",
    category_id: article?.category_id || "",
    tag_names: (article?.tags || []).join(", "),
    wine_ids: article?.wines?.map((w) => w.id) || [],
    producer_ids: article?.producers?.map((p) => p.id) || [],
    status: article?.status || "draft",
  });
  const [categories, setCategories] = useState([]);
  const [wines, setWines] = useState([]);
  const [producers, setProducers] = useState([]);
  const [images, setImages] = useState(null);
  const [existingImages, setExistingImages] = useState(article?.images || []);
  const [existingImageIds, setExistingImageIds] = useState(article?.image_ids || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
    winesApi.list().then((data) => setWines(Array.isArray(data) ? data : [])).catch(() => {});
    producersApi.list().then((data) => setProducers(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  function updateField(field) {
    return (e) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function save(payload) {
    if (isEditing) {
      return articlesApi.update(article.id, payload);
    }
    return articlesApi.create(payload);
  }

  function buildPayload() {
    return {
      title: form.title,
      abstract: form.abstract,
      body: form.body,
      status: form.status,
      category_id: form.category_id || null,
      tag_names: form.tag_names,
      wine_ids: form.wine_ids,
      producer_ids: form.producer_ids,
    };
  }

  function buildFormData() {
    const formData = new FormData();
    formData.append("article[title]", form.title);
    formData.append("article[abstract]", form.abstract);
    formData.append("article[body]", form.body);
    formData.append("article[status]", form.status);
    if (form.category_id) formData.append("article[category_id]", form.category_id);
    formData.append("article[tag_names]", form.tag_names);
    if (form.wine_ids.length > 0) {
      form.wine_ids.forEach((id) => formData.append("article[wine_ids][]", id));
    }
    if (form.producer_ids.length > 0) {
      form.producer_ids.forEach((id) => formData.append("article[producer_ids][]", id));
    }
    Array.from(images).forEach((file) => formData.append("article[images][]", file));
    return formData;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // When new images are chosen, send multipart so Rails can attach them.
      const payload = images && images.length > 0 ? buildFormData() : buildPayload();
      await save(payload);
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save article");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form__field">
        <label htmlFor="article-title">Title</label>
        <input
          id="article-title"
          type="text"
          required
          value={form.title}
          onChange={updateField("title")}
          placeholder="Article title"
        />
      </div>

      <div className="review-form__field">
        <label htmlFor="article-abstract">Abstract</label>
        <textarea
          id="article-abstract"
          rows={3}
          value={form.abstract}
          onChange={updateField("abstract")}
          placeholder="A short summary shown in listings"
        />
      </div>

      <div className="review-form__field">
        <label htmlFor="article-body">Body</label>
        <textarea
          id="article-body"
          rows={12}
          value={form.body}
          onChange={updateField("body")}
          placeholder={"<p>Write your story…</p>"}
        />
      </div>

      <div className="review-form__field">
        <label htmlFor="article-category">Category</label>
        <select id="article-category" value={form.category_id} onChange={updateField("category_id")}>
          <option value="">None</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="review-form__field">
        <label htmlFor="article-tags">Tags (comma separated)</label>
        <input
          id="article-tags"
          type="text"
          value={form.tag_names}
          onChange={updateField("tag_names")}
          placeholder="wine, region, vintage"
        />
      </div>

      <div className="review-form__field">
        <label htmlFor="article-wines">Wines (ctrl/cmd-click for multiple)</label>
        <select
          id="article-wines"
          multiple
          size={5}
          value={form.wine_ids.map(String)}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              wine_ids: Array.from(e.target.selectedOptions, (o) => Number(o.value)),
            }))
          }
        >
          {wines.map((wine) => (
            <option key={wine.id ?? wine.slug} value={wine.id}>
              {wine.name}
            </option>
          ))}
        </select>
      </div>

      <div className="review-form__field">
        <label htmlFor="article-producers">Producers (ctrl/cmd-click for multiple)</label>
        <select
          id="article-producers"
          multiple
          size={5}
          value={form.producer_ids.map(String)}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              producer_ids: Array.from(e.target.selectedOptions, (o) => Number(o.value)),
            }))
          }
        >
          {producers.map((producer) => (
            <option key={producer.id} value={producer.id}>
              {producer.name}
            </option>
          ))}
        </select>
      </div>

      <div className="review-form__field">
        <span className="image-manager__label">Images (top of the article — click + to add, × to remove)</span>
        <ImageManager
          imageableType="article"
          images={existingImages}
          imageIds={existingImageIds}
          imageableId={isEditing ? article.id : null}
          onFilesChange={(files) => setImages(files)}
          onImagesChange={async () => {
            if (isEditing) {
              const reloaded = await articlesApi.show(article.id);
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
        <button className="auth-form__submit" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : isEditing ? "Update Article" : "Create Article"}
        </button>
        {onCancel && (
          <button type="button" className="review-form__cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ArticleForm;