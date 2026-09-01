const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  await conn.query('DROP TRIGGER IF EXISTS test_1442');
  await conn.query(`
    CREATE TRIGGER test_1442 
    AFTER UPDATE ON pricing_rules 
    FOR EACH ROW 
    BEGIN 
      UPDATE product_pricing_attributes ppa 
      SET ppa.calculated_price_per_kg = (SELECT multiplier FROM pricing_rules WHERE id = 1 LIMIT 1) 
      WHERE ppa.product_id = 27587; 
    END;
  `);
  try {
    await conn.query("UPDATE pricing_rules SET multiplier = 1.532 WHERE id = 1");
    console.log('SUCCESS: No 1442 Error');
  } catch(e) {
    console.log('ERROR 1442 CAUGHT:', e.message);
  }
  await conn.query('DROP TRIGGER IF EXISTS test_1442');
  process.exit(0);
}
main();
