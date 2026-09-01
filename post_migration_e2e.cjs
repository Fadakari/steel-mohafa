const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  console.log("Connected for E2E Tests...");
  
  // 1. Get original 304 Base Price
  const [alloyRes] = await conn.query('SELECT basePrice FROM alloy WHERE id = 1');
  const origBasePrice = alloyRes[0].basePrice;
  console.log(`Original 304 Base Price: ${origBasePrice}`);

  // Test A: Change Base Price to 670,000
  console.log("\\n--- TEST A: ALLOY TRIGGER ---");
  await conn.query('UPDATE alloy SET basePrice = 670000 WHERE id = 1');
  console.log("Updated alloy 304 basePrice to 670000");
  
  const [testA] = await conn.query(`
    SELECT p.id, p.brand_origin, p.condition, ppa.calculated_price_per_kg 
    FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id 
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    WHERE pam.alloy_id = 1 AND p.category_id != 266 LIMIT 4
  `);
  console.log("304 Prices after BasePrice Update:");
  console.table(testA);

  // Test B: Change Rule China (simulate Directus edit)
  console.log("\\n--- TEST B: QUEUE & EVENT (RULE CHANGE) ---");
  await conn.query("UPDATE pricing_rules SET multiplier = 1.0500 WHERE rule_type = 'brand_origin' AND rule_value = 'چاینا (چین)'");
  console.log("Updated China multiplier to 1.0500. Waiting 2 seconds for Event Scheduler...");
  
  await new Promise(r => setTimeout(r, 2000));
  
  const [queueStatus] = await conn.query("SELECT COUNT(*) as c FROM pricing_recalc_queue");
  console.log(`Queue items remaining: ${queueStatus[0].c}`);

  const [testB] = await conn.query(`
    SELECT p.id, p.brand_origin, p.condition, ppa.calculated_price_per_kg 
    FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id 
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    WHERE pam.alloy_id = 1 AND p.brand_origin = 'چاینا (چین)' LIMIT 2
  `);
  console.log("China Prices after Rule Update (Expected Base 670k * 1.05 = 703,500):");
  console.table(testB);

  const [testB_unaffected] = await conn.query(`
    SELECT p.id, p.brand_origin, p.condition, ppa.calculated_price_per_kg 
    FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id 
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    WHERE pam.alloy_id = 1 AND p.brand_origin = 'تایوان' LIMIT 1
  `);
  console.log("Taiwan Price after China Rule Update (Expected unchanged Base 670k):", testB_unaffected);

  // Test C: Revert
  console.log("\\n--- TEST C: REVERT & VERIFY ---");
  await conn.query("UPDATE pricing_rules SET multiplier = 1.0010 WHERE rule_type = 'brand_origin' AND rule_value = 'چاینا (چین)'");
  await conn.query(`UPDATE alloy SET basePrice = ${origBasePrice} WHERE id = 1`);
  console.log("Reverted China multiplier and 304 Base Price. Waiting 2 seconds...");
  await new Promise(r => setTimeout(r, 2000));

  const [floorTest] = await conn.query(`
    SELECT COUNT(*) as c FROM products p
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    JOIN alloy a ON pam.alloy_id = a.id
    WHERE ppa.calculated_price_per_kg < a.basePrice
  `);
  console.log(`Products below Base Price across all 11,996 products: ${floorTest[0].c}`);

  const [historyTest] = await conn.query(`
    SELECT source, COUNT(*) as c FROM engine_price_history GROUP BY source
  `);
  console.log("History log sources:", historyTest);

  process.exit(0);
}

main().catch(console.error);
