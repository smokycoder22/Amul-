const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const pool = new Pool({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function fix() {
  console.log('--- 1. Ensuring TONCP23.webp exists in bucket ---');
  const { data: copyData, error: copyErr } = await sb.storage.from('product-images').copy('TONCP24.webp', 'TONCP23.webp');
  if (copyErr) {
    console.log('Copy result (or already exists):', copyErr.message);
  } else {
    console.log('Copied TONCP24.webp -> TONCP23.webp successfully');
  }

  console.log('\n--- 2. Checking FCLIP09 in DB ---');
  const fRes = await pool.query("SELECT sap_code, product_name, category, image_url FROM products WHERE sap_code = 'FCLIP09'");
  if (fRes.rows.length > 0) {
    console.log('FCLIP09:', fRes.rows[0]);
    const goldImg = 'https://hviwnuaezzwywlozbmzy.supabase.co/storage/v1/object/public/product-images/FCLCP01.webp';
    await pool.query("UPDATE products SET image_url = $1 WHERE sap_code = 'FCLIP09'", [goldImg]);
    console.log('Updated FCLIP09 image_url to Gold Milk image');
  }

  console.log('\n--- 3. Verifying all products in DB ---');
  const allRes = await pool.query("SELECT count(*) as total, count(image_url) as with_images FROM products");
  console.log('Products status:', allRes.rows[0]);

  pool.end();
}

fix().catch(console.error);
