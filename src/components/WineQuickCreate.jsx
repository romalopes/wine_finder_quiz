import { useState, useEffect } from "react";
import { winesApi, producersApi } from "../services/api";

// Inline wine creation form used by the Reviews page when a searched wine
// is not found. Creates the wine (with a single vintage) and returns
// { slug, vintageId } via onCreated so the review flow can continue.
function WineQuickCreate({ defaultName = "", defaultVintageYear = "", onCreated, onCancel }) {
  const [form, setForm] = useState({
    name: defaultName,
    region: "",
    color: "",
    closure: "",
    alcohol_percentage: "",
    volume_ml: "",
    prompt: "",
    producer_id: "",
    vintage_year: defaultVintageYear,
  });
  const [producers, setProducers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    producersApi
      .list()
      .then((data) => setProducers(Array.isArray(data) ? data : []))
      .catch(() => setProducers([]));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        region: form.region,
        color: form.color,
        closure: form.closure || null,
        alcohol_percentage: form.alcohol_percentage
          ? parseFloat(form.alcohol_percentage)
          : null,
        volume_ml: form.volume_ml ? parseInt(form.volume_ml, 10) : null,
        prompt: form.prompt || null,
        producer_id: form.producer_id ? parseInt(form.producer_id, 10) : null,
        vintages_attributes: [
          { year: parseInt(form.vintage_year, 10), prompt: null },
        ],
      };

      const created = await winesApi.create(payload);
      const vintage = (created.vintages || []).find(
        (v) => String(v.year) === String(form.vintage_year),
      );

      if (!created.slug || !vintage?.id) {
        throw new Error(
          "Wine was created but the vintage could not be resolved",
        );
      }

      onCreated({
        slug: created.slug,
        vintageId: vintage.id,
        name: created.name,
      });
    } catch (err) {
      setError(err.message || "Failed to create wine");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <p className="wine-management__empty-state">
        No wine found. Add it below — then continue with your review.
      </p>

      {error && <p className="review-form__error">{error}</p>}


      <div className="review-form__field">
        <label htmlFor="quick-wine-name">Wine Name *</label>
        <input
          id="quick-wine-name"
          type="text"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Château Margaux"
        />
      </div>

      <div className="review-form__field">
        <label htmlFor="quick-wine-producer">Producer</label>
        <select
          id="quick-wine-producer"
          name="producer_id"
          value={form.producer_id}
          onChange={handleChange}
        >
          <option value="">Select producer…</option>
          {producers.map((producer) => (
            <option key={producer.id} value={producer.id}>
              {producer.name}
            </option>
          ))}
        </select>
      </div>

      <div className="review-form__field">
        <label htmlFor="quick-wine-region">Region *</label>
        <input
          id="quick-wine-region"
          type="text"
          name="region"
          required
          value={form.region}
          onChange={handleChange}
          placeholder="e.g. Bordeaux, France"
        />
      </div>

      <div className="review-form__field">
        <label htmlFor="quick-wine-color">Color *</label>
        <select
          id="quick-wine-color"
          name="color"
          required
          value={form.color}
          onChange={handleChange}
        >
          <option value="">Select color…</option>
          <option value="Red">Red</option>
          <option value="White">White</option>
          <option value="Rosé">Rosé</option>
          <option value="Orange">Orange</option>
          <option value="Sparkling">Sparkling</option>
          <option value="Dessert">Dessert</option>
        </select>
      </div>

      <div className="review-form__field">
        <label htmlFor="quick-wine-closure">Closure</label>
        <select
          id="quick-wine-closure"
          name="closure"
          value={form.closure}
          onChange={handleChange}
        >
          <option value="">Select closure…</option>
          <option value="Cork">Cork</option>
          <option value="Screw cap">Screw cap</option>
          <option value="Synthetic cork">Synthetic cork</option>
          <option value="Diam">Diam</option>
          <option value="Glass stopper">Glass stopper</option>
        </select>
      </div>

      <div className="review-form__field">
        <div className="wine-form__row">
          <label className="auth-form__field wine-form__row-item">
            <span>Alcohol %</span>
            <input
              type="number"
              name="alcohol_percentage"
              step="0.1"
              min="0"
              max="25"
              value={form.alcohol_percentage}
              onChange={handleChange}
              placeholder="e.g. 13.5"
            />
          </label>
          <label className="auth-form__field wine-form__row-item">
            <span>Volume (ml)</span>
            <input
              type="number"
              name="volume_ml"
              min="0"
              step="1"
              value={form.volume_ml}
              onChange={handleChange}
              placeholder="e.g. 750"
            />
          </label>
        </div>
      </div>

      <div className="review-form__field">
        <label htmlFor="quick-wine-vintage-year">Vintage Year *</label>
        <input
          id="quick-wine-vintage-year"
          type="number"
          name="vintage_year"
          required
          min={1900}
          max={new Date().getFullYear() + 5}
          value={form.vintage_year}
          onChange={handleChange}
          placeholder="e.g. 2020"
        />
      </div>

      <div className="review-form__field">
        <label htmlFor="quick-wine-prompt">Prompt (optional)</label>
        <textarea
          id="quick-wine-prompt"
          name="prompt"
          rows={3}
          value={form.prompt}
          onChange={handleChange}
          placeholder="Description or notes about this wine"
        />
      </div>

      <div className="review-form__actions">
        <button className="auth-form__submit" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create Wine & Continue"}
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

export default WineQuickCreate;
