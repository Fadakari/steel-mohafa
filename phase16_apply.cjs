const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  // 1. Disable the broken decorative rule by setting it to 266 and multiplier 1.0
  await conn.query(`UPDATE pricing_rules SET rule_value = '266', multiplier = 1.0000 WHERE id = 1`);

  // 2. Insert Finish Rules
  const finishMultipliers = {
    'براق BA': 1.0400,
    'خشدار No.4': 1.0630,
    'نقرهای میرور': 1.2720,
    'نقره ای خشدار': 1.2720,
    'طلایی میرور': 1.5720,
    'مشکی میرور': 1.6460,
    'برنز': 1.6460,
    'طلایی خشدار': 1.4970,
    'دودی (Black)': 1.6460
  };

  for (const [finish, mult] of Object.entries(finishMultipliers)) {
    // Check if it exists
    const [existing] = await conn.query('SELECT id FROM pricing_rules WHERE rule_type="finish_surface" AND rule_value=?', [finish]);
    if (existing.length > 0) {
      await conn.query('UPDATE pricing_rules SET multiplier = ? WHERE id = ?', [mult, existing[0].id]);
    } else {
      await conn.query('INSERT INTO pricing_rules (rule_type, rule_value, multiplier, priority) VALUES (?, ?, ?, ?)', 
        ['finish_surface', finish, mult, 0]);
    }
  }

  // 3. Insert Thickness Rules
  const thicknessMultipliers = {
    '0.5': 1.0800,
    '0.6': 1.0500
  };

  for (const [thick, mult] of Object.entries(thicknessMultipliers)) {
    const [existing] = await conn.query('SELECT id FROM pricing_rules WHERE rule_type="thickness" AND rule_value=?', [thick]);
    if (existing.length > 0) {
      await conn.query('UPDATE pricing_rules SET multiplier = ? WHERE id = ?', [mult, existing[0].id]);
    } else {
      await conn.query('INSERT INTO pricing_rules (rule_type, rule_value, multiplier, priority) VALUES (?, ?, ?, ?)', 
        ['thickness', thick, mult, 0]);
    }
  }

  // 4. Run SP for Alloy 304
  console.log("Recalculating prices for Alloy 304...");
  await conn.query(`CALL sp_recalculate_pricing(1, null, null, null, null, null, 'Phase 16 - Multipliers Sync')`);
  console.log("Recalculation complete.");

  // 5. Post-Audit
  console.log("\n--- POST-AUDIT ---");
  const [activeRules] = await conn.query('SELECT COUNT(*) as c FROM pricing_rules');
  console.log("Total Active Rules:", activeRules[0].c);

  const [underPriced] = await conn.query(`
    SELECT COUNT(*) as c 
    FROM product_pricing_attributes ppa 
    JOIN product_alloy_mapping pam ON ppa.product_id = pam.product_id 
    JOIN alloy a ON pam.alloy_id = a.id
    WHERE ppa.calculated_price_per_kg < a.basePrice
  `);
  console.log("Products priced BELOW Base Price:", underPriced[0].c);

  const [finishStats] = await conn.query(`
    SELECT 
      p.finish_surface, 
      COUNT(p.id) as count,
      MIN(ppa.calculated_price_per_kg) as min_price,
      MAX(ppa.calculated_price_per_kg) as max_price,
      AVG(ppa.calculated_price_per_kg) as avg_price
    FROM products p
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    WHERE pam.alloy_id = 1
    GROUP BY p.finish_surface
    ORDER BY count DESC
  `);
  console.log("\nFinal Price Ranges by Finish for 304:");
  console.table(finishStats);

  process.exit(0);
}

main();
