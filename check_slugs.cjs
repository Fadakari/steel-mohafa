const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [cats] = await conn.query("SELECT slug FROM categories WHERE parent_id = (SELECT id FROM categories WHERE slug = 'ورق-استیل' LIMIT 1)");
  console.log(cats);
  process.exit(0);
}
main();
