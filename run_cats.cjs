const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [cats] = await c.query("SELECT id, title FROM categories WHERE title LIKE '%ورق%' OR title LIKE '%لوله%' OR title LIKE '%میلگرد%'");
  console.log(cats);
  process.exit(0);
}
m().catch(console.error);
