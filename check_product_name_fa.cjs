const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [r1] = await conn.query("SELECT id, name, price, attributes FROM product WHERE name LIKE '%تایوان%' AND name LIKE '%304%' LIMIT 10");
  console.log("product table:", r1);
  process.exit(0);
}
main();
