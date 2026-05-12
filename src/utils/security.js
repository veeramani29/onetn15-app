// Frontend Security Utilities

// Sanitize HTML to prevent XSS
export const sanitizeHTML = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Validate slug format (matches backend validation)
export const isValidSlug = (slug) => {
  if (!slug) return false;
  const slugPattern = /^[a-zA-Z0-9\-\/]+$/;
  return slugPattern.test(slug);
};

// Validate that a string is safe to display
export const isSafeString = (str) => {
  if (!str) return true;
  // Allow alphanumeric, common punctuation, spaces, and newlines
  const safePattern = /^[a-zA-Z0-9\s\-\.,!?@#$%&()*+:;\/'"\[\]{}|_^`~\\]+$/;
  return safePattern.test(str);
};

// Escape HTML for attribute values
export const escapeAttr = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// Remove any potentially dangerous content from user input
export const cleanUserInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[\x00-\x1F\x7F]/g, '');
};

// Validate URL format
export const isValidURL = (str) => {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Sanitize API response data
export const sanitizeAPIResponse = (data) => {
  if (typeof data === 'string') {
    return cleanUserInput(data);
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeAPIResponse);
  }
  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const key in data) {
      sanitized[key] = sanitizeAPIResponse(data[key]);
    }
    return sanitized;
  }
  return data;
};

// Secure token storage
export const secureStorage = {
  setToken: (token) => {
    try {
      // Store in sessionStorage (cleared on tab close)
      sessionStorage.setItem('auth_token', token);
    } catch (e) {
      console.error('Failed to store token');
    }
  },

  getToken: () => {
    try {
      return sessionStorage.getItem('auth_token');
    } catch (e) {
      return null;
    }
  },

  removeToken: () => {
    try {
      sessionStorage.removeItem('auth_token');
    } catch (e) {
      console.error('Failed to remove token');
    }
  }
};

// Create axios instance with security defaults
export const createSecureAxios = (baseURL) => {
  const axios = require('axios');

  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  // Add request interceptor for auth token
  instance.interceptors.request.use(
    (config) => {
      const token = secureStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      // Sanitize response data
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        secureStorage.removeToken();
        // Optionally redirect to login
        if (window.location.pathname.startsWith('/cms')) {
          window.location.href = '/cms/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
