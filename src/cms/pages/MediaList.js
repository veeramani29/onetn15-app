import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import "../styles/cms.css";

function MediaList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = searchParams.get("type") || "";
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      const data = await api.getMedia(params);
      setMedia(data.media || []);
    } catch (err) {
      setError("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.deleteMedia(id);
      loadMedia();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateMedia(id, { status: newStatus });
      loadMedia();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getTypeIcon = (type) => {
    return type === "video" ? "Video" : "Article";
  };

  return (
    <div className="cms-list-page">
      <div className="cms-list-header">
        <h1>Articles & Videos</h1>
        <Link to="/cms/media/new" className="cms-btn cms-btn-primary">
          + Create Media
        </Link>
      </div>

      <div className="cms-filter">
        <label>Filter by Type:</label>
        <select value={typeFilter} onChange={(e) => setSearchParams({ type: e.target.value })}>
          <option value="">All</option>
          <option value="article">Articles</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {error && <div className="cms-alert cms-alert-error">{error}</div>}

      {loading ? (
        <div className="cms-loading">Loading...</div>
      ) : media.length === 0 ? (
        <div className="cms-empty">No media items found.</div>
      ) : (
        <table className="cms-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>URL/File</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {media.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>
                  <span className={`cms-status cms-status-${item.type === 'video' ? 'published' : 'draft'}`}>
                    {getTypeIcon(item.type)}
                  </span>
                </td>
                <td>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.url.length > 30 ? item.url.substring(0, 30) + "..." : item.url}
                    </a>
                  ) : item.file_path ? (
                    <a href={item.file_path} target="_blank" rel="noopener noreferrer">
                      {item.file_path.length > 30 ? item.file_path.substring(0, 30) + "..." : item.file_path}
                    </a>
                  ) : "-"}
                </td>
                <td>
                  <span className={`cms-status cms-status-${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                <td>
                  <Link to={`/cms/media/${item.id}/edit`} className="cms-btn cms-btn-sm">
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
      )}
    </div>
  );
}

export default MediaList;
