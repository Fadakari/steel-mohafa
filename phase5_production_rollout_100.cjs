const mysql = require('mysql2/promise');

async function runProductionRollout() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 5: PRODUCTION INTEGRATION (100-ITEM ROLLOUT) ---\\n');

    // 1. Safe Backup of Production Tables within MySQL
    console.log('1. Creating localized database backups...');
    await conn.execute('CREATE TABLE IF NOT EXISTS price_history_backup AS SELECT * FROM price_history');
    await conn.execute('CREATE TABLE IF NOT EXISTS engine_price_history_backup AS SELECT * FROM engine_price_history');
    console.log('   Backups `price_history_backup` and `engine_price_history_backup` created successfully.\\n');

    // 2. Select 100 Products
    console.log('2. Selecting 100 products for live integration...');
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
        ORDER BY RAND()
        LIMIT 100
    `);

    if (testProducts.length === 0) {
        console.log('No eligible products found.');
        return;
    }

    // Begin Transaction for Safety
    await conn.beginTransaction();

    let l1Success = 0;
    let l2Success = 0;
    let totalPctChange = 0;
    let maxIncreasePct = -Infinity;
    let maxDecreasePct = Infinity;
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

            // --- L1: Insert Versioning (engine_price_history) ---
            await conn.execute(`
                INSERT INTO engine_price_history 
                (product_id, old_price_per_kg, new_price_per_kg, old_total_price, new_total_price, change_percentage, source, base_alloy_price_used, pricing_rule_snapshot)
                VALUES (?, ?, ?, ?, ?, ?, 'pricing_engine', ?, ?)
            `, [
                prod.product_id, prod.old_price, prod.new_price, oldTotal, prod.new_total, 
                Math.abs(diffPct), baseAlloyPrice, prod.rule_snapshot
            ]);
            l1Success++;

            // --- L2: Insert Legacy API Sync (price_history) ---
            await conn.execute(`
                INSERT INTO price_history 
                (product_id, price, unit, is_call_for_price, date_created)
                VALUES (?, ?, ?, 0, NOW())
            `, [
                prod.product_id, Math.round(prod.new_price), prod.unit || 'کیلوگرم'
            ]);
            l2Success++;

            // Stats
            totalPctChange += diffPct;
            if (diffPct > maxIncreasePct) maxIncreasePct = diffPct;
            if (diffPct < maxDecreasePct) maxDecreasePct = diffPct;

            if (samples.length < 20) {
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

    const avgChange = (totalPctChange / 100).toFixed(2);
    if (maxIncreasePct === -Infinity) maxIncreasePct = 0;
    if (maxDecreasePct === Infinity) maxDecreasePct = 0;

    console.log('=== PHASE 5: 100-ITEM LIVE ROLLOUT REPORT ===');
    console.log(`- L1 (engine_price_history) Inserts: ${l1Success}`);
    console.log(`- L2 (price_history) Inserts: ${l2Success}`);
    console.log(`- Errors during transaction: ${errors}`);
    console.log(`- Average Percentage Change: ${avgChange}%`);
    console.log(`- Maximum Price Increase: +${maxIncreasePct.toFixed(2)}%`);
    console.log(`- Maximum Price Decrease: ${maxDecreasePct.toFixed(2)}%`);

    console.log('\\n--- 20 Live Sync Samples ---');
    console.table(samples);

  } catch (e) {
    console.error('Rollout failed:', e);
    if (conn) await conn.rollback();
  } finally {
    await conn.end();
  }
}

runProductionRollout();
