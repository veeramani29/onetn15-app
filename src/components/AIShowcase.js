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

function AIShowcase() {
  return (
    <section style={styles.section}>
      <div style={styles.columns}>
        <div style={styles.column}>
          <h2 style={styles.heading}>Our AI Services</h2>
          <nav style={styles.nav}>
            {aiServices.map((service, index) => (
              <a key={index} href="/services" style={styles.navItem}>
                <span style={styles.navIcon}>⚡</span>
                <span style={styles.navText}>{service}</span>
                <span style={styles.navArrow}>&rsaquo;</span>
              </a>
            ))}
          </nav>
          <a href="/services" style={styles.cta}>Explore AI Services</a>
        </div>
        <div style={styles.divider}></div>
        <div style={styles.column}>
          <h2 style={styles.heading}>Our AI Products</h2>
          <nav style={styles.nav}>
            {aiProducts.map((product, index) => (
              <a key={index} href="/products" style={styles.navItem}>
                <span style={styles.navIcon}>🚀</span>
                <span style={styles.navText}>{product}</span>
                <span style={styles.navArrow}>&rsaquo;</span>
              </a>
            ))}
          </nav>
          <a href="/products" style={styles.cta}>View AI Products</a>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "40px 0",
    borderTop: "2px solid #dc3545",
    marginTop: 40,
  },
  columns: {
    display: "flex",
    gap: 0,
  },
  column: {
    flex: 1,
  },
  divider: {
    width: "1px",
    backgroundColor: "#ffcccc",
    margin: "0 40px",
  },
  heading: {
    fontSize: 22,
    color: "#dc3545",
    marginBottom: 20,
    marginTop: 0,
    fontWeight: 700,
    paddingBottom: 10,
    borderBottom: "2px solid #dc3545",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 24,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    backgroundColor: "#fff",
    borderRadius: 8,
    border: "1px solid #ffcccc",
    textDecoration: "none",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  navIcon: {
    fontSize: 18,
    flexShrink: 0,
  },
  navText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: 500,
  },
  navArrow: {
    fontSize: 18,
    color: "#dc3545",
    fontWeight: "bold",
  },
  cta: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#dc3545",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    transition: "background-color 0.2s",
  },
};

export default AIShowcase;