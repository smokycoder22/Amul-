-- 1. Create products table
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
);

-- Index for category search
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 2. Create upload_history table
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
);

-- 3. Create price_changes table (Audit Log)
CREATE TABLE IF NOT EXISTS price_changes (
  id serial PRIMARY KEY,
  sap_code text NOT NULL REFERENCES products(sap_code) ON DELETE CASCADE,
  field_name text NOT NULL,
  old_value numeric,
  new_value numeric,
  changed_at timestamptz DEFAULT now(),
  upload_id integer REFERENCES upload_history(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_price_changes_sap_code ON price_changes(sap_code);

-- 4. Create admin_login table
CREATE TABLE IF NOT EXISTS admin_login (
  id serial PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  session_token text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed default admin account hash if not exists (username: admin, password: password_hash will be verified server-side)
-- We will handle username/password authentication server-side using env vars, but we keep this structure for session tracking.
INSERT INTO admin_login (username, password_hash)
VALUES ('admin', 'demo_hash')
ON CONFLICT (username) DO NOTHING;

-- 5. Create distributor_sessions table
CREATE TABLE IF NOT EXISTS distributor_sessions (
  id serial PRIMARY KEY,
  phone_number text UNIQUE NOT NULL,
  otp_code text,
  session_token text,
  expires_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed initial 15 products if table is empty
INSERT INTO products (sap_code, product_name, category, mrp_per_unit, mrp_per_crt, retailer_price, cost_to_distributor, gst, cost_after_gst, image_url)
VALUES
  ('001', 'Amul Taaza Toned Milk 500ml Pouch', 'Milk', 27.00, 324.00, 25.50, 23.50, 0, 23.50, '001-taaza-500ml.webp'),
  ('002', 'Amul Taaza Toned Milk 1L Pouch', 'Milk', 54.00, 648.00, 51.00, 47.00, 0, 47.00, '002-taaza-1l.webp'),
  ('003', 'Amul Slim & Trim Double Toned Milk 500ml', 'Milk', 25.00, 300.00, 23.50, 21.50, 0, 21.50, '003-slim-500ml.webp'),
  ('004', 'Amul Slim & Trim Double Toned Milk 1L', 'Milk', 48.00, 576.00, 45.00, 41.00, 0, 41.00, '004-slim-1l.webp'),
  ('005', 'Amul Gold Full Cream Milk 500ml', 'Milk', 33.00, 396.00, 31.00, 28.50, 0, 28.50, '005-gold-500ml.webp'),
  ('006', 'Amul Gold Full Cream Milk 1L', 'Milk', 66.00, 792.00, 62.00, 57.00, 0, 57.00, '006-gold-1l.webp'),
  ('101', 'Amul Masti Spiced Buttermilk 200ml', 'Buttermilk', 15.00, 360.00, 13.50, 10.54, 12, 11.80, '101-buttermilk-200ml.webp'),
  ('102', 'Amul Masti Spiced Buttermilk 400ml', 'Buttermilk', 30.00, 720.00, 27.00, 21.08, 12, 23.60, '102-buttermilk-400ml.webp'),
  ('103', 'Amul Masti Spiced Buttermilk 1L', 'Buttermilk', 70.00, 840.00, 63.00, 49.19, 12, 55.10, '103-buttermilk-1l.webp'),
  ('201', 'Amul Premium Paneer 200g Pack', 'Paneer', 90.00, 3600.00, 80.00, 68.00, 5, 71.40, '201-paneer-200g.webp'),
  ('202', 'Amul Premium Paneer 400g Pack', 'Paneer', 180.00, 3600.00, 160.00, 136.00, 5, 142.80, '202-paneer-400g.webp'),
  ('203', 'Amul Premium Paneer 500g Pack', 'Paneer', 220.00, 4400.00, 195.00, 165.71, 5, 174.00, '203-paneer-500g.webp'),
  ('301', 'Amul Masti Dahi 200g Cup', 'Dahi', 25.00, 1000.00, 22.00, 19.50, 0, 19.50, '301-dahi-200g.webp'),
  ('302', 'Amul Masti Dahi 400g Cup', 'Dahi', 50.00, 1000.00, 44.00, 39.00, 0, 39.00, '302-dahi-400g.webp'),
  ('303', 'Amul Masti Dahi 1kg Bucket', 'Dahi', 120.00, 1200.00, 105.00, 92.50, 0, 92.50, '303-dahi-1kg.webp')
ON CONFLICT (sap_code) DO NOTHING;

