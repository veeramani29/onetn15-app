const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Validate ID parameter
const validateIdParam = (req, res, next) => {
  const id = req.params.id;
  const idPattern = /^\d+$/;
  if (id && !idPattern.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

// Get all media items
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const offset = (page - 1) * limit;

    const params = [];
    const conditions = [];

    let query = 'SELECT * FROM media';
    let countQuery = 'SELECT COUNT(*) FROM media';

    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [mediaResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, conditions.length > 0 ? params.slice(0, -2) : []),
    ]);

    res.json({
      media: mediaResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (err) {
    console.error('Get media error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single media
router.get('/:id', validateIdParam, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM media WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({ media: result.rows[0] });
  } catch (err) {
    console.error('Get media error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create media
router.post('/', auth, async (req, res) => {
  try {
    const { title, type, url, file_path, thumbnail, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!type || !['article', 'video'].includes(type)) {
      return res.status(400).json({ error: 'Type must be article or video' });
    }

    if (!url && !file_path) {
      return res.status(400).json({ error: 'Either URL or file upload is required' });
    }

    const result = await db.query(
      `INSERT INTO media (title, type, url, file_path, thumbnail, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, type, url || null, file_path || null, thumbnail || null, description || '', status || 'draft']
    );

    res.status(201).json({ media: result.rows[0] });
  } catch (err) {
    console.error('Create media error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update media
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, type, url, file_path, thumbnail, description, status } = req.body;

    const result = await db.query(
      `UPDATE media SET
        title = COALESCE($1, title),
        type = COALESCE($2, type),
        url = COALESCE($3, url),
        file_path = COALESCE($4, file_path),
        thumbnail = COALESCE($5, thumbnail),
        description = COALESCE($6, description),
        status = COALESCE($7, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 RETURNING *`,
      [title, type, url, file_path, thumbnail, description, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({ media: result.rows[0] });
  } catch (err) {
    console.error('Update media error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete media
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM media WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({ message: 'Media deleted successfully' });
  } catch (err) {
    console.error('Delete media error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
