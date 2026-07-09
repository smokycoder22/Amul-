const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function parseEnv(envPath) {
  const text = fs.readFileSync(envPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const out = {};
  for (const l of lines) {
    const m = l.match(/^\s*([A-Z0-9_]+)=(?:"([^"]*)"|'([^']*)'|(.*))\s*$/i);
    if (m) out[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

(async function main() {
  const root = process.cwd();
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) {
    console.error(JSON.stringify({ error: '.env missing' }));
    process.exit(2);
  }
  const env = parseEnv(envPath);
  const ADMIN_ID = env.ADMIN_ID || '';
  const ADMIN_PASSWORD = env.ADMIN_PASSWORD || '';
  const DATABASE_URL = env.DATABASE_URL || '';

  const BASE = 'http://localhost:3000';

  const results = [];

  // helper fetch with timeout
  const fetchWithTimeout = (url, opts = {}) => {
    return Promise.race([
      fetch(url, opts),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000)),
    ]);
  };

  // wait for server
  let up = false;
  for (let i = 0; i < 10; i++) {
    try {
      const r = await fetchWithTimeout(BASE + '/api/products');
      if (r.status === 200) { up = true; break; }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1000));
  }
  if (!up) { console.error(JSON.stringify({ error: 'server-unreachable' })); process.exit(3); }

  // 4. Wrong admin credentials
  try {
    const resp = await fetchWithTimeout(BASE + '/api/auth/admin-login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'wrong-username', password: 'wrong-pass' })
    });
    results.push({ step: 'wrong-credentials', status: resp.status });
  } catch (e) { results.push({ step: 'wrong-credentials', error: e.message }); }

  // 5. Correct credentials
  let cookie = null;
  try {
    const resp = await fetchWithTimeout(BASE + '/api/auth/admin-login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_ID, password: ADMIN_PASSWORD })
    });
    const setCookie = resp.headers.get('set-cookie');
    const hasCookie = !!setCookie;
    results.push({ step: 'correct-credentials', status: resp.status, set_cookie: hasCookie });
    if (hasCookie) cookie = setCookie.split(/;\s*/)[0];
  } catch (e) { results.push({ step: 'correct-credentials', error: e.message }); }

  // 6. Verify response sets admin_session cookie (handled above)

  // 7. Valid session -> /api/admin/dashboard-stats expect 200
  try {
    const headers = cookie ? { Cookie: cookie } : {};
    const resp = await fetchWithTimeout(BASE + '/api/admin/dashboard-stats', { method: 'GET', headers });
    results.push({ step: 'dashboard-with-cookie', status: resp.status });
  } catch (e) { results.push({ step: 'dashboard-with-cookie', error: e.message }); }

  // 8. No cookie -> expect 401
  try {
    const resp = await fetchWithTimeout(BASE + '/api/admin/dashboard-stats', { method: 'GET' });
    results.push({ step: 'dashboard-no-cookie', status: resp.status });
  } catch (e) { results.push({ step: 'dashboard-no-cookie', error: e.message }); }

  // 9. Fake cookie -> expect 401
  try {
    const resp = await fetchWithTimeout(BASE + '/api/admin/dashboard-stats', { method: 'GET', headers: { Cookie: 'admin_session=fake-token' } });
    results.push({ step: 'dashboard-fake-cookie', status: resp.status });
  } catch (e) { results.push({ step: 'dashboard-fake-cookie', error: e.message }); }

  // 10. Logout valid session
  try {
    const resp = await fetchWithTimeout(BASE + '/api/auth/logout', { method: 'POST', headers: cookie ? { Cookie: cookie } : {} });
    const setCookie = resp.headers.get('set-cookie');
    const cleared = setCookie ? setCookie.includes('admin_session=;') || setCookie.includes('Max-Age=0') : false;
    results.push({ step: 'logout', status: resp.status, cleared_cookie: cleared });
  } catch (e) { results.push({ step: 'logout', error: e.message }); }

  // 11. Reuse old session after logout -> expect 401
  try {
    const resp = await fetchWithTimeout(BASE + '/api/admin/dashboard-stats', { method: 'GET', headers: cookie ? { Cookie: cookie } : {} });
    results.push({ step: 'dashboard-after-logout', status: resp.status });
  } catch (e) { results.push({ step: 'dashboard-after-logout', error: e.message }); }

  // DB checks: admin_login table exists and session token stored and not equal to mock-admin-session-token
  let dbChecks = { exists: false, session_token_random: false, row_count: 0 };
  if (DATABASE_URL) {
    const client = new Client({ connectionString: DATABASE_URL });
    try {
      await client.connect();
      const existsRes = await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='admin_login') as exists")
      dbChecks.exists = existsRes.rows[0].exists;
      if (dbChecks.exists) {
        const rows = await client.query('SELECT username, session_token FROM admin_login');
        dbChecks.row_count = rows.rowCount;
        dbChecks.session_token_random = rows.rows.some(r => r.session_token && r.session_token !== 'mock-admin-session-token');
      }
    } catch (e) {
      results.push({ step: 'db-check-error', error: e.message });
    } finally {
      try { await client.end(); } catch (e) {}
    }
  } else {
    results.push({ step: 'db-check', error: 'DATABASE_URL missing' });
  }

  // products unchanged check: fetch product count before/after not available here; instead we will query products count from API
  let productsCount = null;
  try {
    const resp = await fetchWithTimeout(BASE + '/api/products');
    if (resp.ok) { const arr = await resp.json(); productsCount = Array.isArray(arr) ? arr.length : null; }
  } catch (e) {}

  // Output sanitized summary
  const summary = { results, dbChecks, productsCount };
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
})();
