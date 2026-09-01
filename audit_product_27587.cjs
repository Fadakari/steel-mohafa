const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const productId = 27587; // Taiwan Sheet 304 0.5 2B

  const data = {};

  // 1. products
  const [products] = await conn.query('SELECT * FROM products WHERE id = ?', [productId]);
  data.products = products[0] || null;

  // 2. product (legacy)
  const [product] = await conn.query('SELECT * FROM product WHERE id = ?', [productId]);
  data.product = product[0] || null;

  // 3. product_pricing_attributes
  const [ppa] = await conn.query('SELECT * FROM product_pricing_attributes WHERE product_id = ?', [productId]);
  data.ppa = ppa[0] || null;

  // 4. price_history
  const [ph] = await conn.query('SELECT * FROM price_history WHERE product_id = ? ORDER BY date_created DESC, id DESC LIMIT 1', [productId]);
  data.price_history = ph[0] || null;

  // 5. engine_price_history
  try {
    const [eph] = await conn.query('SELECT * FROM engine_price_history WHERE product_id = ? ORDER BY id DESC LIMIT 1', [productId]);
    data.engine_price_history = eph[0] || null;
  } catch (e) {
    data.engine_price_history = "Table or columns not matching/found";
  }

  // 6. alloy
  const [alloyMap] = await conn.query('SELECT alloy_id FROM product_alloy_mapping WHERE product_id = ?', [productId]);
  if (alloyMap.length > 0) {
    const [alloy] = await conn.query('SELECT * FROM alloy WHERE id = ?', [alloyMap[0].alloy_id]);
    data.alloy = alloy[0] || null;
  }

  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

main();
