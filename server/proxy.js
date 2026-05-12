const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();
const PORT = 3000;

// Create proxy
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3001',
  changeOrigin: true,
  preserveHeaderKeyCase: true,
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  if (res && !res.headersSent) {
    res.status(500).send('Proxy error');
  }
});

// Proxy ALL requests to backend if they start with /api
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log('Proxying:', req.method, req.url);
    proxy.web(req, res);
  } else {
    next();
  }
});

// SPA fallback
app.use(history());

// Serve static files
app.use(express.static(path.join(__dirname, '../build')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
