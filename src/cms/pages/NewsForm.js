import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { Editor } from "@tinymce/tinymce-react";
import "../styles/cms.css";

// Slugify function to generate URL-friendly slugs
const slugify = (text) => {
  if (!text) return "";
  let slug = text.toString();
  slug = slug.replace(/\s+/g, "-");
  slug = slug.replace(/[^\p{L}\p{N}\-]+/gu, "");
  slug = slug.replace(/\-\-+/g, "-");
  slug = slug.replace(/^-+/, "").replace(/-+$/, "");
  return slug.toLowerCase();
};

function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    status: "draft",
    published_at: null,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadNews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
      setFormData((prev) => ({ ...prev, subcategory_id: "" }));
    }
  }, [formData.category_id]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load categories");
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      const data = await api.getSubcategories(categoryId);
      setSubcategories(data.subcategories || []);
    } catch (err) {
      console.error("Failed to load subcategories");
    }
  };

  const loadNews = async () => {
    try {
      const data = await api.getNewsItem(id);
      const news = data.news;
      setFormData({
        category_id: news.category_id || "",
        subcategory_id: news.subcategory_id || "",
        title: news.title || "",
        slug: news.slug || "",
        excerpt: news.excerpt || "",
        content: news.content || "",
        author: news.author || "",
        status: news.status || "draft",
        published_at: news.published_at || null,
      });
      setSlugManuallyEdited(true); // Existing news has a slug, treat as manually set
    } catch (err) {
      setError("Failed to load news");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-generate slug from title when title changes and slug hasn't been manually edited
      if (name === "title" && !slugManuallyEdited) {
        updated.slug = slugify(value);
      }

      return updated;
    });
  };

  const handleSlugChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, slug: value }));
    setSlugManuallyEdited(true);
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
      };

      if (isEdit) {
        await api.updateNews(id, payload);
      } else {
        await api.createNews(payload);
      }
      navigate("/cms/news");
    } catch (err) {
      setError("Failed to save news");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cms-form-page">
      <h1>{isEdit ? "Edit News" : "Create News"}</h1>

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
            placeholder="News title"
          />
        </div>

        <div className="cms-form-group">
          <label htmlFor="slug">Slug</label>
          <div className="cms-slug-input">
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="news-url-slug"
            />
            <span className={`cms-slug-auto ${slugManuallyEdited ? "cms-slug-auto-manual" : "cms-slug-auto-generated"}`}>
              {slugManuallyEdited ? "Manual" : "Auto"}
            </span>
          </div>
        </div>

        <div className="cms-form-row">
          <div className="cms-form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
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
            <label htmlFor="subcategory_id">Subcategory</label>
            <select
              id="subcategory_id"
              name="subcategory_id"
              value={formData.subcategory_id}
              onChange={handleChange}
              disabled={!formData.category_id}
            >
              <option value="">Select a subcategory</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="cms-form-group">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={2}
            placeholder="Brief excerpt"
          />
        </div>

        <div className="cms-form-group">
          <label htmlFor="content">Content *</label>
          <div className="cms-tinymce-wrapper">
            <Editor
              apiKey="zmfnrnvmx85bkbthm359kktpgjz1xmij6897z59fefr6qdri"
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                  "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                  "insertdatetime", "table", "codesample", "wordcount", "file", "media"
                ],
                toolbar:
                  "undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image file media table | code blockquote codesample | removeformat | fullscreen preview",
                content_style: "body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }",
                table_default_attributes: {
                  border: '1'
                },
                file_picker_types: "file image media",
                automatic_uploads: false,
                images_upload_url: "/api/upload",
                file_picker_callback: function(callback, value, meta) {
                  const input = document.createElement("input");
                  input.type = "file";
                  if (meta.filetype === "image") {
                    input.accept = "image/*";
                  } else if (meta.filetype === "media") {
                    input.accept = "video/*";
                  } else {
                    input.accept = "*/*";
                  }
                  input.onchange = function() {
                    const file = input.files[0];
                    const formData = new FormData();
                    formData.append('file', file);

                    fetch('/api/upload', {
                      method: 'POST',
                      body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                      if (data.location) {
                        callback(data.location, { title: file.name });
                      } else {
                        callback(data.url || data.filename, { title: file.name });
                      }
                    })
                    .catch(err => {
                      console.error('Upload failed:', err);
                      // Fallback to base64
                      const reader = new FileReader();
                      reader.onload = function(e) {
                        callback(e.target.result, { title: file.name });
                      };
                      reader.readAsDataURL(file);
                    });
                  };
                  input.click();
                }
              }}
              value={formData.content}
              onEditorChange={handleEditorChange}
            />
          </div>
        </div>

        {isEdit && (
          <div className="cms-status-info">
            <div>
              <span className="cms-status-info-label">Status: </span>
              <span className={`cms-status cms-status-${formData.status}`}>
                {formData.status}
              </span>
            </div>
            {formData.published_at && (
              <div>
                <span className="cms-status-info-label">Published: </span>
                <span className="cms-published-date">
                  {new Date(formData.published_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="cms-form-row">
          <div className="cms-form-group">
            <label htmlFor="author">Author</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Author name"
            />
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

        <div className="cms-form-actions">
          <button type="submit" className="cms-btn cms-btn-primary" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update News" : "Create News"}
          </button>
          <button type="button" onClick={() => navigate("/cms/news")} className="cms-btn cms-btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewsForm;
