import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { sanitizeAPIResponse } from "../utils/security";
import "../App.css";
import ServiceSidebar from "../components/ServiceSidebar";

function NewsPost({ id, title, slug, category_slug, subcategory_slug, published_at, author, excerpt }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Build proper URL: /news/category_slug/subcategory_slug/slug
  // Slug from DB may be just "article-slug" or "category/subcategory/article-slug"
  let newsUrl;
  if (slug) {
    const slugParts = slug.split('/');
    if (slugParts.length > 1 && category_slug && subcategory_slug) {
      // Slug contains path AND we have category info - extract just article slug
      const newsSlug = slugParts[slugParts.length - 1];
      newsUrl = `/news/${category_slug}/${subcategory_slug}/${newsSlug}`;
    } else if (slugParts.length > 1) {
      // Slug contains path but no category info - use directly
      newsUrl = `/news/${slug}`;
    } else {
      // Simple slug - use as is
      newsUrl = `/news/${slug}`;
    }
  } else {
    newsUrl = '/';
  }

  return (
    <article className="post">
      <h2 className="post-title">{title}</h2>
      <div className="post-meta">
        <time dateTime={published_at}>{formatDate(published_at)}</time> | <span>By {author}</span>
      </div>
      <p className="post-excerpt">{excerpt}</p>
      <Link to={newsUrl} className="read-more">
        Read More &raquo;
      </Link>
    </article>
  );
}

function Home() {
  const [news, setNews] = useState([]);
  const [navigation, setNavigation] = useState({ categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [newsRes, navRes] = await Promise.all([
          axios.get("/api/news"),
          axios.get("/api/navigation"),
        ]);
        // Sanitize response data
        const sanitizedNews = sanitizeAPIResponse(newsRes.data.news || []);
        const sanitizedNav = sanitizeAPIResponse(navRes.data);
        setNews(sanitizedNews);
        setNavigation(sanitizedNav);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="about-layout">
      <aside className="layout-sidebar-left" aria-label="Services">
        <ServiceSidebar categories={navigation.categories || []} title="Latest News" isNavigation />
      </aside>

      <main className="about-main" id="main-content">
        {loading && <p>Loading news...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && news.length === 0 && (
          <p>No news articles available.</p>
        )}
        {news.map((post) => (
          <NewsPost key={post.id} {...post} />
        ))}
      </main>

      <aside className="layout-sidebar-right" aria-label="Products">
        <ServiceSidebar categories={[]} title="Media" />
      </aside>
    </div>
  );
}

export default Home;
