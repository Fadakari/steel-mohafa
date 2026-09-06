const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const sql = `
  (SELECT 
      p.id, 
      cat.title AS Category_Name, 
      p.dimensions AS Dimensions, 
      p.outer_diameter AS Outer_Diameter, 
      p.thickness AS Thickness, 
      ppa.calculated_weight_kg AS OLD_Weight, 
      ROUND(((ppa.width_mm / 1000) * ppa.length_m * ppa.thickness_mm * (CASE WHEN a.name LIKE '%316%' THEN 7.93 WHEN a.name LIKE '%430%' OR a.name LIKE '%201%' THEN 7.7 ELSE 7.86 END)), 4) AS NEW_Calculated_Weight
  FROM products p
  JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
  JOIN categories cat ON p.category_id = cat.id
  JOIN product_alloy_mapping pam ON pam.product_id = p.id
  JOIN alloy a ON a.id = pam.alloy_id
  WHERE cat.title LIKE '%ورق%' AND ppa.pricing_strategy = 'FORMULA_WEIGHT'
  ORDER BY RAND() LIMIT 5)

  UNION ALL

  (SELECT 
      p.id, 
      cat.title AS Category_Name, 
      p.dimensions AS Dimensions, 
      p.outer_diameter AS Outer_Diameter, 
      p.thickness AS Thickness, 
      ppa.calculated_weight_kg AS OLD_Weight, 
      ROUND((3.14 * (ppa.outer_diameter_mm - ppa.thickness_mm) * ppa.thickness_mm * ppa.length_m * (CASE WHEN a.name LIKE '%316%' THEN 7.93 WHEN a.name LIKE '%430%' OR a.name LIKE '%201%' THEN 7.7 ELSE 7.86 END) / 1000), 4) AS NEW_Calculated_Weight
  FROM products p
  JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
  JOIN categories cat ON p.category_id = cat.id
  JOIN product_alloy_mapping pam ON pam.product_id = p.id
  JOIN alloy a ON a.id = pam.alloy_id
  WHERE cat.title LIKE '%لوله%' AND ppa.pricing_strategy = 'FORMULA_WEIGHT'
  ORDER BY RAND() LIMIT 5)

  UNION ALL

  (SELECT 
      p.id, 
      cat.title AS Category_Name, 
      p.dimensions AS Dimensions, 
      p.outer_diameter AS Outer_Diameter, 
      p.thickness AS Thickness, 
      ppa.calculated_weight_kg AS OLD_Weight, 
      ROUND(((POW(ppa.outer_diameter_mm, 2) / 162) * ppa.length_m), 4) AS NEW_Calculated_Weight
  FROM products p
  JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
  JOIN categories cat ON p.category_id = cat.id
  JOIN product_alloy_mapping pam ON pam.product_id = p.id
  JOIN alloy a ON a.id = pam.alloy_id
  WHERE cat.title LIKE '%میلگرد%' AND ppa.pricing_strategy = 'FORMULA_WEIGHT'
  ORDER BY RAND() LIMIT 5)
  `;
  const [r] = await c.query(sql);
  console.table(r);
  process.exit(0);
}
m().catch(console.error);
