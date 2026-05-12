require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function setup() {
  try {
    console.log('Setting up database...');

    // Create admin user with proper bcrypt hash
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    // Check if admin exists
    const existing = await db.query('SELECT id FROM users WHERE username = $1', ['admin']);

    if (existing.rows.length === 0) {
      await db.query(
        'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)',
        ['admin', hash, 'admin@onetn15.com']
      );
      console.log('Admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists. Updating password...');
      await db.query('UPDATE users SET password = $1 WHERE username = $2', [hash, 'admin']);
      console.log('Admin password updated!');
    }

    console.log('Database setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Setup error:', err);
    process.exit(1);
  }
}

setup();
