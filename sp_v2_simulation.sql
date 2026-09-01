DELIMITER $$
CREATE PROCEDURE sp_recalculate_pricing_v2_simulation(
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
                COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                COALESCE(
                  (SELECT multiplier FROM pricing_rules pr 
                   WHERE pr.rule_type='global' 
                     AND pr.category_id=p.category_id 
                     AND pr.rule_value=CONCAT(p.finish_surface, '_', CAST(p.thickness AS CHAR)) 
                   LIMIT 1),
                  (
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0)
                  )
                )
            AS DECIMAL(15,0))
        )
    WHERE 
        (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND
        (p_category_id IS NULL OR p.category_id = p_category_id) AND
        (p_brand IS NULL OR p.brand_origin = p_brand) AND
        (p_form IS NULL OR p.condition = p_form) AND
        (p_finish IS NULL OR p.finish_surface = p_finish) AND
        (p_thickness IS NULL OR p.thickness = p_thickness);
END$$
DELIMITER ;
