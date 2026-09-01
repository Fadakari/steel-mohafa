const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  await conn.beginTransaction();

  // Find the last legitimate price from before our AI scripts started messing with them
  // The user said the original prices (like 191000) were correct.
  const [history] = await conn.execute(`
    SELECT product_id, price 
    FROM (
      SELECT product_id, price, ROW_NUMBER() OVER(PARTITION BY product_id ORDER BY date_created DESC) as rn
      FROM price_history
      WHERE date_created < '2026-08-30'
    ) tmp
    WHERE rn = 1
  `);

  console.log(`Found historical prices for ${history.length} products.`);

  // Get base prices from alloy table
  const [alloys] = await conn.execute('SELECT id, basePrice FROM alloy');
  const basePrices = {};
  alloys.forEach(a => { basePrices[a.id] = parseFloat(a.basePrice); });

  // Get product to alloy mappings
  const [mappings] = await conn.execute('SELECT product_id, alloy_id FROM product_alloy_mapping');
  const productAlloy = {};
  mappings.forEach(m => { productAlloy[m.product_id] = m.alloy_id; });

  // Update base_price_ratio
  let updateCount = 0;
  for (const h of history) {
    const alloyId = productAlloy[h.product_id];
    if (alloyId && basePrices[alloyId]) {
      // The historical base prices were roughly: 304=219000, 316=309000
      // But wait! We don't know the exact historical base price of the alloy at the time the price was 191000!
      // If the historical product price was 191000, and the historical base price was 219000, the ratio is 191/219.
      // But where is the historical base price stored? The `alloy` table was only recently created!
      // In Phase 9, we assumed: 304 = 219000, 316 = 309000, 201 = 136000.
      let historicalBase = 0;
      if (alloyId === 1) historicalBase = 219000;
      else if (alloyId === 2) historicalBase = 309000;
      else if (alloyId === 3) historicalBase = 136000;
      else if (alloyId === 4) historicalBase = 319000; // 321
      else if (alloyId === 5) historicalBase = 154000; // 430
      else if (alloyId === 6) historicalBase = 156000; // 410
      else if (alloyId === 7) historicalBase = 394000; // 310
      else if (alloyId === 8) historicalBase = 163000; // 420
      else historicalBase = basePrices[alloyId];

      const ratio = h.price / historicalBase;
      
      // Update the ratio
      await conn.execute('UPDATE product_pricing_attributes SET base_price_ratio = ? WHERE product_id = ?', [ratio.toFixed(6), h.product_id]);
      
      // Apply the current base price from alloy table
      const currentBase = basePrices[alloyId];
      const newPrice = Math.round(currentBase * ratio);
      
      await conn.execute('UPDATE product_pricing_attributes SET calculated_price_per_kg = ? WHERE product_id = ?', [newPrice, h.product_id]);
      await conn.execute('INSERT INTO price_history (product_id, price, unit, is_call_for_price, date_created) VALUES (?, ?, "کیلوگرم", 0, NOW())', [h.product_id, newPrice]);
      
      updateCount++;
    }
  }

  await conn.commit();
  console.log(`Successfully restored ratios and applied new prices for ${updateCount} products.`);
  process.exit(0);
}
main();
