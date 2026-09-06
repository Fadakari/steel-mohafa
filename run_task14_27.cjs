const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [rows] = await c.query("SELECT p.id, c.title, ppa.unit FROM product_pricing_attributes ppa JOIN products p ON p.id = ppa.product_id JOIN categories c ON c.id = p.category_id WHERE c.title LIKE '%اتصالات%' LIMIT 5");
  console.log(rows);
  process.exit(0);
}
m().catch(console.error);
