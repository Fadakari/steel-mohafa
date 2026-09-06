const fs = require('fs');
const path = require('path');

const file = path.join('server', 'api', 'products', '[id]', 'price-history.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/ORDER BY date_created DESC/g, 'ORDER BY date_created DESC, id DESC');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed ORDER BY in price-history.ts');
