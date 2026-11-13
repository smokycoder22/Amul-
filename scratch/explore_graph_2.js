const fs = require('fs');
const g = JSON.parse(fs.readFileSync('graphify-out/graph.json', 'utf8'));

const keyTerms = ['requireadmin', 'parseexcel', 'uploadproductimage', 'session', 'otp', 'resolvefamilyimages'];
for (const term of keyTerms) {
  const matchingLinks = g.links.filter(l => 
    l.source.toLowerCase().includes(term) || l.target.toLowerCase().includes(term)
  );
  console.log(`\nConnections for "${term}" (${matchingLinks.length} edges):`);
  matchingLinks.forEach(l => {
    console.log(`  ${l.source} --[${l.relation || 'rel'}]--> ${l.target}`);
  });
}
