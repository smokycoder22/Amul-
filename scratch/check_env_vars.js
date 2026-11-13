const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split(/\r?\n/);
for (const line of lines) {
  if (line.startsWith('ADMIN_ID=')) {
    const raw = line.slice('ADMIN_ID='.length);
    console.log('ADMIN_ID:', JSON.stringify(raw));
  }
  if (line.startsWith('ADMIN_PASSWORD=')) {
    const raw = line.slice('ADMIN_PASSWORD='.length);
    console.log('ADMIN_PASSWORD:', JSON.stringify(raw));
  }
}
