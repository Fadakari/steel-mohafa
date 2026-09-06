const fs = require('fs');
const path = require('path');

const file = path.join('app', 'pages', 'category', '[...slug].vue');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \{ data: categoryData, pending, error \} = await useFetch\(\(\) => `\/api\/category\/\$\{fullSlugPath\.value\}`,\s*\{/g,
  "const { data: categoryData, pending, error } = await useFetch(() => `/api/category/${fullSlugPath.value}`, {\n  shallow: true,"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Added shallow: true to useFetch in category/[...slug].vue');
