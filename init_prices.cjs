const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  console.log("Running FULL Recalculation...");
  await conn.query("CALL sp_recalculate_pricing(NULL, NULL, NULL, NULL, NULL, NULL, 'migration_init')");
  console.log("Full recalculation done!");
  
  const [floorTest] = await conn.query(`
    SELECT COUNT(*) as c FROM products p
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    JOIN alloy a ON pam.alloy_id = a.id
    WHERE ppa.calculated_price_per_kg < a.basePrice
  `);
  console.log(`Products below Base Price across all 11,996 products: ${floorTest[0].c}`);
  process.exit(0);
}
main();
