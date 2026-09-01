const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  for (let id of [27591, 27592, 27588, 27589]) {
    const [rows] = await conn.execute(`SELECT price FROM price_history WHERE product_id = ${id} AND date_created < '2026-08-30' ORDER BY date_created DESC LIMIT 1`);
    console.log(`Historical price for ${id}:`, rows[0]?.price);
  }
  process.exit(0);
}
main();
