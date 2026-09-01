const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [tables] = await conn.query("SHOW TABLES LIKE 'product%'");
  console.log("Tables:", tables);
  
  const [cols1] = await conn.query("SHOW COLUMNS FROM product");
  console.log("Columns in product:", cols1.map(c => c.Field));
  
  try {
      const [cols2] = await conn.query("SHOW COLUMNS FROM products");
      console.log("Columns in products:", cols2.map(c => c.Field));
  } catch(e) {}
  
  process.exit(0);
}
main();
