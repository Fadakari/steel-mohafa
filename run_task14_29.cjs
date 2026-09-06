const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [rows] = await c.query("SELECT * FROM product_pricing_attributes WHERE calculated_price_per_kg LIKE '%9163%' OR calculated_total_price_per_unit LIKE '%9163%' OR calculated_price_per_kg LIKE '%26717%' OR calculated_total_price_per_unit LIKE '%26717%' LIMIT 5");
  console.log(rows);
  process.exit(0);
}
m().catch(console.error);
