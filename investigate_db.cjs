const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [r] = await conn.query(`
    SELECT p.id, p.brand_origin, p.condition, a.basePrice, 
           ppa.calculated_price_per_kg, ppa.calculated_total_price_per_unit, ppa.base_price_ratio 
    FROM products p 
    JOIN product_alloy_mapping pam ON p.id = pam.product_id 
    JOIN alloy a ON pam.alloy_id = a.id 
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id 
    WHERE pam.alloy_id = 1 AND p.category_id != 266 
    ORDER BY p.id ASC LIMIT 4
  `);
  console.table(r);
  process.exit(0);
}
main();
