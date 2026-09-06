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
          JOIN categories cat ON cat.id = p.category_id
          SET 
              ppa.calculated_price_per_kg = IF(cat.title LIKE '%ورق%' OR cat.title LIKE '%لوله%' OR cat.title LIKE '%میلگرد%' OR cat.title LIKE '%پروفیل%', 
                  NEW.base_price * (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END), 
                  ppa.calculated_price_per_kg),
                  
              ppa.calculated_total_price_per_unit = ROUND(
                  IF(cat.title LIKE '%ورق%' OR cat.title LIKE '%لوله%' OR cat.title LIKE '%میلگرد%' OR cat.title LIKE '%پروفیل%', 
                      (NEW.base_price * (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END)) * ppa.calculated_weight_kg,
                      NEW.base_price * 
                      (CASE 
                          WHEN cat.title LIKE '%مفتول%' OR cat.title LIKE '%سیم%' THEN ppa.calculated_weight_kg
                          WHEN p.dimensions LIKE '%1/8%' OR p.outer_diameter LIKE '%1/8%' THEN 0.3
                          WHEN p.dimensions LIKE '%1/4%' OR p.outer_diameter LIKE '%1/4%' THEN 0.4
                          WHEN p.dimensions LIKE '%3/8%' OR p.outer_diameter LIKE '%3/8%' THEN 0.5
                          WHEN p.dimensions LIKE '%1/2%' OR p.outer_diameter LIKE '%1/2%' THEN 0.6
                          WHEN p.dimensions LIKE '%3/4%' OR p.outer_diameter LIKE '%3/4%' THEN 0.8
                          WHEN p.dimensions LIKE '%1 1/4%' OR p.outer_diameter LIKE '%1 1/4%' THEN 1.5
                          WHEN p.dimensions LIKE '%1 1/2%' OR p.outer_diameter LIKE '%1 1/2%' THEN 2.0
                          WHEN p.dimensions LIKE '%2 1/2%' OR p.outer_diameter LIKE '%2 1/2%' THEN 4.5
                          WHEN p.dimensions LIKE '%2%' OR p.outer_diameter LIKE '%2%' THEN 3.0
                          WHEN p.dimensions LIKE '%3%' OR p.outer_diameter LIKE '%3%' THEN 6.0
                          WHEN p.dimensions LIKE '%4%' OR p.outer_diameter LIKE '%4%' THEN 10.0
                          WHEN p.dimensions LIKE '%5%' OR p.outer_diameter LIKE '%5%' THEN 15.0
                          WHEN p.dimensions LIKE '%6%' OR p.outer_diameter LIKE '%6%' THEN 22.0
                          WHEN p.dimensions LIKE '%8%' OR p.outer_diameter LIKE '%8%' THEN 40.0
                          WHEN p.dimensions LIKE '%10%' OR p.outer_diameter LIKE '%10%' THEN 65.0
                          WHEN p.dimensions LIKE '%12%' OR p.outer_diameter LIKE '%12%' THEN 100.0
                          WHEN p.dimensions LIKE '%1%' OR p.outer_diameter LIKE '%1%' THEN 1.0
                          ELSE 1.0 
                      END) * (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END)
                  ), -3)
          WHERE p.category_id = NEW.category_id;
      END IF;
  END;
  `;
  await c.query(triggerSql);
  console.log('Unified Trigger created successfully.');

  const updateSql = `
    UPDATE product_pricing_attributes ppa
    JOIN products p ON p.id = ppa.product_id
    JOIN categories cat ON cat.id = p.category_id
    JOIN category_base_prices cbp ON cbp.category_id = p.category_id
    SET 
        ppa.calculated_price_per_kg = IF(cat.title LIKE '%ورق%' OR cat.title LIKE '%لوله%' OR cat.title LIKE '%میلگرد%' OR cat.title LIKE '%پروفیل%', 
            cbp.base_price * (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END), 
            ppa.calculated_price_per_kg),
            
        ppa.calculated_total_price_per_unit = ROUND(
            IF(cat.title LIKE '%ورق%' OR cat.title LIKE '%لوله%' OR cat.title LIKE '%میلگرد%' OR cat.title LIKE '%پروفیل%', 
                (cbp.base_price * (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END)) * ppa.calculated_weight_kg,
                cbp.base_price * 
                (CASE 
                    WHEN cat.title LIKE '%مفتول%' OR cat.title LIKE '%سیم%' THEN ppa.calculated_weight_kg
                    WHEN p.dimensions LIKE '%1/8%' OR p.outer_diameter LIKE '%1/8%' THEN 0.3
                    WHEN p.dimensions LIKE '%1/4%' OR p.outer_diameter LIKE '%1/4%' THEN 0.4
                    WHEN p.dimensions LIKE '%3/8%' OR p.outer_diameter LIKE '%3/8%' THEN 0.5
                    WHEN p.dimensions LIKE '%1/2%' OR p.outer_diameter LIKE '%1/2%' THEN 0.6
                    WHEN p.dimensions LIKE '%3/4%' OR p.outer_diameter LIKE '%3/4%' THEN 0.8
                    WHEN p.dimensions LIKE '%1 1/4%' OR p.outer_diameter LIKE '%1 1/4%' THEN 1.5
                    WHEN p.dimensions LIKE '%1 1/2%' OR p.outer_diameter LIKE '%1 1/2%' THEN 2.0
                    WHEN p.dimensions LIKE '%2 1/2%' OR p.outer_diameter LIKE '%2 1/2%' THEN 4.5
                    WHEN p.dimensions LIKE '%2%' OR p.outer_diameter LIKE '%2%' THEN 3.0
                    WHEN p.dimensions LIKE '%3%' OR p.outer_diameter LIKE '%3%' THEN 6.0
                    WHEN p.dimensions LIKE '%4%' OR p.outer_diameter LIKE '%4%' THEN 10.0
                    WHEN p.dimensions LIKE '%5%' OR p.outer_diameter LIKE '%5%' THEN 15.0
                    WHEN p.dimensions LIKE '%6%' OR p.outer_diameter LIKE '%6%' THEN 22.0
                    WHEN p.dimensions LIKE '%8%' OR p.outer_diameter LIKE '%8%' THEN 40.0
                    WHEN p.dimensions LIKE '%10%' OR p.outer_diameter LIKE '%10%' THEN 65.0
                    WHEN p.dimensions LIKE '%12%' OR p.outer_diameter LIKE '%12%' THEN 100.0
                    WHEN p.dimensions LIKE '%1%' OR p.outer_diameter LIKE '%1%' THEN 1.0
                    ELSE 1.0 
                END) * (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END)
            ), -3);
  `;
  const [res2] = await c.query(updateSql);
  console.log('Final Mass UPDATE Sync Affected Rows:', res2.affectedRows);
  
  process.exit(0);
}
m().catch(console.error);
