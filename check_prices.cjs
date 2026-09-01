const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const [r1] = await conn.query('SELECT price FROM product WHERE id=27587');
  console.log('product.price:', r1.length > 0 ? r1[0].price : 'NOT FOUND');
  
  const [r2] = await conn.query('SELECT price FROM price_history WHERE product_id=27587 ORDER BY id DESC LIMIT 1');
  console.log('price_history:', r2.length > 0 ? r2[0].price : 'NOT FOUND');
  
  process.exit(0);
}
main();
