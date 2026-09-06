const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const [schema] = await c.query("DESCRIBE price_history");
  console.log("=== price_history ===");
  console.table(schema);
  
  process.exit(0);
}
m().catch(console.error);
