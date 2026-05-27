require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { apiLimiter, authLimiter, securityHeaders, sanitizeInput, requestSizeLimiter } = require('./middleware/security');

const app = express();
const HOST = process.env.BE_HOST || '0.0.0.0';
const PORT = process.env.BE_PORT || process.env.PORT || 3001;

// Security headers
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request size limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize inputs
app.use(sanitizeInput);

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/subcategories', require('./routes/subcategories'));
app.use('/api/news', require('./routes/news'));
app.use('/api/media', require('./routes/media'));
app.use('/api/navigation', require('./routes/navigation'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React static files for all other routes (SPA fallback)
app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling
app.use((err, req, res, next) => {
  // Don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';
  console.error('Error:', err);
  res.status(500).json({ error: errorMessage });
});

app.listen(PORT, HOST, () => {
  console.log(`[server] Server running on http://${HOST}:${PORT}`);
  console.log(`[server] Host: ${HOST}`);
  console.log(`[server] Port: ${PORT}`);
});
