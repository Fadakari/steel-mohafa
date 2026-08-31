const mysql = require('mysql2/promise');

async function runVersioningTest() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 5: VERSIONING SYSTEM DESIGN & 100-ITEM TEST ---\\n');

    // 1. Create Engine Price History Table
    console.log('1. Creating `engine_price_history` table...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS engine_price_history (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        old_price_per_kg DECIMAL(15,2) DEFAULT 0,
        new_price_per_kg DECIMAL(15,2) DEFAULT 0,
        old_total_price DECIMAL(15,2) DEFAULT 0,
        new_total_price DECIMAL(15,2) DEFAULT 0,
        change_percentage DECIMAL(10,2) DEFAULT 0,
        source VARCHAR(50) DEFAULT 'pricing_engine',
        base_alloy_price_used DECIMAL(15,2) DEFAULT 0,
        pricing_rule_snapshot JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product_id (product_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure clean state for the test
    await conn.execute('TRUNCATE TABLE engine_price_history');

    // 2. Select 100 test products
    console.log('2. Selecting 100 products for testing...');
    const [testProducts] = await conn.execute(`
        SELECT p.id as product_id, 
               dr.current_price as old_price_per_kg,
               ppa.calculated_weight_kg as weight,
               ppa.calculated_price_per_kg as new_price_per_kg,
               ppa.calculated_total_price_per_unit as new_total_price,
               dr.percentage_change,
               dr.rule_snapshot
        FROM products p
        JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
        JOIN pricing_dry_run_reports dr ON p.id = dr.product_id
        WHERE ppa.pricing_strategy = 'FORMULA_WEIGHT'
        AND dr.current_price > 0
        ORDER BY RAND()
        LIMIT 100
    `);

    if (testProducts.length === 0) {
        console.log('No eligible products found for testing.');
        return;
    }

    // 3. Insert into the Versioning System
    let totalPctChange = 0;
    let maxIncreasePct = -Infinity;
    let maxDecreasePct = Infinity;
    let anomaliesCount = 0;
    let newPriceCount = 0;
    
    const samples = [];

    for (const prod of testProducts) {
        const old_total_price = prod.old_price_per_kg * prod.weight;
        const diffAmount = prod.new_price_per_kg - prod.old_price_per_kg;
        let diffPct = 0;
        
        if (prod.old_price_per_kg > 0) {
            diffPct = (diffAmount / prod.old_price_per_kg) * 100;
        }

        let baseAlloyPrice = 0;
        try {
            const snap = JSON.parse(prod.rule_snapshot);
            baseAlloyPrice = snap.alloy_base_price || 0;
        } catch (e) {}

        await conn.execute(`
            INSERT INTO engine_price_history 
            (product_id, old_price_per_kg, new_price_per_kg, old_total_price, new_total_price, change_percentage, source, base_alloy_price_used, pricing_rule_snapshot)
            VALUES (?, ?, ?, ?, ?, ?, 'pricing_engine', ?, ?)
        `, [
            prod.product_id,
            prod.old_price_per_kg,
            prod.new_price_per_kg,
            old_total_price,
            prod.new_total_price,
            Math.abs(diffPct), // Store absolute for 'change_percentage' or raw? The schema allows negatives, but let's store absolute change and determine direction by looking at values, or store raw. Let's store raw.
            baseAlloyPrice,
            prod.rule_snapshot
        ]);

        // Accumulate Stats
        newPriceCount++;
        totalPctChange += diffPct;
        
        if (diffPct > maxIncreasePct) maxIncreasePct = diffPct;
        if (diffPct < maxDecreasePct) maxDecreasePct = diffPct;
        if (Math.abs(diffPct) > 20) anomaliesCount++;
        
        if (samples.length < 20) {
            samples.push({
                product_id: prod.product_id,
                old_kg: prod.old_price_per_kg,
                new_kg: prod.new_price_per_kg,
                change: diffPct.toFixed(2) + '%',
                old_total: Math.round(old_total_price),
                new_total: Math.round(prod.new_total_price)
            });
        }
    }

    const avgChange = (totalPctChange / newPriceCount).toFixed(2);
    
    // Safety check for min/max
    if (maxIncreasePct === -Infinity) maxIncreasePct = 0;
    if (maxDecreasePct === Infinity) maxDecreasePct = 0;

    console.log('\\n=== PHASE 5: 100-ITEM TEST REPORT ===');
    console.log(`- Products assigned new prices (in history): ${newPriceCount}`);
    console.log(`- Average Percentage Change: ${avgChange}%`);
    console.log(`- Maximum Price Increase: +${maxIncreasePct.toFixed(2)}%`);
    console.log(`- Maximum Price Decrease: ${maxDecreasePct.toFixed(2)}%`);
    console.log(`- Anomalies (>20% absolute change): ${anomaliesCount}`);
    
    console.log('\\n--- 20 Sample Changed Products ---');
    console.table(samples);

    console.log('\\n[!] All changes were strictly written to `engine_price_history`. Legacy tables are UNTOUCHED.');

  } catch (e) {
    console.error('Test failed:', e);
  } finally {
    await conn.end();
  }
}

runVersioningTest();
