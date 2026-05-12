import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import "../styles/cms.css";

function SubcategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    is_active: true,
    sort_order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadSubcategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load categories");
    }
  };

  const loadSubcategory = async () => {
    try {
      const data = await api.getSubcategory(id);
      setFormData({
        category_id: data.subcategory.category_id || "",
        name: data.subcategory.name || "",
        description: data.subcategory.description || "",
        is_active: data.subcategory.is_active ?? true,
        sort_order: data.subcategory.sort_order ?? 0,
      });
    } catch (err) {
      setError("Failed to load subcategory");
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
        await api.updateSubcategory(id, formData);
      } else {
        await api.createSubcategory(formData);
      }
      navigate("/cms/subcategories");
    } catch (err) {
      setError("Failed to save subcategory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cms-form-page">
      <h1>{isEdit ? "Edit Subcategory" : "Add Subcategory"}</h1>

      {error && <div className="cms-alert cms-alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="cms-form">
        <div className="cms-form-group">
          <label htmlFor="category_id">Category *</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="cms-form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Subcategory name"
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
            placeholder="Subcategory description"
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
            {loading ? "Saving..." : isEdit ? "Update Subcategory" : "Create Subcategory"}
          </button>
          <button type="button" onClick={() => navigate("/cms/subcategories")} className="cms-btn cms-btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default SubcategoryForm;
