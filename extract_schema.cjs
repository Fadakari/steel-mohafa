const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const [sp] = await conn.query("SHOW CREATE PROCEDURE sp_recalculate_pricing");
  console.log("=== SP ===");
  console.log(sp[0]['Create Procedure']);
  
  const [tbl] = await conn.query("SHOW CREATE TABLE pricing_rules");
  console.log("=== TABLE ===");
  console.log(tbl[0]['Create Table']);
  
  process.exit(0);
}

main();
