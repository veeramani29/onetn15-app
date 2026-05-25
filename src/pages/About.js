import { useState, useEffect } from "react";
import axios from "axios";
import { sanitizeAPIResponse } from "../utils/security";
import ServiceSidebar from "../components/ServiceSidebar";

function About() {
  const [navigation, setNavigation] = useState({ categories: [] });

  useEffect(() => {
    async function fetchNavigation() {
      try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || '';
        const res = await axios.get(`${apiBase}/api/navigation`);
        // Sanitize response data
        const sanitizedData = sanitizeAPIResponse(res.data);
        setNavigation(sanitizedData);
      } catch (err) {
        console.error("Failed to fetch navigation:", err);
      }
    }
    fetchNavigation();
  }, []);

  return (
    <div className="about-layout">
      <aside className="layout-sidebar-left" aria-label="Services">
        <ServiceSidebar categories={navigation.categories || []} title="Latest News" isNavigation />
      </aside>
      <main className="about-main" id="main-content">
        <h1 className="page-heading">About Us</h1>
        <p className="page-text">
          Welcome to ONETN15, your premier source for the latest news and insights
          in technology. Our mission is to deliver timely, accurate, and engaging
          content to tech enthusiasts, professionals, and curious minds alike.
        </p>
        <p className="page-text">
          Founded in 2024, ONETN15 brings together a passionate team of writers,
          editors, and tech experts dedicated to covering innovations,
          breakthroughs, and trends shaping our digital future.
        </p>
        <p className="page-text">
          We believe in the power of technology to transform lives and strive to
          provide clear, insightful articles that inform and inspire.
        </p>
      </main>
      <aside className="layout-sidebar-right" aria-label="Products">
        <ServiceSidebar categories={[]} title="Media" />
      </aside>
    </div>
  );
}

export default About;
