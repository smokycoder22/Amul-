const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split(/\r?\n/);
for (const l of lines) {
  if (l.trim().startsWith('SUPABASE_SERVICE_ROLE_KEY')) {
    const val = l.split('=')[1].trim();
    const token = val.replace(/^["']|["']$/g, '');
    const parts = token.split('.');
    if (parts.length > 1) {
      console.log('Header:', Buffer.from(parts[0], 'base64').toString());
      console.log('Payload:', Buffer.from(parts[1], 'base64').toString());
    }
  }
}
