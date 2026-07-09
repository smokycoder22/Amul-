const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Read .env manually
const envPath = path.join(__dirname, '../.env');
console.log('Loading env from:', envPath);
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

if (!connectionString) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

console.log('Connection string found. Connecting...');
const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('pooler.supabase.com') || connectionString.includes('supabase.com') ? { rejectUnauthorized: false } : undefined
});

pool.query('SELECT NOW() as db_time, current_database() as db_name', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connection successful:', res.rows[0]);
  }
  pool.end();
});
