const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'steel_mahfa',
    dateStrings: true
  });

  console.log("=== 1. وضعیت جداول ===");
  const tables = [
    'products', 'price_history', 'engine_price_history', 
    'product_pricing_attributes', 'product_alloy_mapping', 
    'alloy', 'pricing_rules', 'pricing_sync_preview', 'alloy_price_history'
  ];

  for (const table of tables) {
    try {
      const [countRes] = await conn.execute(`SELECT COUNT(*) as c FROM ${table}`);
      const [schemaRes] = await conn.execute(`DESCRIBE ${table}`);
      console.log(`\nTable: ${table} | Rows: ${countRes[0].c}`);
      const pk = schemaRes.find(c => c.Key === 'PRI')?.Field || 'None';
      console.log(`PK: ${pk}`);
    } catch (e) {
      console.log(`Table ${table} Error: ${e.message}`);
    }
  }

  console.log("\n=== 2 & 3. وضعیت Historical Multiplier ===");
  const [ratioCheck] = await conn.execute(`
    SELECT COUNT(base_price_ratio) as c, MIN(base_price_ratio) as min_r, MAX(base_price_ratio) as max_r 
    FROM product_pricing_attributes 
    WHERE base_price_ratio IS NOT NULL
  `);
  console.log(`base_price_ratio records: ${ratioCheck[0].c}`);
  console.log(`Min: ${ratioCheck[0].min_r}, Max: ${ratioCheck[0].max_r}`);

  console.log("\n=== 8. بررسی قیمت نمونه‌ای که داشتیم (304 0.5 1000x2000 2B) ===");
  const [sampleProducts] = await conn.execute(`
    SELECT p.id, p.brand_origin, p.condition, p.finish_surface, ppa.calculated_price_per_kg, ppa.base_price_ratio
    FROM products p
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    WHERE pam.alloy_id = 1 
      AND p.thickness = 0.5 
      AND p.dimensions = '1000x2000'
      AND p.finish_surface = 'مات 2B'
  `);
  console.table(sampleProducts);

  console.log("\n=== 9. امکان بازیابی قیمت‌های قدیمی ===");
  const [oldHistory] = await conn.execute(`
    SELECT COUNT(*) as c FROM price_history WHERE date_created < '2026-08-30'
  `);
  console.log(`Valid historical price records before tests: ${oldHistory[0].c}`);

  await conn.end();
}
main();
