import { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { regionsApi, countriesApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { isSuperUser, canManageGrapes } from "../constants/roles";

const emptyForm = {
  name: "",
  country_id: "",
  parent_id: "",
  is_state: false,
  is_appellation: false,
};

function typeLabel(region) {
  const labels = [];
  if (region.is_state) labels.push("State");
  if (region.is_appellation) labels.push("Appellation");
  return labels.length > 0 ? labels.join(" / ") : "Region";
}
function Regions() {
  const { user } = useAuth();
  const canManage = isSuperUser(user) || canManageGrapes(user);
  const [sortBy, setSortBy] = useState("name");
  const [regions, setRegions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [mode, setMode] = useState("create");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const sortedRegions = useMemo(() => {
    const sorted = [...regions];
    switch (sortBy) {
      case "country":
        sorted.sort(
          (a, b) =>
            (a.country?.name || "").localeCompare(b.country?.name || "") ||
            (a.name || "").localeCompare(b.name || ""),
        );
        break;
      case "type":
        sorted.sort(
          (a, b) =>
            typeLabel(a).localeCompare(typeLabel(b)) ||
            (a.name || "").localeCompare(b.name || ""),
        );
        break;
      case "name":
      default:
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
    }
    return sorted;
  }, [regions, sortBy]);

  const loadRegions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await regionsApi.list();
      setRegions(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load regions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegions();
    countriesApi
      .list()
      .then((data) => setCountries(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [loadRegions]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setMode("create");
    setEditingId(null);
    setShowForm(false);
    setForm(emptyForm);
  }

  function openCreateForm() {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.country_id) {
      setError("Name and Country are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        country_id: form.country_id ? parseInt(form.country_id, 10) : null,
        parent_id: form.parent_id ? parseInt(form.parent_id, 10) : null,
        parent_name: form.parent_name || null,
        is_state: Boolean(form.is_state),
        is_appellation: Boolean(form.is_appellation),
      };
      if (mode === "edit" && editingId) {
        await regionsApi.update(editingId, payload);
        setNotice(`Region "${payload.name}" updated.`);
      } else {
        await regionsApi.create(payload);
        setNotice(`Region "${payload.name}" created.`);
      }
      resetForm();
      await loadRegions();
    } catch (err) {
      setError(err.message || "Failed to save region");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(region) {
    setMode("edit");
    setEditingId(region.id);
    setShowForm(true);
    setForm({
      name: region.name || "",
      country_id: region.country_id != null ? String(region.country_id) : "",
      parent_id: region.parent_id != null ? String(region.parent_id) : "",
      parent_name: region.parent_name || "",
      is_state: Boolean(region.is_state),
      is_appellation: Boolean(region.is_appellation),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(region) {
    if (
      !window.confirm(`Delete region "${region.name}"? This cannot be undone.`)
    )
      return;
    setError(null);
    setNotice(null);
    try {
      await regionsApi.remove(region.id);
      setNotice(`Region "${region.name}" deleted.`);
      if (editingId === region.id) resetForm();
      await loadRegions();
    } catch (err) {
      setError(err.message || "Failed to delete region");
    }
  }

  const parentOptions = regions.filter((r) => r.id !== editingId);
  return (
    <div className="grapes-page">
      <h1 className="grapes-page__title">Regions</h1>

      {error && <div className="flash flash--alert">{error}</div>}
      {notice && <div className="flash flash--notice">{notice}</div>}

      {canManage && showForm && (
        <section className="grape-form-section">
          <h2>{mode === "edit" ? "Edit Region" : "New Region"}</h2>
          <form onSubmit={handleSubmit} className="grape-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="region-name">Name *</label>
                <input
                  id="region-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Napa Valley"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="region-country">Country *</label>
                <select
                  id="region-country"
                  value={form.country_id}
                  onChange={(e) => updateField("country_id", e.target.value)}
                  required
                >
                  <option value="">Select a country...</option>
                  {countries.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.flag_emoji ? `${c.flag_emoji} ` : ""}
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="region-parent">Parent Region</label>
                <select
                  id="region-parent"
                  value={form.parent_id}
                  onChange={(e) => updateField("parent_id", e.target.value)}
                >
                  <option value="">No parent (top-level)</option>
                  {parentOptions.map((r) => (
                    <option key={r.id} value={String(r.id)}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group form-group--checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(form.is_state)}
                    onChange={(e) => updateField("is_state", e.target.checked)}
                  />
                  Is State / Province
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(form.is_appellation)}
                    onChange={(e) =>
                      updateField("is_appellation", e.target.checked)
                    }
                  />
                  Is Appellation
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : mode === "edit" ? "Update" : "Create"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
      <section>
        <div className="section-header">
          <h2 className="section-header__title">All Regions</h2>
          <div className="section-header__actions">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort regions"
            >
              <option value="name">Name</option>
              <option value="country">Country</option>
              <option value="type">Type</option>
            </select>
            {canManage && !showForm && (
              <button
                type="button"
                className="btn-primary"
                onClick={openCreateForm}
              >
                + Add New Region
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="grapes-page__loading">Loading regions…</p>
        ) : sortedRegions.length === 0 ? (
          <p className="grapes-page__empty">No regions found.</p>
        ) : (
          <table className="grapes-table regions-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Country</th>
                <th>Type</th>
                <th>Parent</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedRegions.map((region, index) => (
                <tr
                  key={region.id}
                  className={
                    index % 2 === 0 ? "grapes-row--even" : "grapes-row--odd"
                  }
                >
                  <td>
                    <Link
                      to={`/regions/${region.id}`}
                      className="grapes-table__link"
                    >
                      {region.name}
                    </Link>
                  </td>
                  <td>
                    {region.country?.flag_emoji
                      ? `${region.country.flag_emoji} `
                      : ""}
                    {region.country?.name || "—"}
                  </td>
                  <td>{typeLabel(region)}</td>
                  <td>{region.parent_name ? region.parent_name : "—"}</td>
                  {canManage && (
                    <td className="actions">
                      <Link to={`/regions/${region.id}`} className="btn-action">
                        Show
                      </Link>
                      <button
                        type="button"
                        className="btn-action"
                        onClick={() => startEdit(region)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-action--delete"
                        onClick={() => handleDelete(region)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Regions;
