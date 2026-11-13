const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envPath = path.join(__dirname, '../.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.substring(0, eq).trim();
      let val = trimmed.substring(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      env[key] = val;
    }
  });
}

async function main() {
  console.log('=== TESTING SUPABASE CONNECTION ===');
  console.log('Project URL:', env.NEXT_PUBLIC_SUPABASE_URL);

  // 1. Test Supabase Storage
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      console.log('\n--- 1. Testing Storage Bucket ---');
      const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
      if (bErr) {
        console.error('Storage bucket listing failed:', bErr.message);
      } else {
        console.log('Buckets found:', buckets.map(b => b.name));
        const { data: files, error: fErr } = await supabase.storage.from('product-images').list();
        if (fErr) {
          console.error('Failed to list files in "product-images":', fErr.message);
        } else {
          console.log(`Files in "product-images" (${files.length}):`);
          files.slice(0, 15).forEach(f => console.log(' -', f.name, `(${f.metadata?.size || 'unknown'} bytes)`));
        }
      }
    } catch (e) {
      console.error('Storage exception:', e.message);
    }
  }

  // 2. Test PostgreSQL Database
  if (env.DATABASE_URL) {
    console.log('\n--- 2. Testing Database Connection ---');
    const pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000
    });

    try {
      const client = await pool.connect();
      console.log('Connected to PostgreSQL successfully!');

      // Check products table
      const pRes = await client.query('SELECT count(*) FROM products');
      console.log('Total products in DB:', pRes.rows[0].count);

      // Check products with image_url
      const imgRes = await client.query('SELECT sap_code, product_name, image_url FROM products WHERE image_url IS NOT NULL LIMIT 10');
      console.log(`Sample products with image_url (${imgRes.rows.length}):`);
      imgRes.rows.forEach(r => console.log(`  ${r.sap_code}: ${r.product_name} -> ${r.image_url}`));

      // Check admin_login table
      const aRes = await client.query('SELECT count(*), array_agg(username) as users FROM admin_login');
      console.log('Admin users in DB:', aRes.rows[0]);

      client.release();
    } catch (e) {
      console.error('Database query failed:', e.message);
    } finally {
      await pool.end();
    }
  }
}

main().catch(console.error);
