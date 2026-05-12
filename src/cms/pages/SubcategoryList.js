import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import "../styles/cms.css";

function SubcategoryList() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  const loadData = async () => {
    try {
      const [subcatData, catData] = await Promise.all([
        api.getSubcategories(filterCategory || undefined),
        api.getCategories(),
      ]);
      setSubcategories(subcatData.subcategories || []);
      setCategories(catData.categories || []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      await api.deleteSubcategory(id);
      loadData();
    } catch (err) {
      alert("Failed to delete subcategory");
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "-";
  };

  return (
    <div className="cms-list-page">
      <div className="cms-list-header">
        <h1>Subcategories</h1>
        <Link to="/cms/subcategories/new" className="cms-btn cms-btn-primary">
          + Add Subcategory
        </Link>
      </div>

      <div className="cms-filter">
        <label>Filter by Category:</label>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="cms-alert cms-alert-error">{error}</div>}

      {loading ? (
        <div className="cms-loading">Loading...</div>
      ) : subcategories.length === 0 ? (
        <div className="cms-empty">No subcategories found.</div>
      ) : (
        <table className="cms-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.id}</td>
                <td>{getCategoryName(sub.category_id)}</td>
                <td>{sub.name}</td>
                <td><code>{sub.slug}</code></td>
                <td>{sub.is_active ? "Yes" : "No"}</td>
                <td>
                  <Link to={`/cms/subcategories/${sub.id}/edit`} className="cms-btn cms-btn-sm">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(sub.id)}
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

export default SubcategoryList;
