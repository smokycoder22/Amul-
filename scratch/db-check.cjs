const { config } = require('dotenv');
config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const table = await pool.query("SELECT to_regclass('public.products') as table_exists");
    console.log(JSON.stringify(table.rows));

    const cols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='products' ORDER BY ordinal_position"
    );
    console.log(JSON.stringify(cols.rows));

    const count = await pool.query("SELECT COUNT(*)::int AS count FROM products");
    console.log(JSON.stringify(count.rows));

    const sample = await pool.query(
      "SELECT sap_code, product_name, retailer_price FROM products ORDER BY updated_at DESC LIMIT 5"
    );
    console.log(JSON.stringify(sample.rows));
  } finally {
    await pool.end();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
