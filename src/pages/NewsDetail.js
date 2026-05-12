import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { isValidSlug, sanitizeAPIResponse } from "../utils/security";
import "../App.css";

function NewsDetail() {
  const { cat, subcat, slug } = useParams();
  const fullSlug = `${cat}/${subcat}/${slug}`;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    async function fetchNews() {
      // Validate slug before making request
      if (!isValidSlug(fullSlug)) {
        setError("Invalid article path");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/news/slug/${encodeURIComponent(fullSlug)}`);
        // Sanitize response data
        const sanitizedData = sanitizeAPIResponse(res.data.news);
        setPost(sanitizedData);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError("Article not found");
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [fullSlug]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (!window.speechSynthesis) {
      alert("Your browser doesn't support text-to-speech");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if (!post || !post.content) return;

      window.speechSynthesis.cancel();

      const text = `${post.title}. ${post.content}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  if (loading) {
    return (
      <main className="page-main article-left">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p className="loader-text">Loading article...</p>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="page-main article-left">
        <div className="error-container">
          <h1 className="page-heading">Article Not Found</h1>
          <p className="error-message">{error}</p>
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </main>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="page-main article-left">
      <Link to="/" className="back-link">← Back to Home</Link>
      <article className="article">
        {post.category_name && (
          <span className="article-category">{post.category_name}</span>
        )}
        <h1 className="article-title">{post.title}</h1>
        <div className="article-meta">
          <time dateTime={post.published_at || post.created_at}>
            {formatDate(post.published_at || post.created_at)}
          </time>
          {post.author && (
            <>
              <span> | </span>
              <span>By {post.author}</span>
            </>
          )}
        </div>
        <div className="audio-controls">
          <button
            onClick={toggleSpeech}
            className="btn btn-primary audio-btn"
            aria-label={isPlaying ? "Pause article" : "Listen to article"}
          >
            {isPlaying ? "⏸ Pause" : "▶ Listen to Article"}
          </button>
        </div>
        <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content || "" }} />
      </article>
    </main>
  );
}

export default NewsDetail;
