const mysql = require('mysql2/promise');
const { performance } = require('perf_hooks');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  await conn.query('START TRANSACTION');
  
  // Create a temporary table mimicking the Pricing Rules for the update join
  // In the real SP, this will be handled dynamically.
  
  const start = performance.now();
  
  // We will simulate the exact UPDATE that the SP would run for an Alloy update (all products in Alloy 1).
  // First, we find how many products belong to Alloy 1.
  const [alloyProds] = await conn.query('SELECT COUNT(*) as c FROM product_alloy_mapping WHERE alloy_id = 1');
  
  // Real UPDATE query shape:
  const updateQuery = `
    UPDATE product_pricing_attributes ppa
    JOIN products p ON ppa.product_id = p.id
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN alloy a ON pam.alloy_id = a.id
    SET ppa.calculated_price_per_kg = GREATEST(
       a.basePrice,
       a.basePrice * 
       COALESCE((SELECT 1.0010 /* simulated china */), 1.0) *
       COALESCE((SELECT 1.0005 /* simulated roll */), 1.0) *
       COALESCE(1.0, 1.0) * -- finish
       COALESCE(1.0, 1.0) * -- thickness
       COALESCE((IF(p.category_id=266, 1.5320, 1.0)), 1.0)
    )
    WHERE pam.alloy_id = 1;
  `;
  
  const [updateResult] = await conn.query(updateQuery);
  const end = performance.now();
  
  console.log(`Updated ${updateResult.affectedRows} products for Alloy 1.`);
  console.log(`Execution Time: ${(end - start).toFixed(2)} ms`);
  
  await conn.query('ROLLBACK');
  process.exit(0);
}

main();
