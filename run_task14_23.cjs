const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [rows] = await c.query("SELECT p.id, c.title as cat, ppa.unit, ppa.calculated_price_per_kg, ppa.calculated_total_price_per_unit FROM product_pricing_attributes ppa JOIN products p ON p.id = ppa.product_id JOIN categories c ON c.id = p.category_id WHERE ppa.calculated_price_per_kg BETWEEN 916350 AND 916370 OR ppa.calculated_total_price_per_unit BETWEEN 916350 AND 916370 OR ppa.calculated_price_per_kg BETWEEN 267170 AND 267180 OR ppa.calculated_total_price_per_unit BETWEEN 267170 AND 267180 LIMIT 10");
  console.log(rows);
  process.exit(0);
}
m().catch(console.error);
