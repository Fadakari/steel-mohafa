const mysql = require('mysql2/promise');
const { performance } = require('perf_hooks');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  // 1. Create SP safely
  await conn.query('DROP PROCEDURE IF EXISTS sp_recalculate_pricing_test');
  await conn.query(`
    CREATE PROCEDURE sp_recalculate_pricing_test(
        p_alloy_id INT, p_category_id INT, p_brand VARCHAR(255), 
        p_form VARCHAR(255), p_finish VARCHAR(255), p_thickness VARCHAR(255), p_source VARCHAR(50)
    )
    BEGIN
        UPDATE product_pricing_attributes ppa
        JOIN products p ON ppa.product_id = p.id
        JOIN product_alloy_mapping pam ON p.id = pam.product_id
        JOIN alloy a ON pam.alloy_id = a.id
        SET 
            ppa.calculated_price_per_kg = GREATEST(
                a.basePrice,
                CAST(
                    a.basePrice *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='product_type' AND pr.rule_value=p.condition AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='product_type' AND pr.rule_value=p.condition AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0)
                AS DECIMAL(15,0))
            )
        WHERE 
            (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND
            (p_category_id IS NULL OR p.category_id = p_category_id) AND
            (p_brand IS NULL OR p.brand_origin = p_brand) AND
            (p_form IS NULL OR p.condition = p_form) AND
            (p_finish IS NULL OR p.finish_surface = p_finish) AND
            (p_thickness IS NULL OR p.thickness = p_thickness);
            
        UPDATE product_pricing_attributes ppa
        JOIN products p ON ppa.product_id = p.id
        JOIN product_alloy_mapping pam ON p.id = pam.product_id
        SET ppa.calculated_total_price_per_unit = ROUND(ppa.calculated_price_per_kg * ppa.calculated_weight_kg)
        WHERE 
            (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND
            (p_category_id IS NULL OR p.category_id = p_category_id) AND
            (p_brand IS NULL OR p.brand_origin = p_brand) AND
            (p_form IS NULL OR p.condition = p_form) AND
            (p_finish IS NULL OR p.finish_surface = p_finish) AND
            (p_thickness IS NULL OR p.thickness = p_thickness);
    END;
  `);

  await conn.query('START TRANSACTION');
  
  // 2. Insert dummy rules
  await conn.query("INSERT INTO pricing_rules (rule_type, rule_value, multiplier) VALUES ('brand_origin', 'تایوان', 1.0000)");
  await conn.query("INSERT INTO pricing_rules (rule_type, rule_value, multiplier) VALUES ('brand_origin', 'چاینا (چین)', 1.0010)");
  await conn.query("INSERT INTO pricing_rules (rule_type, rule_value, multiplier) VALUES ('brand_origin', 'جندال هند', 1.0020)");
  await conn.query("INSERT INTO pricing_rules (rule_type, rule_value, multiplier) VALUES ('brand_origin', 'پوسکو کره', 1.0030)");
  await conn.query("INSERT INTO pricing_rules (rule_type, rule_value, multiplier) VALUES ('product_type', 'شیت', 1.0000)");
  await conn.query("INSERT INTO pricing_rules (rule_type, rule_value, multiplier) VALUES ('product_type', 'رول', 1.0005)");

  // Add index to rule_value to speed up the subqueries!
  // Wait, I shouldn't alter pricing_rules schema inside transaction. It's tiny anyway.
  
  // Benchmark full recalculation of Alloy 1
  let s1 = performance.now();
  await conn.query("CALL sp_recalculate_pricing_test(1, NULL, NULL, NULL, NULL, NULL, 'test')");
  let e1 = performance.now();
  console.log(`Update ALL 304 products took: ${(e1-s1).toFixed(2)} ms`);
  
  // Benchmark specific Brand recalculation
  let s2 = performance.now();
  await conn.query("CALL sp_recalculate_pricing_test(NULL, NULL, 'چاینا (چین)', NULL, NULL, NULL, 'test')");
  let e2 = performance.now();
  console.log(`Update all China products took: ${(e2-s2).toFixed(2)} ms`);

  // E2E Check
  const [res] = await conn.query(`
    SELECT p.id, p.brand_origin, p.condition, ppa.calculated_price_per_kg, ppa.calculated_total_price_per_unit
    FROM products p 
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    WHERE pam.alloy_id = 1 AND p.category_id != 266
    ORDER BY p.id ASC LIMIT 8
  `);
  console.log("304 Sample Output (Base 668000):");
  console.table(res);

  // Check rule override: Insert specific China rule for 304
  await conn.query("INSERT INTO pricing_rules (rule_type, rule_value, alloy_id, multiplier) VALUES ('brand_origin', 'چاینا (چین)', 1, 1.0200)");
  await conn.query("CALL sp_recalculate_pricing_test(1, NULL, 'چاینا (چین)', NULL, NULL, NULL, 'test')");
  
  const [resOverride] = await conn.query(`
    SELECT p.id, p.brand_origin, p.condition, ppa.calculated_price_per_kg 
    FROM products p JOIN product_alloy_mapping pam ON p.id=pam.product_id JOIN product_pricing_attributes ppa ON p.id=ppa.product_id
    WHERE pam.alloy_id = 1 AND p.brand_origin = 'چاینا (چین)' LIMIT 2
  `);
  console.log("After Override (China 304 = 1.0200):", resOverride);

  await conn.query('ROLLBACK');
  await conn.query('DROP PROCEDURE IF EXISTS sp_recalculate_pricing_test');
  process.exit(0);
}
main();
