const fs = require('fs');
const path = require('path');

// 1. Load env variables manually from .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      let val = trimmed.substring(eqIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
}

const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const dbUrl = process.env.DATABASE_URL;
const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dbUrl || !sbUrl || !sbKey) {
  console.error('Error: DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY must be configured in .env');
  process.exit(1);
}

// Initialize connections
const pgClient = new Client({
  connectionString: dbUrl,
  ssl: dbUrl.includes('supabase.com') ? { rejectUnauthorized: false } : undefined
});

const supabase = createClient(sbUrl, sbKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function main() {
  await pgClient.connect();
  console.log('Connected to PostgreSQL database');

  const productsDir = path.resolve(__dirname, '../public/products');
  if (!fs.existsSync(productsDir)) {
    console.error('Products directory not found at:', productsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(productsDir);
  console.log(`Found ${files.length} files in public/products/`);

  for (const file of files) {
    if (file === '.DS_Store') continue;

    // Map filename to SAP code. Extends search to get digits before hyphen
    const match = file.match(/^(\d+)/);
    if (!match) {
      console.warn(`Skipping file (could not extract SAP code): ${file}`);
      continue;
    }

    const sapCode = match[1];
    
    // Check if product exists in database
    const dbRes = await pgClient.query('SELECT sap_code, product_name FROM products WHERE sap_code = $1', [sapCode]);
    if (dbRes.rows.length === 0) {
      console.warn(`Skipping file (SAP Code "${sapCode}" not in database): ${file}`);
      continue;
    }

    const productName = dbRes.rows[0].product_name;
    const localFilePath = path.join(productsDir, file);

    console.log(`Migrating: "${productName}" (SAP: ${sapCode}) from ${file}...`);

    try {
      const fileBuffer = fs.readFileSync(localFilePath);

      // Optimize image using sharp
      const optimizedBuffer = await sharp(fileBuffer)
        .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const storageFileName = `${sapCode}.webp`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(storageFileName, optimizedBuffer, {
          contentType: 'image/webp',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(storageFileName);

      const publicUrl = urlData.publicUrl;

      // Update database URL
      await pgClient.query(
        'UPDATE products SET image_url = $1, updated_at = NOW() WHERE sap_code = $2',
        [publicUrl, sapCode]
      );

      console.log(`Successfully migrated SAP ${sapCode} -> ${publicUrl}`);
    } catch (err) {
      console.error(`Error migrating image for ${sapCode}:`, err);
    }
  }

  await pgClient.end();
  console.log('Migration complete');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
