const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [c1] = await conn.query("SELECT COUNT(*) as c FROM products WHERE \`condition\` = 'شیت'");
  const [c2] = await conn.query("SELECT COUNT(*) as c FROM products WHERE \`condition\` = 'رول'");
  const [c3] = await conn.query("SELECT COUNT(*) as c FROM products WHERE category_id = 266");
  
  console.log(`- Rule [product_type = شیت]: affects ${c1[0].c} products.`);
  console.log(`- Rule [product_type = رول]: affects ${c2[0].c} products.`);
  console.log(`- Rule [category_id = 266 (decorative)]: affects ${c3[0].c} products.`);
  
  // Also quickly verify Weight behavior from code.
  process.exit(0);
}
main();
