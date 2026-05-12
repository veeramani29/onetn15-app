import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CmsLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="cms-layout">
      <header className="cms-header">
        <div className="cms-header-content">
          <Link to="/cms/dashboard" className="cms-logo">
            ONETN15 CMS
          </Link>
          <nav className="cms-nav">
            <Link to="/cms/dashboard" className="cms-nav-link">Dashboard</Link>
            <Link to="/cms/categories" className="cms-nav-link">Categories</Link>
            <Link to="/cms/subcategories" className="cms-nav-link">Subcategories</Link>
            <Link to="/cms/news" className="cms-nav-link">News</Link>
            <Link to="/cms/media" className="cms-nav-link">Media</Link>
          </nav>
          <div className="cms-header-actions">
            <span className="cms-user">{user?.username}</span>
            <button onClick={logout} className="cms-btn cms-btn-secondary cms-btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="cms-main">
        {children}
      </main>
    </div>
  );
}

export default CmsLayout;
