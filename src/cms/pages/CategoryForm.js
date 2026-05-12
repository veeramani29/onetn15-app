import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import "../styles/cms.css";

function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    sort_order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      loadCategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCategory = async () => {
    try {
      const data = await api.getCategory(id);
      setFormData({
        name: data.category.name || "",
        description: data.category.description || "",
        is_active: data.category.is_active ?? true,
        sort_order: data.category.sort_order ?? 0,
      });
    } catch (err) {
      setError("Failed to load category");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEdit) {
        await api.updateCategory(id, formData);
      } else {
        await api.createCategory(formData);
      }
      navigate("/cms/categories");
    } catch (err) {
      setError("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cms-form-page">
      <h1>{isEdit ? "Edit Category" : "Add Category"}</h1>

      {error && <div className="cms-alert cms-alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="cms-form">
        <div className="cms-form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Category name"
          />
        </div>

        <div className="cms-form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Category description"
          />
        </div>

        <div className="cms-form-row">
          <div className="cms-form-group">
            <label htmlFor="sort_order">Sort Order</label>
            <input
              type="number"
              id="sort_order"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              min={0}
            />
          </div>

          <div className="cms-form-group">
            <label className="cms-checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Active
            </label>
          </div>
        </div>

        <div className="cms-form-actions">
          <button type="submit" className="cms-btn cms-btn-primary" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
          </button>
          <button type="button" onClick={() => navigate("/cms/categories")} className="cms-btn cms-btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CategoryForm;
