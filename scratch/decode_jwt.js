const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split(/\r?\n/);
for (const line of lines) {
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    const raw = line.slice('SUPABASE_SERVICE_ROLE_KEY='.length).trim();
    const clean = raw.replace(/^["']|["']$/g, '');
    const parts = clean.split('.');
    if (parts.length === 3) {
      const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
      console.log('JWT Payload:', payload);
    }
  }
}
