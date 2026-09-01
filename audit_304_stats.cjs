const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const [stats] = await conn.query(`
    SELECT 
      p.brand_origin, 
      p.condition as form, 
      p.finish_surface, 
      p.thickness, 
      p.category_id,
      COUNT(p.id) as product_count,
      MIN(ppa.calculated_price_per_kg) as min_price,
      MAX(ppa.calculated_price_per_kg) as max_price,
      AVG(ppa.calculated_price_per_kg) as avg_price
    FROM products p
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    WHERE pam.alloy_id = 1  -- 304 is alloy 1
    GROUP BY p.brand_origin, p.condition, p.finish_surface, p.thickness, p.category_id
    ORDER BY p.category_id, p.condition, p.brand_origin, p.thickness
  `);
  
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
}

main();
