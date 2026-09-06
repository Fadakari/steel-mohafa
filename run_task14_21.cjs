const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [rows] = await c.query('DESCRIBE products');
  console.log(rows);
  process.exit(0);
}
m().catch(console.error);
