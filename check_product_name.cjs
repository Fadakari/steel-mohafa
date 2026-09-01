const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const [r1] = await conn.query("SELECT id, name, price, attributes FROM product WHERE name LIKE '%304%' AND name LIKE '%تایوان%' AND name LIKE '%0.5%' LIMIT 5");
  console.log("product table:", r1);
  
  const [r2] = await conn.query("SELECT * FROM products WHERE brand_origin LIKE '%تایوان%' AND thickness = '0.5' LIMIT 2");
  console.log("products table:", r2);
  
  process.exit(0);
}
main();
