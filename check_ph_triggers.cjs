const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [t] = await conn.query("SHOW TRIGGERS WHERE `Table` = 'price_history'");
  console.log(t);
  process.exit(0);
}
main();
