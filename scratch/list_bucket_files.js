const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

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

async function run() {
  const { data, error } = await sb.storage.from('product-images').list('', { limit: 100 });
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log(`Total files in bucket (${data.length}):`);
  data.forEach(f => console.log(f.name));
}

run();
