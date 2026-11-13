const fs = require('fs');
const { Pool } = require('pg');

const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach(l => {
  const eq = l.indexOf('=');
  if (eq > 0) {
    const k = l.slice(0, eq).trim();
    let v = l.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
});

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const res = await pool.query('SELECT sap_code, product_name, category, image_url FROM products ORDER BY category, sap_code');
  console.log(`Total products: ${res.rows.length}`);
  res.rows.forEach(r => {
    console.log(`${r.sap_code.padEnd(12)} | ${r.category.padEnd(12)} | ${(r.image_url || 'NO_IMAGE').slice(0, 80)}`);
  });
  pool.end();
}

run();
