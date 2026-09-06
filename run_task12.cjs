const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const [tables] = await c.query("SHOW TABLES LIKE '%price_history%'");
  console.log('Tables found:', tables);
  
  if (tables.length > 0) {
      const tableName = Object.values(tables[0])[0];
      const [schema] = await c.query(`DESCRIBE \`${tableName}\``);
      console.table(schema);
  } else {
      const [allPriceTables] = await c.query("SHOW TABLES LIKE '%price%'");
      console.log('Other price related tables:', allPriceTables);
  }
  
  process.exit(0);
}
m().catch(console.error);
