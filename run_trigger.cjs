const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  await c.query('DROP TRIGGER IF EXISTS after_category_price_update');
  
  const sql = `
  CREATE TRIGGER after_category_price_update
  AFTER UPDATE ON category_base_prices
  FOR EACH ROW
  BEGIN
      IF NEW.base_price <> OLD.base_price THEN
          UPDATE product_pricing_attributes ppa
          JOIN products p ON p.id = ppa.product_id
          JOIN product_alloy_mapping pam ON pam.product_id = p.id
          JOIN alloy a ON a.id = pam.alloy_id
          SET 
              ppa.calculated_price_per_kg = NEW.base_price * 
                  (CASE WHEN a.name LIKE '%316%' THEN 1.380 WHEN a.name LIKE '%201%' THEN 0.650 WHEN a.name LIKE '%430%' THEN 0.540 ELSE 1.000 END) * 
                  (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * 
                  (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END),
              ppa.calculated_total_price_per_unit = ROUND(
                  (NEW.base_price * 
                  (CASE WHEN a.name LIKE '%316%' THEN 1.380 WHEN a.name LIKE '%201%' THEN 0.650 WHEN a.name LIKE '%430%' THEN 0.540 ELSE 1.000 END) * 
                  (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * 
                  (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END)) * ppa.calculated_weight_kg, -3)
          WHERE p.category_id = NEW.category_id;
      END IF;
  END;
  `;
  
  await c.query(sql);
  console.log('Trigger created successfully.');
  process.exit(0);
}
m().catch(console.error);
