const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  try {
    await c.query('CREATE INDEX idx_products_category ON products(category_id)');
    console.log('Created index idx_products_category');
  } catch(e) { console.log(e.message) }

  try {
    await c.query('CREATE INDEX idx_price_history_product ON price_history(product_id)');
    console.log('Created index idx_price_history_product');
  } catch(e) { console.log(e.message) }
  
  process.exit(0);
}
m().catch(console.error);
