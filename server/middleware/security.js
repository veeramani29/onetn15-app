const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiter for general API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login specific rate limiter
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  message: { error: 'Too many login attempts, please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tiny.cloud"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tiny.cloud"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", "https://cdn.tiny.cloud"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove null bytes and control characters
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/[\x00-\x1F\x7F]/g, '').trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

// Validate slug format (alphanumeric, hyphens, slashes only)
const validateSlug = (req, res, next) => {
  const slugPattern = /^[a-z0-9\-\/]+$/;

  if (req.params.slug && !slugPattern.test(req.params.slug)) {
    return res.status(400).json({ error: 'Invalid slug format' });
  }
  if (req.params.cat && !slugPattern.test(req.params.cat)) {
    return res.status(400).json({ error: 'Invalid category format' });
  }
  if (req.params.subcat && !slugPattern.test(req.params.subcat)) {
    return res.status(400).json({ error: 'Invalid subcategory format' });
  }

  next();
};

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const MAX_BODY_SIZE = '10mb';
  express.json({ limit: MAX_BODY_SIZE })(req, res, () => {
    express.urlencoded({ extended: true, limit: MAX_BODY_SIZE })(req, res, next);
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  loginLimiter,
  securityHeaders,
  sanitizeInput,
  validateSlug,
};
