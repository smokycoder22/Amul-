const fs = require('fs');
const g = JSON.parse(fs.readFileSync('graphify-out/graph.json', 'utf8'));

console.log('--- GRAPH OVERVIEW ---');
console.log('Nodes:', g.nodes.length, 'Edges:', g.links.length);

const labels = fs.existsSync('graphify-out/.graphify_labels.json')
  ? JSON.parse(fs.readFileSync('graphify-out/.graphify_labels.json', 'utf8'))
  : {};

// Community node groupings
const communities = {};
for (const n of g.nodes) {
  const comm = n.community !== undefined ? n.community : 'unknown';
  if (!communities[comm]) communities[comm] = [];
  communities[comm].push(n);
}

console.log('\n--- COMMUNITIES ---');
Object.entries(communities).forEach(([c, nodes]) => {
  const label = labels[c] || 'Community ' + c;
  console.log(`[C${c}: ${label}] (${nodes.length} nodes)`);
  const topNodes = nodes.slice(0, 5).map(n => n.label || n.id).join(', ');
  console.log(`   Sample nodes: ${topNodes}`);
});

// Find God Nodes (highest degree)
const degree = {};
for (const link of g.links) {
  degree[link.source] = (degree[link.source] || 0) + 1;
  degree[link.target] = (degree[link.target] || 0) + 1;
}

const sortedByDegree = Object.entries(degree).sort((a, b) => b[1] - a[1]);
console.log('\n--- TOP CONNECTED NODES (GOD NODES) ---');
sortedByDegree.slice(0, 12).forEach(([id, deg]) => {
  const node = g.nodes.find(n => n.id === id);
  console.log(`- ${id} (${node ? node.label : ''}) : ${deg} connections [${node ? node.source_location : ''}]`);
});

// Trace links for key modules
console.log('\n--- CRITICAL CONNECTIONS ---');
const keyTerms = ['query', 'requireAdmin', 'parseExcelFile', 'uploadProductImage', 'createAdminSession', 'verifyDistributorOTP', 'resolveFamilyImages'];
for (const term of keyTerms) {
  const matchingLinks = g.links.filter(l => l.source.includes(term) || l.target.includes(term));
  console.log(`\nConnections for "${term}" (${matchingLinks.length} edges):`);
  matchingLinks.slice(0, 8).forEach(l => {
    console.log(`  ${l.source} --[${l.relation || 'rel'}]--> ${l.target}`);
  });
}
