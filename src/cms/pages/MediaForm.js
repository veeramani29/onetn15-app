import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import "../styles/cms.css";

function MediaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    type: "article",
    url: "",
    file_path: "",
    thumbnail: "",
    description: "",
    status: "draft",
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      loadMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMedia = async () => {
    try {
      const data = await api.getMediaItem(id);
      const media = data.media;
      setFormData({
        title: media.title || "",
        type: media.type || "article",
        url: media.url || "",
        file_path: media.file_path || "",
        thumbnail: media.thumbnail || "",
        description: media.description || "",
        status: media.status || "draft",
      });
    } catch (err) {
      setError("Failed to load media");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Set file_path for uploaded files
      setFormData((prev) => ({
        ...prev,
        file_path: data.location || data.url,
        url: "", // Clear URL when file is uploaded
      }));
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        url: formData.url || null,
        file_path: formData.file_path || null,
      };

      if (isEdit) {
        await api.updateMedia(id, payload);
      } else {
        await api.createMedia(payload);
      }
      navigate("/cms/media");
    } catch (err) {
      setError("Failed to save media");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cms-form-page">
      <h1>{isEdit ? "Edit Media" : "Create Media"}</h1>

      {error && <div className="cms-alert cms-alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="cms-form">
        <div className="cms-form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Media title"
          />
        </div>

        <div className="cms-form-row">
          <div className="cms-form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="article">Article</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="cms-form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="cms-form-group">
          <label htmlFor="url">External URL</label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com/video or article"
            disabled={formData.file_path}
          />
        </div>

        <div className="cms-form-group">
          <label htmlFor="file">Or Upload File</label>
          <input
            type="file"
            id="file"
            onChange={handleFileUpload}
            disabled={uploading || formData.url}
            accept={formData.type === "video" ? "video/*" : "*/*"}
          />
          {uploading && <span className="cms-slug-auto">Uploading...</span>}
          {formData.file_path && (
            <div style={{ marginTop: "8px" }}>
              <span className="cms-status cms-status-published">
                File uploaded: {formData.file_path.split("/").pop()}
              </span>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, file_path: "" }))}
                className="cms-btn cms-btn-sm cms-btn-danger"
                style={{ marginLeft: "8px" }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {formData.type === "video" && (
          <div className="cms-form-group">
            <label htmlFor="thumbnail">Thumbnail URL</label>
            <input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>
        )}

        <div className="cms-form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Brief description"
          />
        </div>

        <div className="cms-form-actions">
          <button type="submit" className="cms-btn cms-btn-primary" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Media" : "Create Media"}
          </button>
          <button type="button" onClick={() => navigate("/cms/media")} className="cms-btn cms-btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default MediaForm;
