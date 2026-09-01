const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  // Fix thickness values to match CAST(thickness AS CHAR)
  await conn.query('UPDATE pricing_rules SET rule_value="0.50000" WHERE rule_type="thickness" AND rule_value="0.5"');
  await conn.query('UPDATE pricing_rules SET rule_value="0.60000" WHERE rule_type="thickness" AND rule_value="0.6"');
  
  console.log("Recalculating...");
  await conn.query("CALL sp_recalculate_pricing(1, null, null, null, null, null, 'Phase 16 - Fix Thick')");
  
  const [res] = await conn.query('SELECT MIN(ppa.calculated_price_per_kg) as min, MAX(ppa.calculated_price_per_kg) as max FROM product_pricing_attributes ppa JOIN products p ON p.id=ppa.product_id WHERE p.finish_surface="طلایی میرور"');
  console.log("طلایی میرور prices:", res);
  
  process.exit(0);
}

main();
