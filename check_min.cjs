const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [res] = await conn.query('SELECT p.id, p.thickness, p.brand_origin, p.condition, p.category_id, ppa.calculated_price_per_kg FROM product_pricing_attributes ppa JOIN products p ON p.id=ppa.product_id WHERE p.finish_surface="طلایی میرور" ORDER BY ppa.calculated_price_per_kg ASC LIMIT 5');
  console.log(res);
  process.exit(0);
}
main();
