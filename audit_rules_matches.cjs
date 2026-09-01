const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  // 1. Rules matches
  const [rules] = await conn.query('SELECT * FROM pricing_rules');
  const rulesReport = [];
  
  for (const rule of rules) {
    let matchQuery = '';
    
    // For counting matches, we need to mimic the SP logic
    if (rule.rule_type === 'brand_origin') {
      matchQuery = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE p.brand_origin = ? AND (pam.alloy_id = ? OR ? IS NULL)`;
    } else if (rule.rule_type === 'product_type') {
      matchQuery = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE p.condition = ? AND (pam.alloy_id = ? OR ? IS NULL)`;
    } else if (rule.rule_type === 'finish_surface') {
      matchQuery = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE p.finish_surface = ? AND (pam.alloy_id = ? OR ? IS NULL)`;
    } else if (rule.rule_type === 'thickness') {
      matchQuery = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE p.thickness = CAST(? AS DECIMAL) AND (pam.alloy_id = ? OR ? IS NULL)`;
    } else if (rule.rule_type === 'category') {
      matchQuery = `SELECT COUNT(*) as c FROM products p JOIN product_alloy_mapping pam ON p.id = pam.product_id WHERE CAST(p.category_id AS CHAR) = CAST(? AS CHAR) AND (pam.alloy_id = ? OR ? IS NULL)`;
    }
    
    let matchCount = 0;
    try {
      const [res] = await conn.query(matchQuery, [rule.rule_value, rule.alloy_id, rule.alloy_id]);
      matchCount = res[0].c;
    } catch(e) {
      matchCount = 0; // Error or unsupported rule type
    }
    
    rulesReport.push({
      id: rule.id,
      rule_type: rule.rule_type,
      rule_value: rule.rule_value,
      alloy_id: rule.alloy_id,
      multiplier: rule.multiplier,
      matched_products: matchCount
    });
  }
  
  console.log(JSON.stringify(rulesReport, null, 2));
  process.exit(0);
}

main();
