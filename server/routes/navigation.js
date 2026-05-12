const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get categories with subcategories and news
router.get('/', async (req, res) => {
  try {
    // Get all active categories
    const categoriesResult = await db.query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY sort_order, name'
    );

    const categories = categoriesResult.rows;

    // For each category, get subcategories and news
    for (const category of categories) {
      // Get subcategories for this category
      const subcategoriesResult = await db.query(
        'SELECT * FROM subcategories WHERE category_id = $1 AND is_active = true ORDER BY sort_order, name',
        [category.id]
      );

      const subcategories = subcategoriesResult.rows;

      // For each subcategory, get published news
      for (const subcategory of subcategories) {
        const newsResult = await db.query(
          `SELECT n.id, n.title, n.slug, n.excerpt, n.author, n.published_at,
                  c.slug as category_slug, s.slug as subcategory_slug
           FROM news n
           LEFT JOIN categories c ON n.category_id = c.id
           LEFT JOIN subcategories s ON n.subcategory_id = s.id
           WHERE n.subcategory_id = $1 AND n.status = 'published'
           ORDER BY n.published_at DESC NULLS LAST`,
          [subcategory.id]
        );
        subcategory.news = newsResult.rows;
      }

      // Get news for this category (without subcategory)
      const categoryNewsResult = await db.query(
        `SELECT n.id, n.title, n.slug, n.excerpt, n.author, n.published_at,
                c.slug as category_slug
         FROM news n
         LEFT JOIN categories c ON n.category_id = c.id
         WHERE n.category_id = $1 AND n.subcategory_id IS NULL AND n.status = 'published'
         ORDER BY n.published_at DESC NULLS LAST`,
        [category.id]
      );

      category.subcategories = subcategories;
      category.news = categoryNewsResult.rows;
    }

    res.json({ categories });
  } catch (err) {
    console.error('Get navigation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
