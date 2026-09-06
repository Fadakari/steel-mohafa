const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [rows] = await c.query('SELECT product_id, price, date_created FROM price_history ORDER BY id DESC LIMIT 20');
  console.log(rows);
  process.exit(0);
}
m().catch(console.error);
