const mysql = require('mysql2/promise');

async function runAuditBatches() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- READ-ONLY AUDIT: BATCHES 1 TO 3 ---\\n');

    // 1. Total Processed
    const [totalRes] = await conn.execute('SELECT COUNT(*) as total FROM product_pricing_attributes');
    console.log(`1. Total Products Processed So Far: ${totalRes[0].total}`);

    // 2. Strategy Counts
    const [stratRes] = await conn.execute('SELECT pricing_strategy, COUNT(*) as cnt FROM product_pricing_attributes GROUP BY pricing_strategy');
    console.log('\\n2. Pricing Strategy Distribution:');
    let manualCount = 0;
    stratRes.forEach(r => {
        console.log(`  - ${r.pricing_strategy}: ${r.cnt}`);
        if (r.pricing_strategy === 'MANUAL_PRICE') manualCount = r.cnt;
    });

    // 3. Edge Cases Check
    const [zeroWeight] = await conn.execute("SELECT COUNT(*) as cnt FROM product_pricing_attributes WHERE calculated_weight_kg = 0 AND pricing_strategy = 'FORMULA_WEIGHT'");
    const [negWeight] = await conn.execute("SELECT COUNT(*) as cnt FROM product_pricing_attributes WHERE calculated_weight_kg < 0");
    const [zeroPrice] = await conn.execute("SELECT COUNT(*) as cnt FROM product_pricing_attributes WHERE (calculated_price_per_kg = 0 OR calculated_price_per_kg IS NULL) AND pricing_strategy = 'FORMULA_WEIGHT'");
    const [missingAlloyMap] = await conn.execute("SELECT COUNT(*) as cnt FROM product_pricing_attributes pa LEFT JOIN product_alloy_mapping pam ON pa.product_id = pam.product_id WHERE pam.product_id IS NULL");

    console.log('\\n3. Edge Cases & Errors Check:');
    console.log(`  - Weight == 0 (with FORMULA_WEIGHT): ${zeroWeight[0].cnt}`);
    console.log(`  - Weight < 0 (Negative weight): ${negWeight[0].cnt}`);
    console.log(`  - Calculated Price == 0 (with FORMULA_WEIGHT): ${zeroPrice[0].cnt}`);
    console.log(`  - Products completely missing Alloy Mapping: ${missingAlloyMap[0].cnt} (Matches MANUAL_PRICE count: ${missingAlloyMap[0].cnt === manualCount})`);

    // 4. Formula Samples per Product Type
    console.log('\\n4. Formula Verification (Up to 20 samples per type):');
    
    const [types] = await conn.execute("SELECT DISTINCT product_type FROM product_pricing_attributes WHERE product_type != 'Unknown'");
    
    for (const row of types) {
        const pType = row.product_type;
        console.log(`\\n--- Samples for Type: ${pType} ---`);
        
        const [samples] = await conn.execute(`
            SELECT pa.product_id, pa.calculated_weight_kg, dr.rule_snapshot
            FROM product_pricing_attributes pa
            JOIN pricing_dry_run_reports dr ON pa.product_id = dr.product_id
            WHERE pa.product_type = ?
            LIMIT 20
        `, [pType]);

        const formattedSamples = samples.map(s => {
            let formula = 'N/A';
            try {
                if (s.rule_snapshot) {
                    const snap = JSON.parse(s.rule_snapshot);
                    formula = snap.formula || 'N/A';
                }
            } catch (e) {}
            
            return {
                product_id: s.product_id,
                weight_kg: Number(s.calculated_weight_kg).toFixed(2),
                formula: formula
            };
        });

        console.table(formattedSamples);
    }

  } catch (e) {
    console.error('Audit failed:', e);
  } finally {
    await conn.end();
  }
}

runAuditBatches();
