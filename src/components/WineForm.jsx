import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { winesApi, tasteParametersApi, producersApi } from "../services/api";

const INITIAL_VINTAGE = { year: "", prompt: "" };

function WineForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(slug);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    region: "",
    color: "",
    closure: "",
    alcohol_percentage: "",
    volume_ml: "",
    prompt: "",
    producer_id: "",
  });

  const [vintages, setVintages] = useState([]);
  const [tasteParams, setTasteParams] = useState([]);
  const [tasteScores, setTasteScores] = useState([]);
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initFormData() {
      try {
        setLoading(true);
        // 1. Load global taste parameters first
        const globalParams = await tasteParametersApi.list();
        // The API returns the array directly, not wrapped in data.parameters
        const paramsArray = Array.isArray(globalParams) ? globalParams : [];
        setTasteParams(paramsArray);

        // Load producers
        const producerData = await producersApi.list();
        setProducers(Array.isArray(producerData) ? producerData : []);

        // Set baseline defaults
        let initialScores = paramsArray.map((p) => ({
          id: null, // join table record id
          taste_parameter_id: p.id,
          taste_parameter_slug: p.slug,
          score: 3,
        }));

        // 2. If editing, load the wine and merge its existing scores
        if (isEditing) {
          const wineData = await winesApi.show(slug);

          setFormData({
            id: wineData.id || null,
            name: wineData.name || "",
            region: wineData.region || "",
            color: wineData.color || "",
            closure: wineData.closure || "",
            alcohol_percentage:
              wineData.alcohol_percentage != null
                ? String(wineData.alcohol_percentage)
                : "",
            volume_ml:
              wineData.volume_ml != null ? String(wineData.volume_ml) : "",
            prompt: wineData.prompt || "",
            producer_id: wineData.producer?.id || "",
          });

          setVintages(
            (wineData.vintages || []).map((v) => ({
              id: v.id,
              year: v.year,
              prompt: v.prompt || "",
            })),
          );

          if (wineData.parameters && wineData.parameters.length > 0) {
            initialScores = initialScores.map((scoreObj) => {
              const matchingParam = wineData.parameters.find(
                (wp) => wp.taste_parameter_id === scoreObj.taste_parameter_id,
              );
              if (matchingParam) {
                return {
                  ...scoreObj,
                  id: matchingParam.id,
                  score: matchingParam.score,
                };
              }
              return scoreObj;
            });
          }
        }

        setTasteScores(initialScores);
      } catch (err) {
        setError(err.message || "Failed to initialize form options");
      } finally {
        setLoading(false);
      }
    }

    initFormData();
  }, [slug, isEditing]);

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

  function handleTasteChange(index, value) {
    setTasteScores((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], score: Number(value) };
      }
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

      const wineTasteParametersAttributes = tasteScores.map((ts) => ({
        id: ts.id || null,
        wine_id: formData.id,
        taste_parameter_id: ts.taste_parameter_id,
        taste_parameter_slug: ts.taste_parameter_slug,
        score: ts.score,
      }));

      const payload = {
        id: formData.id || null,
        name: formData.name,
        region: formData.region,
        color: formData.color,
        closure: formData.closure || null,
        alcohol_percentage: formData.alcohol_percentage
          ? parseFloat(formData.alcohol_percentage)
          : null,
        volume_ml: formData.volume_ml ? parseInt(formData.volume_ml, 10) : null,
        prompt: formData.prompt || null,
        producer_id: formData.producer_id
          ? parseInt(formData.producer_id, 10)
          : null,
        vintages_attributes: vintages.map((v) => {
          const attr = { year: parseInt(v.year, 10), prompt: v.prompt || null };
          if (v.id) attr.id = v.id;
          return attr;
        }),
        wine_taste_parameters_attributes: wineTasteParametersAttributes,
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
            <span>Producer</span>
            <select
              name="producer_id"
              value={formData.producer_id}
              onChange={handleChange}
            >
              <option value="">Select producer…</option>
              {producers.map((producer) => (
                <option key={producer.id} value={producer.id}>
                  {producer.name}
                </option>
              ))}
            </select>
          </label>
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
              value={formData.color}
              onChange={handleChange}
              required
            >
              <option value="">Select color…</option>
              <option value="Red">Red</option>
              <option value="White">White</option>
              <option value="Rosé">Rosé</option>
              <option value="Orange">Orange</option>
              <option value="Sparkling">Sparkling</option>
              <option value="Dessert">Dessert</option>
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

        <div className="wine-form__section">
          <div className="wine-form__vintages-header">
            <h2>Taste Parameters</h2>
          </div>
          <div className="wine-form__params">
            {tasteParams.map((tp, index) => {
              const currentScore = tasteScores[index]?.score ?? 3;
              return (
                <label className="wine-slider" key={tp.slug}>
                  <span className="wine-slider__top">
                    <strong>{tp.label}</strong>
                    <output>{currentScore}</output>
                  </span>
                  <input
                    max="5"
                    min="1"
                    type="range"
                    value={currentScore}
                    onChange={(e) => handleTasteChange(index, e.target.value)}
                  />
                  <span className="wine-slider__scale">
                    <small>{tp.low}</small>
                    <small>{tp.high}</small>
                  </span>
                </label>
              );
            })}
          </div>
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
