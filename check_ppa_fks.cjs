const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [fk] = await conn.query("SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'steel_mahfa' AND TABLE_NAME = 'product_pricing_attributes' AND REFERENCED_TABLE_NAME IS NOT NULL");
  console.log('Foreign Keys:', fk);
  process.exit(0);
}
main();
