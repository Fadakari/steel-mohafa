const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  console.log("=== FINAL PRICING AUDIT ===");

  // 1. Alloy Base Prices
  const [alloys] = await conn.query('SELECT id, name, basePrice FROM alloy ORDER BY id');
  console.log("\n1. Alloy Base Prices:");
  console.table(alloys);

  // 2. Sample Products per Alloy
  const [samples] = await conn.query(`
    WITH Ranked AS (
      SELECT p.id as product_id, a.name as alloy, a.basePrice, p.brand_origin, p.condition as form, 
             p.finish_surface, p.thickness, p.category_id as category, 
             ppa.calculated_price_per_kg, ppa.calculated_weight_kg, ppa.calculated_total_price_per_unit,
             ROW_NUMBER() OVER(PARTITION BY a.id ORDER BY p.id) as rn
      FROM products p
      JOIN product_alloy_mapping pam ON p.id = pam.product_id
      JOIN alloy a ON pam.alloy_id = a.id
      JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    )
    SELECT * FROM Ranked WHERE rn <= 2
  `);
  console.log("\n2. Sample Products per Alloy:");
  console.table(samples);

  // 3. Alloy 304 Brand x Form Summary (excluding decorative for pure industrial pricing)
  const [a304summary] = await conn.query(`
    SELECT p.brand_origin, p.condition as form,
           MIN(ppa.calculated_price_per_kg) as min_price,
           MAX(ppa.calculated_price_per_kg) as max_price,
           ROUND(AVG(ppa.calculated_price_per_kg)) as avg_price,
           COUNT(*) as count
    FROM products p
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    WHERE pam.alloy_id = 1 AND p.category_id != 266
    GROUP BY p.brand_origin, p.condition
    ORDER BY p.brand_origin, p.condition
  `);
  console.log("\n3. Alloy 304 Brand x Form Summary (Non-Decorative):");
  console.table(a304summary);

  // 4. Per-Alloy Stats
  const [alloyStats] = await conn.query(`
    SELECT a.name as alloy, a.basePrice,
           MIN(ppa.calculated_price_per_kg) as min_price,
           MAX(ppa.calculated_price_per_kg) as max_price,
           MAX(ppa.calculated_price_per_kg - a.basePrice) as max_diff,
           ROUND(AVG(ppa.calculated_price_per_kg - a.basePrice)) as avg_diff,
           SUM(CASE WHEN ppa.calculated_price_per_kg < a.basePrice THEN 1 ELSE 0 END) as violations
    FROM products p
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    JOIN alloy a ON pam.alloy_id = a.id
    GROUP BY a.id
  `);
  console.log("\n4. Per-Alloy Statistics (Includes Decorative):");
  console.table(alloyStats);

  // 5. Pricing Rules
  const [rules] = await conn.query('SELECT id, rule_type, rule_value, multiplier, alloy_id, category_id, priority FROM pricing_rules ORDER BY rule_type, rule_value');
  console.log("\n5. Current Pricing Rules:");
  console.table(rules);

  // 6 & 7. Rule Impact
  console.log("\n6 & 7. Rule Impact (Affected Products):");
  for(let rule of rules) {
      let q = "SELECT COUNT(*) as c FROM products WHERE 1=1";
      if (rule.rule_type === 'brand_origin') q += ` AND brand_origin = '${rule.rule_value}'`;
      if (rule.rule_type === 'product_type') q += ` AND condition = '${rule.rule_value}'`;
      if (rule.rule_type === 'category') q += ` AND category_id = '${rule.rule_value}'`;
      if (rule.rule_type === 'finish_surface' && rule.rule_value !== 'default') q += ` AND finish_surface = '${rule.rule_value}'`;
      if (rule.rule_type === 'thickness' && rule.rule_value !== 'default') q += ` AND thickness = '${rule.rule_value}'`;
      if (rule.alloy_id) q = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE pam.alloy_id = ${rule.alloy_id}` + q.substring(34);
      
      try {
          const [c] = await conn.query(q);
          console.log(`- Rule [${rule.rule_type} = ${rule.rule_value}]: affects ${c[0].c} products.`);
      } catch(e) {
          console.log(`- Rule [${rule.rule_type} = ${rule.rule_value}]: count error`);
      }
  }

  // 11. Final Floor Proof
  const [floorProof] = await conn.query(`
    SELECT COUNT(*) as violations FROM products p
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    JOIN alloy a ON pam.alloy_id = a.id
    WHERE ppa.calculated_price_per_kg < a.basePrice
  `);
  console.log(`\n11. Floor Proof (Products < BasePrice): ${floorProof[0].violations}`);

  process.exit(0);
}
main().catch(console.error);
