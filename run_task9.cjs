const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  await c.query('DROP TRIGGER IF EXISTS after_category_price_update');
  
  const triggerSql = `
  CREATE TRIGGER after_category_price_update
  AFTER UPDATE ON category_base_prices
  FOR EACH ROW
  BEGIN
      IF NEW.base_price <> OLD.base_price THEN
          UPDATE product_pricing_attributes ppa
          JOIN products p ON p.id = ppa.product_id
          SET 
              ppa.calculated_price_per_kg = NEW.base_price * 
                  (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * 
                  (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END),
              ppa.calculated_total_price_per_unit = ROUND(
                  (NEW.base_price * 
                  (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * 
                  (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END)) * ppa.calculated_weight_kg, -3)
          WHERE p.category_id = NEW.category_id AND ppa.pricing_strategy IN ('FORMULA_WEIGHT', 'FIXED_WEIGHT');
      END IF;
  END;
  `;
  await c.query(triggerSql);
  console.log('Trigger replaced successfully.');

  const updateSql = `
    UPDATE product_pricing_attributes ppa
    JOIN products p ON p.id = ppa.product_id
    JOIN category_base_prices cbp ON cbp.category_id = p.category_id
    SET 
        ppa.calculated_price_per_kg = cbp.base_price * 
            (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * 
            (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END),
        ppa.calculated_total_price_per_unit = ROUND((cbp.base_price * 
            (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * 
            (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END)) * ppa.calculated_weight_kg, -3)
    WHERE ppa.pricing_strategy IN ('FORMULA_WEIGHT', 'FIXED_WEIGHT');
  `;
  const [res2] = await c.query(updateSql);
  console.log('Global Price Sync Updated Rows:', res2.affectedRows);

  const selectSql = `
    SELECT 
        p.id, 
        c.title AS category_title,
        cbp.base_price, 
        ppa.calculated_price_per_kg, 
        ppa.calculated_weight_kg,
        ppa.calculated_total_price_per_unit
    FROM products p
    JOIN product_pricing_attributes ppa ON ppa.product_id = p.id
    JOIN category_base_prices cbp ON cbp.category_id = p.category_id
    JOIN categories c ON p.category_id = c.id
    WHERE c.title LIKE '%201%' AND ppa.pricing_strategy IN ('FORMULA_WEIGHT', 'FIXED_WEIGHT')
    ORDER BY RAND() 
    LIMIT 5;
  `;
  const [res3] = await c.query(selectSql);
  console.table(res3);
  
  process.exit(0);
}
m().catch(console.error);
