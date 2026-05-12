const API_BASE = "/api";

async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("cms_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem("cms_token");
    window.location.href = "/cms/login";
    throw new Error("Unauthorized");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then((res) => res.json()),

  getMe: () => fetchWithAuth("/auth/me"),

  // Categories
  getCategories: () => fetchWithAuth("/categories"),
  getCategory: (id) => fetchWithAuth(`/categories/${id}`),
  createCategory: (data) =>
    fetchWithAuth("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id, data) =>
    fetchWithAuth(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id) =>
    fetchWithAuth(`/categories/${id}`, { method: "DELETE" }),

  // Subcategories
  getSubcategories: (categoryId) =>
    fetchWithAuth(
      `/subcategories${categoryId ? `?category_id=${categoryId}` : ""}`
    ),
  getSubcategory: (id) => fetchWithAuth(`/subcategories/${id}`),
  createSubcategory: (data) =>
    fetchWithAuth("/subcategories", { method: "POST", body: JSON.stringify(data) }),
  updateSubcategory: (id, data) =>
    fetchWithAuth(`/subcategories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSubcategory: (id) =>
    fetchWithAuth(`/subcategories/${id}`, { method: "DELETE" }),

  // News
  getNews: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return fetchWithAuth(`/news${queryParams ? `?${queryParams}` : ""}`);
  },
  getNewsItem: (id) => fetchWithAuth(`/news/${id}`),
  createNews: (data) =>
    fetchWithAuth("/news", { method: "POST", body: JSON.stringify(data) }),
  updateNews: (id, data) =>
    fetchWithAuth(`/news/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteNews: (id) => fetchWithAuth(`/news/${id}`, { method: "DELETE" }),

  // Media (Articles & Videos)
  getMedia: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return fetchWithAuth(`/media${queryParams ? `?${queryParams}` : ""}`);
  },
  getMediaItem: (id) => fetchWithAuth(`/media/${id}`),
  createMedia: (data) =>
    fetchWithAuth("/media", { method: "POST", body: JSON.stringify(data) }),
  updateMedia: (id, data) =>
    fetchWithAuth(`/media/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMedia: (id) => fetchWithAuth(`/media/${id}`, { method: "DELETE" }),
};
