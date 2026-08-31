const mysql = require('mysql2/promise');

async function runFinalRolloutBatch1() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 5: FINAL ROLLOUT (BATCH 1) ---\\n');

    // 1. Snapshot / Backup Tables
    console.log('1. Creating Final Snapshots (IF NOT EXISTS)...');
    const tablesToBackup = [
      'products',
      'price_history',
      'engine_price_history',
      'product_pricing_attributes',
      'product_alloy_mapping',
      'alloy',
      'pricing_rules'
    ];

    for (const table of tablesToBackup) {
      await conn.execute(`CREATE TABLE IF NOT EXISTS ${table}_snap_phase5 AS SELECT * FROM ${table}`);
    }
    console.log('   All 7 snapshots created successfully.\\n');

    // 2. Select next 1000 unprocessed products
    console.log('2. Selecting 1000 unprocessed products for Live Integration...');
    const [testProducts] = await conn.execute(`
        SELECT p.id as product_id, 
               dr.current_price as old_price,
               dr.current_unit as unit,
               ppa.calculated_weight_kg as weight,
               ppa.calculated_price_per_kg as new_price,
               ppa.calculated_total_price_per_unit as new_total,
               dr.percentage_change,
               dr.rule_snapshot
        FROM products p
        JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
        JOIN pricing_dry_run_reports dr ON p.id = dr.product_id
        WHERE ppa.pricing_strategy = 'FORMULA_WEIGHT'
        AND dr.current_price > 0
        AND p.id NOT IN (SELECT product_id FROM engine_price_history)
        ORDER BY RAND()
        LIMIT 1000
    `);

    if (testProducts.length === 0) {
        console.log('No eligible products found. All products might have been processed.');
        return;
    }

    // Begin Transaction for Safety
    await conn.beginTransaction();

    let successCount = 0;
    let totalPctChange = 0;
    let maxIncreasePct = -Infinity;
    let maxDecreasePct = Infinity;
    let anomalies = 0;
    let errors = 0;
    const samples = [];

    for (const prod of testProducts) {
        try {
            const oldTotal = prod.old_price * prod.weight;
            
            let baseAlloyPrice = 0;
            try {
                baseAlloyPrice = JSON.parse(prod.rule_snapshot).alloy_base_price || 0;
            } catch (e) {}

            const diffPct = prod.old_price > 0 ? ((prod.new_price - prod.old_price) / prod.old_price) * 100 : 0;

            // L1: engine_price_history
            await conn.execute(`
                INSERT INTO engine_price_history 
                (product_id, old_price_per_kg, new_price_per_kg, old_total_price, new_total_price, change_percentage, source, base_alloy_price_used, pricing_rule_snapshot)
                VALUES (?, ?, ?, ?, ?, ?, 'pricing_engine', ?, ?)
            `, [
                prod.product_id, prod.old_price, prod.new_price, oldTotal, prod.new_total, 
                Math.abs(diffPct), baseAlloyPrice, prod.rule_snapshot
            ]);

            // L2: price_history
            await conn.execute(`
                INSERT INTO price_history 
                (product_id, price, unit, is_call_for_price, date_created)
                VALUES (?, ?, ?, 0, NOW())
            `, [
                prod.product_id, Math.round(prod.new_price), prod.unit || 'کیلوگرم'
            ]);
            
            successCount++;

            // Stats
            totalPctChange += diffPct;
            if (diffPct > maxIncreasePct) maxIncreasePct = diffPct;
            if (diffPct < maxDecreasePct) maxDecreasePct = diffPct;
            if (Math.abs(diffPct) > 20) anomalies++;

            if (samples.length < 10) {
                samples.push({
                    product_id: prod.product_id,
                    old_kg: prod.old_price,
                    new_kg: prod.new_price,
                    change: diffPct.toFixed(2) + '%',
                });
            }
        } catch (err) {
            errors++;
            console.error(`Error syncing product ${prod.product_id}:`, err);
        }
    }

    // Commit Transaction
    if (errors === 0) {
        await conn.commit();
        console.log('3. Live Integration Successful. Transaction Committed.\\n');
    } else {
        await conn.rollback();
        console.log('3. Errors detected. Transaction Rolled Back.\\n');
    }

    const avgChange = (totalPctChange / successCount).toFixed(2);
    if (maxIncreasePct === -Infinity) maxIncreasePct = 0;
    if (maxDecreasePct === Infinity) maxDecreasePct = 0;

    console.log('=== FINAL ROLLOUT: BATCH 1 REPORT ===');
    console.log(`- Processed Products: ${successCount}`);
    console.log(`- Errors (Rolled Back if > 0): ${errors}`);
    console.log(`- Average Percentage Change: ${avgChange}%`);
    console.log(`- Maximum Price Increase: +${maxIncreasePct.toFixed(2)}%`);
    console.log(`- Maximum Price Decrease: ${maxDecreasePct.toFixed(2)}%`);
    console.log(`- Anomalies (>20% absolute diff): ${anomalies}`);

    console.log('\\n--- 10 Live Sync Samples ---');
    console.table(samples);

  } catch (e) {
    console.error('Rollout failed:', e);
    if (conn) await conn.rollback();
  } finally {
    await conn.end();
  }
}

runFinalRolloutBatch1();
