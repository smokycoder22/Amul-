const { config } = require('dotenv');
config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        sap_code text PRIMARY KEY,
        product_name text NOT NULL,
        category text NOT NULL DEFAULT 'Others',
        mrp_per_unit numeric,
        mrp_per_crt numeric,
        retailer_price numeric,
        cost_to_distributor numeric,
        gst numeric,
        cost_after_gst numeric,
        image_url text,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS upload_history (
        id serial PRIMARY KEY,
        uploaded_at timestamptz DEFAULT now(),
        original_file_name text NOT NULL,
        total_rows integer NOT NULL,
        valid_rows integer NOT NULL,
        invalid_rows integer NOT NULL,
        inserted_count integer NOT NULL,
        updated_count integer NOT NULL,
        status text NOT NULL,
        error_summary text
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS price_changes (
        id serial PRIMARY KEY,
        sap_code text NOT NULL REFERENCES products(sap_code) ON DELETE CASCADE,
        field_name text NOT NULL,
        old_value numeric,
        new_value numeric,
        changed_at timestamptz DEFAULT now(),
        upload_id integer REFERENCES upload_history(id) ON DELETE SET NULL
      )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_price_changes_sap_code ON price_changes(sap_code)`);

    console.log('schema created');
  } finally {
    await pool.end();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
