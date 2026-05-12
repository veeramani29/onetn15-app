import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/cms.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
    news: 0,
    published: 0,
    drafts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [categories, subcategories, news] = await Promise.all([
        api.getCategories(),
        api.getSubcategories(),
        api.getNews({ status: 'all' }),
      ]);

      setStats({
        categories: categories.categories?.length || 0,
        subcategories: subcategories.subcategories?.length || 0,
        news: news.news?.length || 0,
        published: news.news?.filter((n) => n.status === "published").length || 0,
        drafts: news.news?.filter((n) => n.status === "draft").length || 0,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cms-dashboard">
      <div className="cms-dashboard-header">
        <div>
          <h1>Welcome, {user?.username}</h1>
          <p>Content Management System Dashboard</p>
        </div>
        <button onClick={logout} className="cms-btn cms-btn-secondary">
          Logout
        </button>
      </div>

      <div className="cms-stats-grid">
        <div className="cms-stat-card">
          <h3>Categories</h3>
          <p className="cms-stat-number">{loading ? "-" : stats.categories}</p>
          <Link to="/cms/categories" className="cms-stat-link">Manage</Link>
        </div>

        <div className="cms-stat-card">
          <h3>Subcategories</h3>
          <p className="cms-stat-number">{loading ? "-" : stats.subcategories}</p>
          <Link to="/cms/subcategories" className="cms-stat-link">Manage</Link>
        </div>

        <div className="cms-stat-card">
          <h3>Total News</h3>
          <p className="cms-stat-number">{loading ? "-" : stats.news}</p>
          <Link to="/cms/news" className="cms-stat-link">Manage</Link>
        </div>

        <div className="cms-stat-card">
          <h3>Published</h3>
          <p className="cms-stat-number">{loading ? "-" : stats.published}</p>
          <Link to="/cms/news?status=published" className="cms-stat-link">View</Link>
        </div>

        <div className="cms-stat-card">
          <h3>Drafts</h3>
          <p className="cms-stat-number">{loading ? "-" : stats.drafts}</p>
          <Link to="/cms/news?status=draft" className="cms-stat-link">View</Link>
        </div>
      </div>

      <div className="cms-quick-actions">
        <h2>Quick Actions</h2>
        <div className="cms-actions-grid">
          <Link to="/cms/categories/new" className="cms-action-card">
            <span className="cms-action-icon">+</span>
            <span>Add Category</span>
          </Link>
          <Link to="/cms/subcategories" className="cms-action-card">
            <span className="cms-action-icon">+</span>
            <span>Add Subcategory</span>
          </Link>
          <Link to="/cms/news/new" className="cms-action-card cms-action-primary">
            <span className="cms-action-icon">+</span>
            <span>Create News</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
