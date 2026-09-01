const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  await conn.query('DROP PROCEDURE IF EXISTS sp_recalculate_pricing');
  await conn.query(`
    CREATE PROCEDURE sp_recalculate_pricing(
        p_alloy_id INT,
        p_category_id INT,
        p_brand VARCHAR(255),
        p_form VARCHAR(255),
        p_finish VARCHAR(255),
        p_thickness VARCHAR(255),
        p_source VARCHAR(50)
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
            
        INSERT INTO engine_price_history (product_id, new_price_per_kg, new_total_price, source, base_alloy_price_used)
        SELECT p.id, ppa.calculated_price_per_kg, ppa.calculated_total_price_per_unit, p_source, 
               (SELECT basePrice FROM alloy a JOIN product_alloy_mapping pa ON pa.alloy_id = a.id WHERE pa.product_id = p.id LIMIT 1)
        FROM products p
        JOIN product_alloy_mapping pam ON p.id = pam.product_id
        JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
        WHERE 
            (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND
            (p_category_id IS NULL OR p.category_id = p_category_id) AND
            (p_brand IS NULL OR p.brand_origin = p_brand) AND
            (p_form IS NULL OR p.condition = p_form) AND
            (p_finish IS NULL OR p.finish_surface = p_finish) AND
            (p_thickness IS NULL OR p.thickness = p_thickness);
            
    END;
  `);
  console.log('SP updated');
  process.exit(0);
}
main();
