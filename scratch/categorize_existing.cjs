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

function determineCategory(productName, originalCategory) {
  const name = productName.toLowerCase();
  const category = originalCategory.toLowerCase();

  // 1. Buttermilk/Chaas (Check this first so "buttermilk" is not classified as "Butter" or "Milk")
  if (name.includes('buttermilk') || name.includes('chaas') || name.includes('lassi') ||
      category.includes('buttermilk') || category.includes('chaas') || category.includes('lassi')) {
    return 'Buttermilk';
  }

  // 2. Dahi/Curd
  if (name.includes('dahi') || name.includes('curd') ||
      category.includes('dahi') || category.includes('curd')) {
    return 'Dahi';
  }

  // 3. Paneer
  if (name.includes('paneer') ||
      category.includes('paneer')) {
    return 'Paneer';
  }

  // 4. Butter
  if (name.includes('butter') ||
      category.includes('butter')) {
    return 'Butter';
  }

  // 5. Cheese
  if (name.includes('cheese') ||
      category.includes('cheese')) {
    return 'Cheese';
  }

  // 6. Yogurt
  if (name.includes('yogurt') || name.includes('yoghurt') || name.includes('sfy') ||
      category.includes('yogurt') || category.includes('yoghurt') || category.includes('sfy')) {
    return 'Yogurt';
  }

  // 7. Milk
  if (name.includes('milk') || name.includes('taaza') || name.includes('gold') || name.includes('cow') || name.includes('buffalo') || name.includes('slim') ||
      category.includes('milk') || category.includes('taaza') || category.includes('gold') || category.includes('cow') || category.includes('buffalo') || category.includes('slim')) {
    return 'Milk';
  }

  return 'Others';
}

pool.query('SELECT sap_code, product_name, category FROM products', async (err, res) => {
  if (err) {
    console.error('Error fetching products:', err);
    pool.end();
    return;
  }
  
  console.log(`Analyzing ${res.rows.length} products...`);
  let updatedCount = 0;
  for (const row of res.rows) {
    const targetCat = determineCategory(row.product_name, row.category);
    if (row.category !== targetCat) {
      console.log(`[Categorize] "${row.product_name}" (Old: ${row.category}) -> ${targetCat}`);
      await pool.query('UPDATE products SET category = $1 WHERE sap_code = $2', [targetCat, row.sap_code]);
      updatedCount++;
    } else {
      console.log(`[Keep] "${row.product_name}" -> ${targetCat}`);
    }
  }
  console.log(`Done. Updated ${updatedCount} products.`);
  pool.end();
});
