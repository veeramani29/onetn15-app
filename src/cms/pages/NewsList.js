import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import "../styles/cms.css";

function NewsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadNews = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const data = await api.getNews(params);
      setNews(data.news || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;

    try {
      await api.deleteNews(id);
      loadNews();
    } catch (err) {
      alert("Failed to delete news");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateNews(id, { status: newStatus });
      loadNews();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="cms-list-page">
      <div className="cms-list-header">
        <h1>News Articles</h1>
        <Link to="/cms/news/new" className="cms-btn cms-btn-primary">
          + Create News
        </Link>
      </div>

      <div className="cms-filter">
        <label>Filter by Status:</label>
        <select value={statusFilter} onChange={(e) => setSearchParams({ status: e.target.value })}>
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {error && <div className="cms-alert cms-alert-error">{error}</div>}

      {loading ? (
        <div className="cms-loading">Loading...</div>
      ) : news.length === 0 ? (
        <div className="cms-empty">No news articles found.</div>
      ) : (
        <>
          <table className="cms-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>{item.category_name || "-"}</td>
                  <td>{item.author || "-"}</td>
                  <td>
                    <span className={`cms-status cms-status-${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/cms/news/${item.id}/edit`} className="cms-btn cms-btn-sm">
                      Edit
                    </Link>
                    {item.status === "draft" && (
                      <button
                        onClick={() => handleStatusChange(item.id, "published")}
                        className="cms-btn cms-btn-sm cms-btn-success"
                      >
                        Publish
                      </button>
                    )}
                    {item.status === "published" && (
                      <button
                        onClick={() => handleStatusChange(item.id, "draft")}
                        className="cms-btn cms-btn-sm cms-btn-warning"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="cms-btn cms-btn-sm cms-btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="cms-pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadNews(pagination.page - 1)}
                className="cms-btn cms-btn-secondary"
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => loadNews(pagination.page + 1)}
                className="cms-btn cms-btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NewsList;
