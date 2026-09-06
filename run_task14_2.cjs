const fs = require('fs');
const path = require('path');

const file = path.join('app', 'pages', 'products', '[...slug].vue');
let content = fs.readFileSync(file, 'utf8');

// Find the useFetch block and add shallow: true
content = content.replace(
  /getCachedData: \(\) => undefined/g,
  "getCachedData: () => undefined,\n  shallow: true"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Added shallow: true to useFetch in products/[...slug].vue');
