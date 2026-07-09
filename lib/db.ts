import { Pool, PoolClient } from 'pg'

export function normalizeDatabaseUrl(connectionString?: string): string | undefined {
  if (!connectionString) return undefined

  try {
    const url = new URL(connectionString)
    const password = url.password

    if (password) {
      const decodedPassword = decodeURIComponent(password)
      url.password = decodedPassword
      return url.toString()
    }
  } catch {
    // Fall back to the original string if parsing fails.
  }

  return connectionString
}

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
  ssl: process.env.DATABASE_URL?.includes('supabase.com') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined
})

async function ensureSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS products (
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
    )`,
    `CREATE TABLE IF NOT EXISTS upload_history (
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
    )`,
    `CREATE TABLE IF NOT EXISTS price_changes (
      id serial PRIMARY KEY,
      sap_code text NOT NULL REFERENCES products(sap_code) ON DELETE CASCADE,
      field_name text NOT NULL,
      old_value numeric,
      new_value numeric,
      changed_at timestamptz DEFAULT now(),
      upload_id integer REFERENCES upload_history(id) ON DELETE SET NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
    `CREATE INDEX IF NOT EXISTS idx_price_changes_sap_code ON price_changes(sap_code)`
  ]

  for (const statement of statements) {
    await pool.query(statement)
  }
}

export async function query(text: string, params?: any[]) {
  await ensureSchema().catch((error) => {
    console.error('[v0] Failed to initialize database schema:', error)
  })

  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('[v0] Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error('[v0] Database error:', error)
    throw error
  }
}

export async function getConnection(): Promise<PoolClient> {
  await ensureSchema().catch((error) => {
    console.error('[v0] Failed to initialize database schema:', error)
  })
  return pool.connect()
}

export { pool }
