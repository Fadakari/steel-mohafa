const fs = require('fs');
const path = require('path');

const file = path.join('server', 'api', 'category', '[...slug].ts');
let content = fs.readFileSync(file, 'utf8');

// Insert query parsing
content = content.replace(
  /const rawSlug = getRouterParam\(event, 'slug'\)/,
  "const rawSlug = getRouterParam(event, 'slug')\n  const query = getQuery(event)\n  const page = parseInt(query.page) || 1\n  const take = 50\n  const skip = (page - 1) * take"
);

// Add take/skip to products
content = content.replace(
  /products: \{\s*where: \{\s*is_active: true\s*\},\s*orderBy: \{\s*sort: 'asc'\s*\},/g,
  "products: {\n          where: {\n            is_active: true\n          },\n          orderBy: {\n            sort: 'asc'\n          },\n          take: take,\n          skip: skip,"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Added take/skip to category API');
