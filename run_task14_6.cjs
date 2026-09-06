const fs = require('fs');
const path = require('path');

const file = path.join('server', 'api', 'category', '[...slug].ts');
let content = fs.readFileSync(file, 'utf8');

// We have two places with price_history: { take: 5, orderBy: { date_created: 'desc' } }
content = content.replace(
  /orderBy: \{\s*date_created: 'desc'\s*\}/g,
  "orderBy: [\n                  { date_created: 'desc' },\n                  { id: 'desc' }\n                ]"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Prisma orderBy in category API');
