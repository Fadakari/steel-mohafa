const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [products] = await conn.execute(`
    SELECT p.id as product_id, ppa.calculated_price_per_kg, pam.alloy_id 
    FROM products p 
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id 
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
  `);
  
  const basePrices = { 1: 219000, 2: 289000, 3: 136000, 4: 298000, 5: 154000, 6: 156000, 7: 394000, 8: 163000, 9: 365000 };
  
  await conn.beginTransaction();
  for(const p of products) {
    const base = basePrices[p.alloy_id];
    if(base && p.calculated_price_per_kg) {
      const ratio = parseFloat(p.calculated_price_per_kg) / base;
      await conn.execute('UPDATE product_pricing_attributes SET base_price_ratio = ? WHERE product_id = ?', [ratio.toFixed(4), p.product_id]);
    }
  }
  await conn.commit();
  console.log('Populated base_price_ratio for ' + products.length + ' products');
  process.exit(0);
}
main();
