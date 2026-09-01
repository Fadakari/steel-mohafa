const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  await conn.query("CALL sp_recalculate_pricing(1, NULL, NULL, NULL, NULL, NULL, 'test')");
  const [r] = await conn.query("SELECT product_id, calculated_price_per_kg FROM product_pricing_attributes WHERE product_id=27587");
  console.log(r);
  process.exit(0);
}
main();
