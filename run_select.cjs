const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  await c.query('INSERT IGNORE INTO category_base_prices (category_id, base_price) VALUES (266, 660000)');
  const sql = `
  SELECT 
    p.id, 
    a.name AS alloy, 
    p.brand_origin, 
    p.finish_surface, 
    ppa.calculated_weight_kg, 
    (cbp.base_price * 
      (CASE WHEN a.name LIKE '%316%' THEN 1.380 WHEN a.name LIKE '%201%' THEN 0.650 WHEN a.name LIKE '%430%' THEN 0.540 ELSE 1.000 END) * 
      (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * 
      (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END)
    ) AS Calculated_Price_Per_Kg, 
    ROUND(
      (cbp.base_price * 
        (CASE WHEN a.name LIKE '%316%' THEN 1.380 WHEN a.name LIKE '%201%' THEN 0.650 WHEN a.name LIKE '%430%' THEN 0.540 ELSE 1.000 END) * 
        (CASE WHEN p.brand_origin LIKE '%تایوان%' THEN 1.000 WHEN p.brand_origin LIKE '%چین%' THEN 0.965 WHEN p.brand_origin LIKE '%هند%' THEN 0.955 ELSE 1.000 END) * 
        (CASE WHEN p.finish_surface LIKE '%طلایی%' THEN 1.350 WHEN p.finish_surface LIKE '%رزگلد%' THEN 1.380 WHEN p.finish_surface LIKE '%میرور%' OR p.finish_surface LIKE '%BA%' THEN 1.085 WHEN p.finish_surface LIKE '%خشدار%' THEN 1.055 ELSE 1.000 END)
      ) * ppa.calculated_weight_kg, -3
    ) AS Calculated_Total_Unit_Price 
  FROM products p 
  JOIN product_pricing_attributes ppa ON ppa.product_id = p.id 
  JOIN product_alloy_mapping pam ON pam.product_id = p.id 
  JOIN alloy a ON a.id = pam.alloy_id 
  JOIN category_base_prices cbp ON cbp.category_id = p.category_id 
  WHERE p.category_id = 266 
  ORDER BY RAND() 
  LIMIT 5;
  `;
  const [r] = await c.query(sql);
  console.table(r);
  process.exit(0);
}
m().catch(console.error);
