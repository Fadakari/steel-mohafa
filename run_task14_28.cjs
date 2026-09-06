const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [rows] = await c.query("SELECT p.id, c.title, ppa.calculated_price_per_kg, ppa.calculated_total_price_per_unit FROM product_pricing_attributes ppa JOIN products p ON p.id = ppa.product_id JOIN categories c ON c.id = p.category_id WHERE ROUND(ppa.calculated_price_per_kg) = 916360 OR ROUND(ppa.calculated_total_price_per_unit) = 916360 OR ROUND(ppa.calculated_price_per_kg) = 267172 OR ROUND(ppa.calculated_total_price_per_unit) = 267172 LIMIT 5");
  console.log(rows);
  process.exit(0);
}
m().catch(console.error);
