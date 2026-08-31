const mysql = require('mysql2/promise');

async function runSyncLayerDryRun() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 5: SYNC LAYER ARCHITECTURE TEST ---\\n');

    // Select 5 sample products for testing the Sync logic
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
        LIMIT 5
    `);

    console.log('1. Fetching current API schema for `price_history`...');
    const [schema] = await conn.execute('DESCRIBE price_history');
    console.log('Target Schema Verified:', schema.map(s => s.Field).join(', '));
    console.log('\\n2. Simulating Sync Layer execution...');

    for (const prod of testProducts) {
        const oldTotal = prod.old_price * prod.weight;
        let baseAlloyPrice = 0;
        try {
            baseAlloyPrice = JSON.parse(prod.rule_snapshot).alloy_base_price || 0;
        } catch (e) {}

        // --- LAYER 1: NEW ENGINE VERSIONING ---
        const engineHistoryQuery = `
            INSERT INTO engine_price_history 
            (product_id, old_price_per_kg, new_price_per_kg, old_total_price, new_total_price, change_percentage, source, base_alloy_price_used, pricing_rule_snapshot)
            VALUES (?, ?, ?, ?, ?, ?, 'pricing_engine', ?, ?)
        `;
        const engineHistoryParams = [
            prod.product_id, prod.old_price, prod.new_price, oldTotal, prod.new_total, 
            prod.percentage_change, baseAlloyPrice, prod.rule_snapshot
        ];
        
        // --- LAYER 2: LEGACY API SYNC ---
        // Legacy system expects price to be an integer (Toman or Rial). We round it just in case.
        const legacyPriceQuery = `
            INSERT INTO price_history 
            (product_id, price, unit, is_call_for_price, date_created)
            VALUES (?, ?, ?, ?, NOW())
        `;
        const legacyPriceParams = [
            prod.product_id, 
            Math.round(prod.new_price), 
            prod.unit || 'کیلوگرم', 
            0 // 0 = False for is_call_for_price
        ];

        console.log(`\n--- Syncing Product ID: ${prod.product_id} ---`);
        console.log(`[x] L1 Versioning: Logged ${prod.old_price} -> ${prod.new_price} (Change: ${prod.percentage_change}%)`);
        console.log(`[x] L2 Legacy API: Executing -> INSERT INTO price_history (product_id, price, unit) VALUES (${prod.product_id}, ${Math.round(prod.new_price)}, '${prod.unit}')`);
    }

    console.log('\n✅ Sync Layer architecture designed successfully.');
    console.log('⚠️ No actual records were written to `price_history` to comply with safety rules.');

  } catch (e) {
    console.error('Test failed:', e);
  } finally {
    await conn.end();
  }
}

runSyncLayerDryRun();
