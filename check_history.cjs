const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [rows] = await conn.execute(`SELECT * FROM price_history WHERE product_id = 27589 AND date_created < '2026-08-30' ORDER BY date_created DESC LIMIT 1`);
  console.log(rows);
  
  const [rows2] = await conn.execute(`SELECT * FROM products WHERE id = 27589`);
  console.log("product 27589 brand:", rows2[0].brand_origin);

  const [rows3] = await conn.execute(`SELECT id FROM products WHERE brand_origin = 'تایوان' AND thickness=0.5 AND dimensions='1000x2000' AND finish_surface='مات 2B' AND \`condition\`='شیت'`);
  console.log("Taiwan IDs:", rows3.map(r => r.id));
  
  process.exit(0);
}
main();
