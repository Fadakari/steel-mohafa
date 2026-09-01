const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  await conn.beginTransaction();

  const [products] = await conn.execute(`
    SELECT p.id as product_id, ppa.base_price_ratio, ppa.calculated_weight_kg as weight 
    FROM products p 
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id 
    JOIN product_alloy_mapping pam ON p.id = pam.product_id 
    WHERE pam.alloy_id = 1 AND ppa.pricing_strategy = 'FORMULA_WEIGHT'
  `);

  const newBasePrice = 100001;

  for(const p of products) {
    if(p.base_price_ratio) {
      const newPrice = Math.round(newBasePrice * parseFloat(p.base_price_ratio));
      await conn.execute('UPDATE product_pricing_attributes SET calculated_price_per_kg = ? WHERE product_id = ?', [newPrice, p.product_id]);
      await conn.execute('INSERT INTO price_history (product_id, price, unit, is_call_for_price, date_created) VALUES (?, ?, "کیلوگرم", 0, NOW())', [p.product_id, newPrice]);
    }
  }

  await conn.commit();
  console.log('Applied new prices using ratio for ' + products.length + ' products');
  process.exit(0);
}
main();
