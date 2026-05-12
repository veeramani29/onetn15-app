import "../App.css";
import ServiceSidebar from "../components/ServiceSidebar";

const aiProducts = [
  "OneTN AI Analytics Suite",
  "Predictive Maintenance Engine",
  "Conversational Helpdesk Bot",
  "Retail Demand Forecaster",
  "Vision-based Quality Inspector",
  "Document Intelligence Extractor",
  "Marketing Campaign Optimizer",
  "AI-Powered Personalization Hub",
];

function Products() {
  return (
    <main className="product-main" id="main-content">
      <h1 className="page-heading">AI Products</h1>
      <p className="page-text">
        Pre-built AI solutions ready to deploy. Accelerate your AI journey with our proven product suite.
      </p>
      <ul className="card-grid">
        {aiProducts.map((product, index) => (
          <li key={index} className="card-grid-item">
            <span className="card-icon" aria-hidden="true">🚀</span>
            <span className="card-text">{product}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default Products;
