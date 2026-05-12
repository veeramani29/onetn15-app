import "../App.css";
import ServiceSidebar from "../components/ServiceSidebar";

const aiServices = [
  "AI Strategy & Roadmap",
  "Data Engineering & Pipelines",
  "Custom Model Development (NLP/CV)",
  "AI Ops & Monitoring",
  "MLOps Platform Setup",
  "Governance, Compliance & Responsible AI",
  "Staff Augmentation / AI Pods",
  "Prompt Engineering & OpenAI Integration",
];

function Services() {
  return (
    <main className="service-main" id="main-content">
      <h1 className="page-heading">AI Services</h1>
      <p className="page-text">
        Transform your business with our comprehensive AI services. From strategy to implementation, we deliver enterprise-grade AI solutions.
      </p>
      <ul className="card-grid">
        {aiServices.map((service, index) => (
          <li key={index} className="card-grid-item">
            <span className="card-icon" aria-hidden="true">⚡</span>
            <span className="card-text">{service}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default Services;
