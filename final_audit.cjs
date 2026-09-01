const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  console.log("--- FINAL POST-AUDIT ---");
  const [rules] = await conn.query('SELECT * FROM pricing_rules');
  console.log("Total Active Rules:", rules.length);
  
  for (const rule of rules) {
    let matchQuery = '';
    let params = [rule.rule_value, rule.alloy_id, rule.alloy_id];
    
    if (rule.rule_type === 'brand_origin') {
      matchQuery = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE p.brand_origin = ? AND (pam.alloy_id = ? OR ? IS NULL)`;
    } else if (rule.rule_type === 'product_type') {
      matchQuery = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE p.condition = ? AND (pam.alloy_id = ? OR ? IS NULL)`;
    } else if (rule.rule_type === 'finish_surface') {
      matchQuery = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE p.finish_surface = ? AND (pam.alloy_id = ? OR ? IS NULL)`;
    } else if (rule.rule_type === 'thickness') {
      matchQuery = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE CAST(p.thickness AS CHAR) = CAST(? AS CHAR) AND (pam.alloy_id = ? OR ? IS NULL)`;
    } else if (rule.rule_type === 'category') {
      matchQuery = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE CAST(p.category_id AS CHAR) = CAST(? AS CHAR) AND (pam.alloy_id = ? OR ? IS NULL)`;
    }
    
    let matchCount = 0;
    try {
      if (matchQuery) {
        const [res] = await conn.query(matchQuery, params);
        matchCount = res[0].c;
      }
    } catch(e) {}
    console.log(`Rule ID ${rule.id} [${rule.rule_type}=${rule.rule_value}]: ${matchCount} matches`);
  }
  
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
