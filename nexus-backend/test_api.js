const https = require('https');

const endpoints = [
  { method: 'GET', url: 'https://nexus-es75.onrender.com/api/health', name: 'GET /api/health' },
  { method: 'GET', url: 'https://nexus-es75.onrender.com/api/projects', name: 'GET /api/projects' },
];

let completed = 0;
endpoints.forEach(ep => {
  https.get(ep.url, { timeout: 10000 }, (res) => {
    console.log(`✓ ${ep.name}: ${res.statusCode}`);
    completed++;
    if (completed === endpoints.length) {
      console.log('\n✓ All API endpoints responding!');
    }
  }).on('error', (err) => {
    console.log(`✗ ${ep.name}: ${err.message}`);
    completed++;
    if (completed === endpoints.length) {
      console.log('\nAPI tests completed.');
    }
  });
});
