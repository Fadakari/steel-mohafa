const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [r1] = await conn.query("SELECT id, name, price FROM product LIMIT 10");
  console.log("product table sample:", r1);
  process.exit(0);
}
main();
