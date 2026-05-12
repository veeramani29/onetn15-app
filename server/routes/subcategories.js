const express = require('express');
const db = require('../config/database');
const slugify = require('../utils/slugify');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subcategories (optionally filter by category_id)
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;

    let query = 'SELECT * FROM subcategories WHERE 1=1';
    const params = [];

    if (category_id) {
      params.push(category_id);
      query += ` AND category_id = $${params.length}`;
    }

    query += ' ORDER BY sort_order, name';

    const result = await db.query(query, params);
    res.json({ subcategories: result.rows });
  } catch (err) {
    console.error('Get subcategories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single subcategory
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM subcategories WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({ subcategory: result.rows[0] });
  } catch (err) {
    console.error('Get subcategory error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create subcategory
router.post('/', auth, async (req, res) => {
  try {
    const { category_id, name, description } = req.body;

    if (!category_id || !name) {
      return res.status(400).json({ error: 'Category ID and name are required' });
    }

    const slug = slugify(name) + '-' + Date.now();
    const result = await db.query(
      'INSERT INTO subcategories (category_id, name, slug, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [category_id, name, slug, description || '']
    );

    res.status(201).json({ subcategory: result.rows[0] });
  } catch (err) {
    console.error('Create subcategory error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subcategory
router.put('/:id', auth, async (req, res) => {
  try {
    const { category_id, name, description, is_active, sort_order } = req.body;

    const result = await db.query(
      `UPDATE subcategories SET
        category_id = COALESCE($1, category_id),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        is_active = COALESCE($4, is_active),
        sort_order = COALESCE($5, sort_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 RETURNING *`,
      [category_id, name, description, is_active, sort_order, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({ subcategory: result.rows[0] });
  } catch (err) {
    console.error('Update subcategory error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete subcategory
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM subcategories WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json({ message: 'Subcategory deleted successfully' });
  } catch (err) {
    console.error('Delete subcategory error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
