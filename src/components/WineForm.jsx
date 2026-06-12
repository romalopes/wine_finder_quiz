import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { winesApi } from "../services/api";

const INITIAL_VINTAGE = { year: "", prompt: "" };

function WineForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(slug);

  const [formData, setFormData] = useState({
    name: "",
    region: "",
    color: "",
    closure: "",
    alcohol_percentage: "",
    volume_ml: "",
    prompt: "",
  });
  const [vintages, setVintages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      loadWine();
    }
  }, [slug]);

  async function loadWine() {
    try {
      setLoading(true);
      const data = await winesApi.show(slug);
      setFormData({
        name: data.name || "",
        region: data.region || "",
        color: data.color || "",
        closure: data.closure || "",
        alcohol_percentage:
          data.alcohol_percentage != null
            ? String(data.alcohol_percentage)
            : "",
        volume_ml: data.volume_ml != null ? String(data.volume_ml) : "",
        prompt: data.prompt || "",
      });
      setVintages(
        (data.vintages || []).map((v) => ({
          id: v.id,
          year: v.year,
          prompt: v.prompt || "",
        })),
      );
    } catch (err) {
      setError(err.message || "Failed to load wine");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleVintageChange(index, field, value) {
    setVintages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addVintage() {
    setVintages((prev) => [...prev, { ...INITIAL_VINTAGE }]);
  }

  function removeVintage(index) {
    setVintages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        name: formData.name,
        region: formData.region,
        color: formData.color,
        closure: formData.closure || null,
        alcohol_percentage: formData.alcohol_percentage
          ? parseFloat(formData.alcohol_percentage)
          : null,
        volume_ml: formData.volume_ml ? parseInt(formData.volume_ml, 10) : null,
        prompt: formData.prompt || null,
        vintages_attributes: vintages.map((v) => {
          const attr = { year: parseInt(v.year, 10), prompt: v.prompt };
          if (v.id) attr.id = v.id;
          return attr;
        }),
      };

      if (isEditing) {
        await winesApi.update(slug, payload);
        navigate(`/wines/${slug}`, { replace: true });
      } else {
        const result = await winesApi.create(payload);
        navigate(`/wines/${result.slug}`, { replace: true });
      }
    } catch (err) {
      const messages =
        err.data?.errors?.join?.(", ") || err.data?.error || err.message;
      setError(messages || "Failed to save wine");
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
        to={isEditing ? `/wines/${slug}` : "/wines"}
        className="wine-detail__back"
      >
        &larr; Back
      </Link>

      <div className="wine-management__header">
        <h1>{isEditing ? "Edit Wine" : "Add New Wine"}</h1>
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
            <span>Region *</span>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
              placeholder="e.g. Bordeaux, France"
            />
          </label>

          <label className="auth-form__field">
            <span>Color * </span>
            <select
              name="color"
              value={formData.color?.toLowerCase()}
              onChange={handleChange}
              required
            >
              <option value="">Select color…</option>
              <option value="red">Red</option>
              <option value="white">White</option>
              <option value="rosé">Rosé</option>
              <option value="orange">Orange</option>
              <option value="sparkling">Sparkling</option>
              <option value="dessert">Dessert</option>
            </select>
          </label>

          <label className="auth-form__field">
            <span>Closure</span>
            <select
              name="closure"
              value={formData.closure}
              onChange={handleChange}
            >
              <option value="">Select closure…</option>
              <option value="Cork">Cork</option>
              <option value="Screw cap">Screw cap</option>
              <option value="Synthetic cork">Synthetic cork</option>
              <option value="Diam">Diam</option>
              <option value="Glass stopper">Glass stopper</option>
            </select>
          </label>

          <div className="wine-form__row">
            <label className="auth-form__field wine-form__row-item">
              <span>Alcohol %</span>
              <input
                type="number"
                name="alcohol_percentage"
                value={formData.alcohol_percentage}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="25"
                placeholder="e.g. 13.5"
              />
            </label>
            <label className="auth-form__field wine-form__row-item">
              <span>Volume (ml)</span>
              <input
                type="number"
                name="volume_ml"
                value={formData.volume_ml}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="e.g. 750"
              />
            </label>
          </div>

          <label className="auth-form__field">
            <span>Prompt (optional)</span>
            <textarea
              name="prompt"
              value={formData.prompt}
              onChange={handleChange}
              rows={3}
              placeholder="Description or notes about this wine"
            />
          </label>
        </div>

        <div className="wine-form__vintages">
          <div className="wine-form__vintages-header">
            <h2>Vintages</h2>
            <button
              type="button"
              className="wine-form__add-vintage"
              onClick={addVintage}
            >
              + Add Vintage
            </button>
          </div>

          {vintages.length === 0 && (
            <p className="wine-management__empty-state">
              No vintages added yet. Click "+ Add Vintage" to add one.
            </p>
          )}

          {vintages.map((vintage, index) => (
            <div key={index} className="wine-form__vintage-row">
              <label className="auth-form__field wine-form__vintage-year">
                <span>Year *</span>
                <input
                  type="number"
                  value={vintage.year}
                  onChange={(e) =>
                    handleVintageChange(index, "year", e.target.value)
                  }
                  min={1900}
                  max={new Date().getFullYear() + 5}
                  required
                  placeholder="e.g. 2020"
                />
              </label>
              <label className="auth-form__field wine-form__vintage-prompt">
                <span>Prompt</span>
                <input
                  type="text"
                  value={vintage.prompt}
                  onChange={(e) =>
                    handleVintageChange(index, "prompt", e.target.value)
                  }
                  placeholder="Tasting notes for this vintage"
                />
              </label>
              <button
                type="button"
                className="wine-form__remove-vintage"
                onClick={() => removeVintage(index)}
                title="Remove vintage"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        <div className="wine-form__actions">
          <button
            type="submit"
            className="auth-form__submit"
            disabled={submitting}
          >
            {submitting ? "Saving…" : isEditing ? "Update Wine" : "Create Wine"}
          </button>
          <Link
            to={isEditing ? `/wines/${slug}` : "/wines"}
            className="wine-form__cancel"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default WineForm;
