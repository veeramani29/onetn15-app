const express = require('express');
const db = require('../config/database');
const slugify = require('../utils/slugify');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY sort_order, name'
    );
    res.json({ categories: result.rows });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category: result.rows[0] });
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create category
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const slug = slugify(name) + '-' + Date.now();
    const result = await db.query(
      'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, description || '']
    );

    res.status(201).json({ category: result.rows[0] });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, is_active, sort_order } = req.body;

    const result = await db.query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        is_active = COALESCE($3, is_active),
        sort_order = COALESCE($4, sort_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 RETURNING *`,
      [name, description, is_active, sort_order, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category: result.rows[0] });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
