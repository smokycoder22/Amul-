const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../.env');
let serviceKey = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      serviceKey = line.split('SUPABASE_SERVICE_ROLE_KEY=')[1].replace(/"/g, '').trim();
    }
  }
}

const supabase = createClient('https://hviwnuaezzwywlozbmzy.supabase.co', serviceKey);

async function run() {
  try {
    console.log('Checking buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const exists = buckets.some(b => b.name === 'product-images');
    if (exists) {
      console.log('Bucket "product-images" already exists.');
    } else {
      console.log('Bucket "product-images" does not exist. Creating...');
      const { data, error } = await supabase.storage.createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png'],
        fileSizeLimit: 5242880 // 5MB
      });
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Bucket created successfully:', data);
      }
    }
  } catch (err) {
    console.error('Failed:', err);
  }
}

run();
