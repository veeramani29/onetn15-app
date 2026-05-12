const express = require('express');
const db = require('../config/database');
const slugify = require('../utils/slugify');
const auth = require('../middleware/auth');

const router = express.Router();

// Validate slug format - alphanumeric, hyphens, and forward slashes only
const validateSlugParam = (req, res, next) => {
  const slug = req.params[0];
  // Allow letters, numbers, hyphens, and forward slashes
  const slugPattern = /^[a-zA-Z0-9\-\/]+$/;

  if (slug && !slugPattern.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug format' });
  }
  next();
};

// Validate ID parameter
const validateIdParam = (req, res, next) => {
  const id = req.params.id;
  const idPattern = /^\d+$/;

  if (id && !idPattern.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

// Get all news (with pagination) - also used as top news
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, status = 'published' } = req.query;
    const offset = (page - 1) * limit;

    const params = [];
    const conditions = [];

    let query = `SELECT n.id, n.title, n.slug, n.excerpt, n.author, n.status, n.published_at, n.created_at,
                 c.slug as category_slug, c.name as category_name,
                 s.slug as subcategory_slug, s.name as subcategory_name
                 FROM news n
                 LEFT JOIN categories c ON n.category_id = c.id
                 LEFT JOIN subcategories s ON n.subcategory_id = s.id`;
    let countQuery = 'SELECT COUNT(*) FROM news n';

    if (category_id) {
      params.push(category_id);
      conditions.push(`n.category_id = $${params.length}`);
    }

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`n.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` ORDER BY n.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [newsResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, conditions.length > 0 ? params.slice(0, -2) : []),
    ]);

    res.json({
      news: newsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (err) {
    console.error('Get news error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single news by slug (handles slashes in slug)
router.get('/slug/*', validateSlugParam, async (req, res) => {
  try {
    const slug = req.params[0]; // everything after /slug/
    // Try exact match first, then match by the last part of the slug
    const result = await db.query(
      `SELECT n.*, c.name as category_name, s.name as subcategory_name
       FROM news n
       LEFT JOIN categories c ON n.category_id = c.id
       LEFT JOIN subcategories s ON n.subcategory_id = s.id
       WHERE (n.slug = $1 OR n.slug = $2) AND n.status = 'published'
       LIMIT 1`,
      [slug, slug.split('/').pop()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json({ news: result.rows[0] });
  } catch (err) {
    console.error('Get news by slug error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single news (by id)
router.get('/:id', validateIdParam, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, c.name as category_name, s.name as subcategory_name
       FROM news n
       LEFT JOIN categories c ON n.category_id = c.id
       LEFT JOIN subcategories s ON n.subcategory_id = s.id
       WHERE n.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json({ news: result.rows[0] });
  } catch (err) {
    console.error('Get news error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create news
router.post('/', auth, async (req, res) => {
  try {
    const { category_id, subcategory_id, title, slug, excerpt, content, author, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const finalSlug = slug && slug.trim() ? slug.trim() : await generateSlug(title, category_id, subcategory_id);
    const publishedAt = status === 'published' ? 'CURRENT_TIMESTAMP' : 'NULL';

    const result = await db.query(
      `INSERT INTO news (category_id, subcategory_id, title, slug, excerpt, content, author, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ${publishedAt}) RETURNING *`,
      [category_id || null, subcategory_id || null, title, finalSlug, excerpt || '', content || '', author || '', status || 'draft']
    );

    res.status(201).json({ news: result.rows[0] });
  } catch (err) {
    console.error('Create news error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update news
router.put('/:id', auth, async (req, res) => {
  try {
    const { category_id, subcategory_id, title, slug, excerpt, content, author, status } = req.body;

    // Get current news to check if publishing
    const current = await db.query('SELECT status FROM news WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    const wasDraft = current.rows[0].status === 'draft';
    const isPublishing = status === 'published' && wasDraft;

    // If slug is provided and different, use it; otherwise keep existing
    let finalSlug;
    if (slug !== undefined && slug.trim()) {
      finalSlug = slug.trim();
    }

    const result = await db.query(
      `UPDATE news SET
        category_id = COALESCE($1, category_id),
        subcategory_id = COALESCE($2, subcategory_id),
        title = COALESCE($3, title),
        slug = COALESCE($4, slug),
        excerpt = COALESCE($5, excerpt),
        content = COALESCE($6, content),
        author = COALESCE($7, author),
        status = COALESCE($8, status),
        published_at = CASE WHEN $9::boolean THEN CURRENT_TIMESTAMP ELSE published_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 RETURNING *`,
      [category_id, subcategory_id, title, finalSlug, excerpt, content, author, status, isPublishing, req.params.id]
    );

    res.json({ news: result.rows[0] });
  } catch (err) {
    console.error('Update news error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete news
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM news WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (err) {
    console.error('Delete news error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// Helper function to generate unique slug
async function generateSlug(title, categoryId, subcategoryId) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  // Get category and subcategory slugs if available
  let categorySlug = '';
  let subcategorySlug = '';

  if (categoryId) {
    const catResult = await db.query('SELECT slug FROM categories WHERE id = $1', [categoryId]);
    if (catResult.rows.length > 0) {
      categorySlug = catResult.rows[0].slug;
    }
  }

  if (subcategoryId) {
    const subResult = await db.query('SELECT slug FROM subcategories WHERE id = $1', [subcategoryId]);
    if (subResult.rows.length > 0) {
      subcategorySlug = subResult.rows[0].slug;
    }
  }

  // Build the full slug: [category]/[subcategory]/[title]
  const parts = [];
  if (categorySlug) parts.push(categorySlug);
  if (subcategorySlug) parts.push(subcategorySlug);
  parts.push(baseSlug);
  slug = parts.join('/');

  // Check for uniqueness and append counter if needed
  while (true) {
    const result = await db.query('SELECT id FROM news WHERE slug = $1', [slug]);
    if (result.rows.length === 0) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
