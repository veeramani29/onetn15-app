-- ONETN15 CMS Database Schema

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table (top-level)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table (belongs to category)
CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News/Content table
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    author VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media table (Articles and Videos)
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('article', 'video')),
    url TEXT,
    file_path TEXT,
    thumbnail TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_news_subcategory ON news(subcategory_id);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_created ON news(created_at DESC);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_status ON media(status);

-- Insert default admin user (password: admin123)
-- Note: Run setup.js to create user with proper bcrypt hash
-- or manually insert with a valid bcrypt hash

-- Insert sample categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('AI Strategy', 'ai-strategy', 'AI Strategy and Roadmap services', 1),
('Development', 'development', 'Custom development services', 2),
('Operations', 'operations', 'AI Ops and monitoring services', 3),
('Staffing', 'staffing', 'Staff augmentation services', 4);

-- Insert sample subcategories
INSERT INTO subcategories (category_id, name, slug, description, sort_order) VALUES
(1, 'AI Strategy & Roadmap', 'ai-strategy-roadmap', 'Strategic AI planning and roadmap development', 1),
(1, 'Governance & Compliance', 'governance-compliance', 'AI governance and compliance consulting', 2),
(1, 'Responsible AI', 'responsible-ai', 'Responsible AI implementation', 3),
(2, 'Data Engineering & Pipelines', 'data-engineering-pipelines', 'Data pipeline development', 1),
(2, 'Custom Model Development', 'custom-model-development', 'Custom ML/DL model development', 2),
(2, 'Prompt Engineering', 'prompt-engineering', 'LLM prompt engineering', 3),
(3, 'AI Ops & Monitoring', 'ai-ops-monitoring', 'AI operations and monitoring', 1),
(3, 'MLOps Platform Setup', 'mlops-platform-setup', 'MLOps platform implementation', 2),
(4, 'Staff Augmentation / AI Pods', 'staff-augmentation-ai-pods', 'AI staff augmentation services', 1);

-- Insert sample news
INSERT INTO news (category_id, subcategory_id, title, slug, excerpt, content, author, status, published_at) VALUES
(1, 1, 'Latest Tech Innovations of 2024', 'latest-tech-innovations-2024', 'Explore the groundbreaking technologies shaping the future including AI, quantum computing, and more.', 'The year 2024 has brought unprecedented technological advancements...', 'Jane Doe', 'published', CURRENT_TIMESTAMP),
(1, 1, '5G Transforming Connectivity Worldwide', '5g-transforming-connectivity-worldwide', 'A deep dive into the impact of 5G technology on communication, industry, and daily life.', 'The global rollout of 5G networks is revolutionizing...', 'John Smith', 'published', CURRENT_TIMESTAMP),
(2, 2, 'Top Programming Languages to Learn in 2024', 'top-programming-languages-2024', 'Discover the most popular and in-demand programming languages for developers this year.', 'The programming landscape in 2024 offers exciting opportunities...', 'Alice Johnson', 'published', CURRENT_TIMESTAMP),
(1, NULL, 'Draft Article Example', 'draft-article-example', 'This is a draft article for testing purposes.', 'Draft content here...', 'Admin', 'draft', NULL);
