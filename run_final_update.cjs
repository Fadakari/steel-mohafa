const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  // Step 5.1: UPDATE Weights
  const updateWeightsSql = `
    UPDATE product_pricing_attributes ppa
    JOIN products p ON p.id = ppa.product_id
    JOIN categories cat ON p.category_id = cat.id
    JOIN product_alloy_mapping pam ON pam.product_id = p.id
    JOIN alloy a ON a.id = pam.alloy_id
    SET ppa.calculated_weight_kg = 
        CASE 
            WHEN cat.title LIKE '%ورق%' THEN 
                ((ppa.width_mm / 1000) * COALESCE(ppa.length_m, 2) * ppa.thickness_mm * 
                (CASE WHEN a.name LIKE '%316%' THEN 7.93 WHEN a.name LIKE '%430%' OR a.name LIKE '%201%' THEN 7.7 ELSE 7.86 END))
            WHEN cat.title LIKE '%لوله%' THEN 
                (3.14 * (ppa.outer_diameter_mm - ppa.thickness_mm) * ppa.thickness_mm * COALESCE(ppa.length_m, 6) * 
                (CASE WHEN a.name LIKE '%316%' THEN 7.93 WHEN a.name LIKE '%430%' OR a.name LIKE '%201%' THEN 7.7 ELSE 7.86 END) / 1000)
            WHEN cat.title LIKE '%میلگرد%' THEN 
                ((POW(ppa.outer_diameter_mm, 2) / 162) * COALESCE(ppa.length_m, 6))
            ELSE ppa.calculated_weight_kg
        END
    WHERE ppa.pricing_strategy = 'FORMULA_WEIGHT' 
      AND (cat.title LIKE '%ورق%' OR cat.title LIKE '%لوله%' OR cat.title LIKE '%میلگرد%');
  `;
  const [res1] = await c.query(updateWeightsSql);
  console.log('Weights Updated:', res1.affectedRows);

  // Step 5.2: UPDATE Prices
  const updatePricesSql = `
    UPDATE product_pricing_attributes ppa
    JOIN products p ON p.id = ppa.product_id
    JOIN product_alloy_mapping pam ON pam.product_id = p.id
    JOIN alloy a ON a.id = pam.alloy_id
    JOIN category_base_prices cbp ON cbp.category_id = p.category_id
    SET 
        ppa.calculated_price_per_kg = 
            (cbp.base_price * 
             (CASE WHEN a.name LIKE '%316%' THEN 1.380 WHEN a.name LIKE '%201%' THEN 0.650 WHEN a.name LIKE '%430%' THEN 0.540 ELSE 1.000 END) * 
             (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * 
             (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END)
            ),
        ppa.calculated_total_price_per_unit = 
            ROUND(
                (cbp.base_price * 
                 (CASE WHEN a.name LIKE '%316%' THEN 1.380 WHEN a.name LIKE '%201%' THEN 0.650 WHEN a.name LIKE '%430%' THEN 0.540 ELSE 1.000 END) * 
                 (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * 
                 (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END)
                ) * ppa.calculated_weight_kg, -3
            );
  `;
  const [res2] = await c.query(updatePricesSql);
  console.log('Prices Updated:', res2.affectedRows);

  // Verification
  const verifySql = `
    SELECT 
        p.id, 
        a.name AS alloy, 
        p.brand_origin, 
        p.finish_surface, 
        ppa.calculated_weight_kg, 
        ppa.calculated_price_per_kg, 
        ppa.calculated_total_price_per_unit
    FROM products p
    JOIN product_pricing_attributes ppa ON ppa.product_id = p.id
    JOIN product_alloy_mapping pam ON pam.product_id = p.id
    JOIN alloy a ON a.id = pam.alloy_id
    WHERE p.category_id = 266
    ORDER BY RAND() 
    LIMIT 3;
  `;
  const [res3] = await c.query(verifySql);
  console.table(res3);
  process.exit(0);
}
m().catch(console.error);
