import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { producersApi, imagesApi } from "../services/api";

function ProducerForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(slug);
  const [images, setImages] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    producer_type: "",
    website: "",
    instagram: "",
    facebook: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initFormData() {
      if (isEditing) {
        try {
          setLoading(true);
          const data = await producersApi.show(slug);
          setFormData({
            name: data.name || "",
            address: data.address || "",
            email: data.email || "",
            producer_type: data.producer_type || "",
            website: data.website || "",
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            description: data.description || "",
          });
        } catch (err) {
          setError(err.message || "Failed to load producer");
        } finally {
          setLoading(false);
        }
      }
    }
    initFormData();
  }, [slug, isEditing]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        name: formData.name,
        address: formData.address || null,
        email: formData.email || null,
        producer_type: formData.producer_type || null,
        website: formData.website || null,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        description: formData.description || null,
      };

      if (isEditing) {
        await producersApi.update(slug, payload);
        if (images && images.length > 0) {
          await imagesApi.upload("producer", slug, images);
        }
        navigate(`/producers/${slug}`, { replace: true });
      } else {
        const result = await producersApi.create(payload);
        if (images && images.length > 0) {
          await imagesApi.upload("producer", result.slug, images);
        }
        navigate(`/producers/${result.slug}`, { replace: true });
      }
    } catch (err) {
      const messages =
        err.data?.errors?.join?.(", ") || err.data?.error || err.message;
      setError(messages || "Failed to save producer");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="wine-app">
        <p className="wine-management__loading">Loading…</p>
      </div>
    );
  }

  return (
    <div className="wine-app">
      <Link
        to={isEditing ? `/producers/${slug}` : "/producers"}
        className="wine-detail__back"
      >
        &larr; Back
      </Link>
      <div className="wine-management__header">
        <h1>{isEditing ? "Edit Producer" : "Add New Producer"}</h1>
      </div>
      {error && <p className="auth-form__error">{error}</p>}
      <form onSubmit={handleSubmit} className="wine-form">
        <div className="wine-form__fields">
          <label className="auth-form__field">
            <span>Name *</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Château Margaux"
            />
          </label>
          <label className="auth-form__field">
            <span>Address</span>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 123 Vine St, Bordeaux"
            />
          </label>
          <label className="auth-form__field">
            <span>Email *</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="e.g. contact@producer.com"
            />
          </label>
          <label className="auth-form__field">
            <span>Producer Type *</span>
            <select
              name="producer_type"
              value={formData.producer_type}
              onChange={handleChange}
              required
            >
              <option value="">Select a type…</option>
              <option value="winery">Winery</option>
              <option value="negociant">Negociant</option>
              <option value="cooperative">Cooperative</option>
              <option value="wine_company">Wine Company</option>
              <option value="independent_producer">
                Independent Producer
              </option>
            </select>
          </label>
          <label className="auth-form__field">
            <span>Website</span>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://producer.com"
            />
          </label>
          <label className="auth-form__field">
            <span>Instagram</span>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="@handle or full URL"
            />
          </label>
          <label className="auth-form__field">
            <span>Facebook</span>
            <input
              type="text"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="Page name or full URL"
            />
          </label>
          <label className="auth-form__field" style={{ gridColumn: "1 / -1" }}>
            <span>Description</span>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="About this producer…"
            />
          </label>
        </div>

        <label className="auth-form__field">
          <span>Images (you can select several)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(e.target.files)}
          />
        </label>

        <div className="wine-form__actions">
          <button
            type="submit"
            className="auth-form__submit"
            disabled={submitting}
          >
            {submitting
              ? "Saving…"
              : isEditing
                ? "Update Producer"
                : "Create Producer"}
          </button>
          <Link
            to={isEditing ? `/producers/${slug}` : "/producers"}
            className="wine-form__cancel"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ProducerForm;
