const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [a] = await conn.query("SHOW COLUMNS FROM alloy WHERE Field = 'basePrice'");
  const [p] = await conn.query("SHOW COLUMNS FROM product_pricing_attributes WHERE Field IN ('base_price_ratio', 'calculated_price_per_kg', 'calculated_total_price_per_unit')");
  console.log('alloy:', a);
  console.log('ppa:', p);
  
  // Also run some math tests for the report
  const [math] = await conn.query(`
    SELECT 
      211000 * 0.8995 as current_double_eval,
      ROUND(211000 * 0.8995) as current_rounded,
      CAST(211000 AS DECIMAL(15,2)) * CAST(0.8995 AS DECIMAL(10,4)) as fixed_decimal_eval,
      ROUND(CAST(211000 AS DECIMAL(15,2)) * CAST(0.8995 AS DECIMAL(10,4))) as fixed_rounded,
      
      210000 * 0.8995 as current_210k,
      ROUND(CAST(210000 AS DECIMAL(15,2)) * CAST(0.8995 AS DECIMAL(10,4))) as fixed_210k
  `);
  console.log('Math:', math);
  process.exit(0);
}
main();
