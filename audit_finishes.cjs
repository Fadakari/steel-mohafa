const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  // 1. All finish_surfaces and count
  const [finishes] = await conn.query(`
    SELECT finish_surface, COUNT(*) as count 
    FROM products 
    GROUP BY finish_surface 
    ORDER BY count DESC
  `);

  // 2. Decorative (266) Breakdown
  const [decBreakdown] = await conn.query(`
    SELECT finish_surface, brand_origin, \`condition\` as form, thickness, COUNT(*) as count 
    FROM products 
    WHERE category_id = 266
    GROUP BY finish_surface, brand_origin, \`condition\`, thickness
    ORDER BY count DESC
  `);
  
  // 3. Current calculated price for 304 by Finish
  const [priceByFinish] = await conn.query(`
    SELECT 
      p.finish_surface, 
      COUNT(p.id) as count,
      MIN(ppa.calculated_price_per_kg) as min_price,
      MAX(ppa.calculated_price_per_kg) as max_price,
      AVG(ppa.calculated_price_per_kg) as avg_price
    FROM products p
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    WHERE pam.alloy_id = 1
    GROUP BY p.finish_surface
    ORDER BY count DESC
  `);

  console.log('--- ALL FINISHES ---');
  console.table(finishes);
  
  console.log('\n--- 304 PRICES BY FINISH ---');
  console.table(priceByFinish);
  
  // Group the decorative breakdown for summary
  const decSummary = {};
  decBreakdown.forEach(row => {
    if (!decSummary[row.finish_surface]) decSummary[row.finish_surface] = 0;
    decSummary[row.finish_surface] += row.count;
  });
  console.log('\n--- DECORATIVE (266) FINISH SUMMARY ---');
  console.table(Object.keys(decSummary).map(k => ({ Finish: k, Count: decSummary[k] })));

  process.exit(0);
}

main();
