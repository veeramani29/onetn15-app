function slugify(text) {
  if (!text) return '';

  // Convert to string and handle Unicode normalization
  let slug = text.toString();

  // Replace spaces with hyphens first
  slug = slug.replace(/\s+/g, '-');

  // Handle Unicode characters - keep letters/numbers from any language
  // Replace non-ASCII/non-alphanumeric with empty string but keep hyphens
  slug = slug.replace(/[^\p{L}\p{N}\-]+/gu, '');

  // Replace multiple hyphens with single hyphen
  slug = slug.replace(/\-\-+/g, '-');

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+/, '').replace(/-+$/, '');

  return slug.toLowerCase();
}

module.exports = slugify;
