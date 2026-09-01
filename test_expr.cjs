const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [r] = await conn.query(`
    SELECT p.id, a.basePrice, 
    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id IS NULL LIMIT 1), 1.0) as m1,
    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0) as mcat,
    GREATEST(
      a.basePrice,
      CAST(
          a.basePrice *
          COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
          COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='product_type' AND pr.rule_value=p.condition AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='product_type' AND pr.rule_value=p.condition AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
          COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
          COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
          COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0)
      AS DECIMAL(15,0))
    ) AS calc 
    FROM product_pricing_attributes ppa 
    JOIN products p ON ppa.product_id = p.id 
    JOIN product_alloy_mapping pam ON p.id = pam.product_id 
    JOIN alloy a ON pam.alloy_id = a.id 
    WHERE p.id = 27587
  `);
  console.log(r);
  process.exit(0);
}
main();
