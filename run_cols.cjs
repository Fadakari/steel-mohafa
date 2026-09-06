const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  console.log("--- SHEETS ---");
  const [sheets] = await c.query("SELECT p.id, p.dimensions, p.thickness, ppa.length_m, ppa.width_mm, ppa.thickness_mm FROM products p JOIN product_pricing_attributes ppa ON p.id=ppa.product_id JOIN categories cat ON p.category_id=cat.id WHERE cat.title LIKE '%ورق%' AND ppa.calculated_weight_kg > 0 LIMIT 2");
  console.log(sheets);

  console.log("--- PIPES ---");
  const [pipes] = await c.query("SELECT p.id, p.outer_diameter, p.thickness, ppa.length_m, ppa.outer_diameter_mm, ppa.thickness_mm FROM products p JOIN product_pricing_attributes ppa ON p.id=ppa.product_id JOIN categories cat ON p.category_id=cat.id WHERE cat.title LIKE '%لوله%' AND ppa.calculated_weight_kg > 0 LIMIT 2");
  console.log(pipes);

  console.log("--- BARS ---");
  const [bars] = await c.query("SELECT p.id, p.outer_diameter, p.dimensions, ppa.length_m, ppa.outer_diameter_mm FROM products p JOIN product_pricing_attributes ppa ON p.id=ppa.product_id JOIN categories cat ON p.category_id=cat.id WHERE cat.title LIKE '%میلگرد%' AND ppa.calculated_weight_kg > 0 LIMIT 2");
  console.log(bars);

  process.exit(0);
}
m().catch(console.error);
