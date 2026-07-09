const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envPath = path.join(__dirname, '../.env');
let connectionString = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('DATABASE_URL=')) {
      connectionString = line.split('DATABASE_URL=')[1].replace(/"/g, '').trim();
    }
  }
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase.com') ? { rejectUnauthorized: false } : undefined
});

pool.query('SELECT sap_code, product_name, category, image_url FROM products', (err, res) => {
  if (err) {
    console.error('Error fetching products:', err);
  } else {
    console.log(`Fetched ${res.rows.length} products:`);
    console.log(res.rows);
  }
  pool.end();
});
