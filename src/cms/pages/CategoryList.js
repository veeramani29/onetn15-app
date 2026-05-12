import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import "../styles/cms.css";

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await api.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  return (
    <div className="cms-list-page">
      <div className="cms-list-header">
        <h1>Categories</h1>
        <Link to="/cms/categories/new" className="cms-btn cms-btn-primary">
          + Add Category
        </Link>
      </div>

      {error && <div className="cms-alert cms-alert-error">{error}</div>}

      {loading ? (
        <div className="cms-loading">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="cms-empty">No categories found. Create your first category!</div>
      ) : (
        <table className="cms-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Active</th>
              <th>Sort Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.name}</td>
                <td><code>{cat.slug}</code></td>
                <td>{cat.is_active ? "Yes" : "No"}</td>
                <td>{cat.sort_order}</td>
                <td>
                  <Link to={`/cms/categories/${cat.id}/edit`} className="cms-btn cms-btn-sm">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="cms-btn cms-btn-sm cms-btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CategoryList;
