const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  await conn.beginTransaction();

  const alloyId = 1; // 304
  const newBasePrice = 100001;

  const [rules] = await conn.execute('SELECT * FROM pricing_rules WHERE rule_type = "category"');
  const rulesMap = {};
  rules.forEach(r => { rulesMap[r.category_id] = parseFloat(r.multiplier); });

  const [products] = await conn.execute(`
    SELECT p.id as product_id, p.category_id, ppa.product_type, ppa.calculated_price_per_kg as old_price, ppa.calculated_weight_kg as weight 
    FROM products p 
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id 
    JOIN product_alloy_mapping pam ON p.id = pam.product_id 
    WHERE pam.alloy_id = ? AND ppa.pricing_strategy = 'FORMULA_WEIGHT'
  `, [alloyId]);

  for (const p of products) {
    const mult = rulesMap[p.category_id] || 1.0;
    const newPrice = Math.round(newBasePrice * mult);
    const newTotal = newPrice * p.weight;
    const oldTotal = p.old_price * p.weight;

    await conn.execute('UPDATE product_pricing_attributes SET calculated_price_per_kg = ?, calculated_total_price_per_unit = ? WHERE product_id = ?', [newPrice, newTotal, p.product_id]);
    
    await conn.execute('INSERT INTO engine_price_history (product_id, old_price_per_kg, new_price_per_kg, old_total_price, new_total_price, change_percentage, source, base_alloy_price_used) VALUES (?, ?, ?, ?, ?, ?, "directus_sync_engine", ?)', 
      [p.product_id, p.old_price, newPrice, oldTotal, newTotal, (((newPrice - p.old_price) / p.old_price) * 100).toFixed(2), newBasePrice]);
      
    await conn.execute('INSERT INTO price_history (product_id, price, unit, is_call_for_price, date_created) VALUES (?, ?, "کیلوگرم", 0, NOW())', [p.product_id, newPrice]);
  }

  await conn.commit();
  console.log('Successfully committed ' + products.length + ' price updates for Alloy 304!');
  process.exit(0);
}

main();
