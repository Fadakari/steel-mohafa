const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const insertSql = `
    INSERT IGNORE INTO category_base_prices (category_id, base_price)
    SELECT DISTINCT category_id, 660000
    FROM products
    WHERE category_id IS NOT NULL;
  `;
  const [insertRes] = await c.query(insertSql);
  console.log('Inserted Rows:', insertRes.affectedRows);
  
  const selectSql = `
    SELECT cbp.category_id AS ID, c.title AS Category_Title, cbp.base_price AS Base_Price
    FROM category_base_prices cbp
    JOIN categories c ON cbp.category_id = c.id
    ORDER BY RAND()
    LIMIT 10;
  `;
  const [selectRes] = await c.query(selectSql);
  console.table(selectRes);
  
  process.exit(0);
}
m().catch(console.error);
