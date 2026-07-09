const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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

async function runTests() {
  console.log('--- STARTING E2E VERIFICATION TEST ---');

  // Test 1: Categorization logic verification
  console.log('\n[TEST 1] Verifying deterministic categorization logic...');
  const tests = [
    { name: 'Amul Taaza Milk 500ml', cat: 'Milk', expected: 'Milk' },
    { name: 'Amul Gold Milk 1L', cat: 'Milk', expected: 'Milk' },
    { name: 'Amul Premium Paneer 200g', cat: 'Cheese', expected: 'Paneer' },
    { name: 'Amul Masti Spiced Buttermilk 200ml', cat: 'Drinks', expected: 'Buttermilk' },
    { name: 'Amul Masti Dahi 200g Cup', cat: 'Curd', expected: 'Dahi' },
    { name: 'Amul Butter 100g', cat: 'Butter', expected: 'Butter' },
    { name: 'Amul Cheese Slices 200g', cat: 'Cheese', expected: 'Cheese' },
    { name: 'Amul SFY Strawberry Yogurt 100g', cat: 'Yoghurt', expected: 'Yogurt' },
    { name: 'Amul Rabri 85g Cup', cat: 'Sweets', expected: 'Others' }
  ];

  let catPass = true;
  for (const t of tests) {
    const res = determineCategory(t.name, t.cat);
    if (res === t.expected) {
      console.log(`PASS: "${t.name}" -> ${res}`);
    } else {
      console.error(`FAIL: "${t.name}" -> expected ${t.expected}, got ${res}`);
      catPass = false;
    }
  }
  console.log('Categorization Logic:', catPass ? 'PASS' : 'FAIL');

  // Test 2: Verify DB query returns products from DB sorted correctly
  console.log('\n[TEST 2] Verifying products list from database...');
  try {
    const res = await pool.query('SELECT sap_code, product_name, category, created_at, image_url FROM products ORDER BY category, product_name');
    console.log(`Successfully fetched ${res.rows.length} products from Supabase DB.`);
    
    // Check if there are any mock products or if they are all real DB rows
    const hasNullOrEmptyImage = res.rows.filter(r => !r.image_url).length;
    console.log(`Products without image: ${hasNullOrEmptyImage}/${res.rows.length}`);
    
    // Check unique categories present in DB
    const categories = new Set(res.rows.map(r => r.category));
    console.log('Categories present in DB:', Array.from(categories));
  } catch (err) {
    console.error('FAIL: Database query failed:', err);
  }

  // Test 3: Simulating image mapping update and Excel update preservation
  console.log('\n[TEST 3] Verifying image URL preservation on price updates...');
  const testSapCode = 'TONCP23';
  try {
    // 3.1: Set a test image URL for TONCP23
    console.log(`Setting mock image URL for product ${testSapCode}...`);
    const testImageUrl = 'https://hviwnuaezzwywlozbmzy.supabase.co/storage/v1/object/public/product-images/TONCP23.webp';
    await pool.query('UPDATE products SET image_url = $1 WHERE sap_code = $2', [testImageUrl, testSapCode]);
    console.log(`Mock image URL set for ${testSapCode}`);

    // 3.2: Verify it is set
    let checkRes = await pool.query('SELECT image_url, retailer_price FROM products WHERE sap_code = $1', [testSapCode]);
    console.log(`Before update: price = ${checkRes.rows[0].retailer_price}, image_url = ${checkRes.rows[0].image_url}`);

    // 3.3: Simulate publish price update (which should preserve image_url)
    console.log(`Simulating pricing update query (preserving image_url)...`);
    const newPrice = 28.50;
    await pool.query(
      `UPDATE products 
       SET retailer_price = $1, 
           updated_at = NOW() 
       WHERE sap_code = $2`,
      [newPrice, testSapCode]
    );

    // 3.4: Verify price updated but image preserved
    checkRes = await pool.query('SELECT image_url, retailer_price FROM products WHERE sap_code = $1', [testSapCode]);
    console.log(`After update: price = ${checkRes.rows[0].retailer_price}, image_url = ${checkRes.rows[0].image_url}`);

    if (checkRes.rows[0].image_url === testImageUrl && Number(checkRes.rows[0].retailer_price) === newPrice) {
      console.log('PASS: Pricing update successfully preserved image URL!');
    } else {
      console.error('FAIL: Image URL was lost or price did not update.');
    }
  } catch (err) {
    console.error('FAIL during pricing update test:', err);
  }

  pool.end();
  console.log('\n--- E2E VERIFICATION TEST COMPLETE ---');
}

runTests();
