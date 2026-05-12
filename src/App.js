import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Link,
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Products from "./pages/Products";
import NewsDetail from "./pages/NewsDetail";
import ServiceSidebar from "./components/ServiceSidebar";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// CMS imports
import { AuthProvider } from "./cms/context/AuthContext";
import PrivateRoute from "./cms/components/PrivateRoute";
import CmsLayout from "./cms/components/CmsLayout";
import LoginPage from "./cms/pages/LoginPage";
import Dashboard from "./cms/pages/Dashboard";
import CategoryList from "./cms/pages/CategoryList";
import CategoryForm from "./cms/pages/CategoryForm";
import SubcategoryList from "./cms/pages/SubcategoryList";
import SubcategoryForm from "./cms/pages/SubcategoryForm";
import NewsList from "./cms/pages/NewsList";
import NewsForm from "./cms/pages/NewsForm";
import MediaList from "./cms/pages/MediaList";
import MediaForm from "./cms/pages/MediaForm";

function Header() {
  const { theme, toggleTheme, themeLabels } = useTheme();

  return (
    <header className="site-header">
      <div style={styles.headerInner}>
        <Link to="/" className="logo" aria-label="ONETN15 Home">
          ONETN15
        </Link>
        <nav className="header-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Services
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Products
          </NavLink>
          <a href="#contact" className="nav-link">
            Contact
          </a>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Current: ${theme}. Click to change theme.`}
          >
            {themeLabels[theme]}
          </button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div style={styles.footerInner}>
        <p>&copy; {new Date().getFullYear()} ONETN15. All rights reserved.</p>
      </div>
    </footer>
  );
}

function NewsPost({ id, title, date, author, excerpt }) {
  return (
    <article className="post">
      <h2 className="post-title">{title}</h2>
      <div className="post-meta">
        <time dateTime={date}>{date}</time> | <span>By {author}</span>
      </div>
      <p className="post-excerpt">{excerpt}</p>
      <Link to={`/news/${id}`} className="read-more">
        Read More &raquo;
      </Link>
    </article>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<div className="layout-container"><Header /><Home /><Footer /></div>} />
            <Route path="/about" element={<div className="layout-container"><Header /><About /><Footer /></div>} />
            <Route path="/services" element={<div className="layout-container"><Header /><Services /><Footer /></div>} />
            <Route path="/products" element={<div className="layout-container"><Header /><Products /><Footer /></div>} />
            <Route path="/news/:cat/:subcat/:slug" element={<div className="layout-container"><Header /><NewsDetail /><Footer /></div>} />

            {/* CMS routes */}
            <Route path="/cms/login" element={<LoginPage />} />
            <Route
              path="/cms/dashboard"
              element={
                <PrivateRoute>
                  <CmsLayout><Dashboard /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/categories"
              element={
                <PrivateRoute>
                  <CmsLayout><CategoryList /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/categories/new"
              element={
                <PrivateRoute>
                  <CmsLayout><CategoryForm /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/categories/:id/edit"
              element={
                <PrivateRoute>
                  <CmsLayout><CategoryForm /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/subcategories"
              element={
                <PrivateRoute>
                  <CmsLayout><SubcategoryList /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/subcategories/new"
              element={
                <PrivateRoute>
                  <CmsLayout><SubcategoryForm /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/subcategories/:id/edit"
              element={
                <PrivateRoute>
                  <CmsLayout><SubcategoryForm /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/news"
              element={
                <PrivateRoute>
                  <CmsLayout><NewsList /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/news/new"
              element={
                <PrivateRoute>
                  <CmsLayout><NewsForm /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/news/:id/edit"
              element={
                <PrivateRoute>
                  <CmsLayout><NewsForm /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/media"
              element={
                <PrivateRoute>
                  <CmsLayout><MediaList /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/media/new"
              element={
                <PrivateRoute>
                  <CmsLayout><MediaForm /></CmsLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cms/media/:id/edit"
              element={
                <PrivateRoute>
                  <CmsLayout><MediaForm /></CmsLayout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = {
  headerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 20px",
    flexWrap: "wrap",
    gap: 12,
  },
  footerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "24px 20px",
    textAlign: "center",
  },
};

export default App;
