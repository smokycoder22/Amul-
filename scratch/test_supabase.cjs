const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../.env');
let supabaseUrl = '';
let serviceKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('NEXT_PUBLIC_SUPABASE_URL=')[1].replace(/"/g, '').trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      serviceKey = line.split('SUPABASE_SERVICE_ROLE_KEY=')[1].replace(/"/g, '').trim();
    }
  }
}

console.log('Original Env Supabase URL:', supabaseUrl);
console.log('Original Env Service Key:', serviceKey);

// Test with original first
try {
  const supabase = createClient(supabaseUrl, serviceKey);
  console.log('Supabase client initialized with original URL.');
} catch (err) {
  console.error('Failed to initialize with original URL:', err.message);
}

// Corrected URL
const correctedUrl = 'https://hviwnuaezzwywlozbmzy.supabase.co';
console.log('Testing with corrected URL:', correctedUrl);
const supabaseCorrected = createClient(correctedUrl, serviceKey);

async function runTest() {
  try {
    const { data, error } = await supabaseCorrected.storage.listBuckets();
    if (error) {
      console.error('List buckets failed:', error);
    } else {
      console.log('Buckets list successful:', data);
    }
  } catch (err) {
    console.error('Error during runTest:', err);
  }
}

runTest();
