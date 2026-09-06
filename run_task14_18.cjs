const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [rows] = await c.query('SELECT * FROM product_pricing_attributes WHERE calculated_total_price_per_unit = 916360 OR calculated_price_per_kg = 916360 OR calculated_total_price_per_unit = 267172 OR calculated_price_per_kg = 267172');
  console.log(rows);
  process.exit(0);
}
m().catch(console.error);
