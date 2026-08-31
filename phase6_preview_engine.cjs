const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function runPhase6SyncPreview() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 6: PRICING SYNC ENGINE (PREVIEW & DRY RUN) ---\\n');

    // 1. Create Schema
    console.log('1. Creating `pricing_sync_preview` table...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS pricing_sync_preview (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        batch_id VARCHAR(50) NOT NULL,
        product_id INT NOT NULL,
        alloy_id INT NOT NULL,
        old_alloy_base_price DECIMAL(15,2),
        new_alloy_base_price DECIMAL(15,2),
        old_product_price_kg DECIMAL(15,2),
        new_product_price_kg DECIMAL(15,2),
        percentage_change DECIMAL(10,2),
        sync_status ENUM('AUTO_APPROVED', 'PENDING_APPROVAL', 'BLOCKED', 'APPLIED', 'REJECTED') NOT NULL,
        rule_snapshot JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_batch (batch_id),
        INDEX idx_status (sync_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await conn.execute('TRUNCATE TABLE pricing_sync_preview');

    const simulatedChanges = {
        '304': { targetPrice: 215000 }, // Was 209000 (+2.8%)
        '316': { targetPrice: 325000 }, // Was 289000 (+12.4%)
        '430': { targetPrice: 220000 }  // Was 154000 (+42.8%)
    };

    console.log('2. Executing Dry Run (Simulating Base Price updates)...\\n');

    const [allAlloys] = await conn.execute('SELECT id, name, basePrice FROM alloy');
    const alloyMap = {};
    allAlloys.forEach(a => alloyMap[a.name] = a);

    const batchId = 'SYNC-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const [rules] = await conn.execute("SELECT * FROM pricing_rules WHERE rule_type = 'category'");
    const catRules = {};
    rules.forEach(r => { if (r.category_id) catRules[r.category_id] = parseFloat(r.multiplier); });

    let autoCount = 0;
    let pendingCount = 0;
    let blockedCount = 0;

    for (const [alloyName, sim] of Object.entries(simulatedChanges)) {
        const alloy = alloyMap[alloyName];
        if (!alloy) continue;

        console.log(`>> Simulating Alloy [${alloyName}]: ${alloy.basePrice} -> ${sim.targetPrice}`);

        const [products] = await conn.execute(`
            SELECT p.id as product_id, p.category_id, ppa.calculated_price_per_kg as old_price, ppa.pricing_strategy
            FROM products p
            JOIN product_alloy_mapping pam ON p.id = pam.product_id
            JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
            WHERE pam.alloy_id = ? AND p.is_active = 1 AND ppa.pricing_strategy = 'FORMULA_WEIGHT'
        `, [alloy.id]);

        for (const prod of products) {
            let multiplier = 1.0;
            if (catRules[prod.category_id]) multiplier = catRules[prod.category_id];

            const newPrice = Math.round(sim.targetPrice * multiplier);
            const oldPrice = parseFloat(prod.old_price);
            
            let diffPct = 0;
            if (oldPrice > 0) {
                diffPct = ((newPrice - oldPrice) / oldPrice) * 100;
            }

            const absPct = Math.abs(diffPct);
            let status = 'AUTO_APPROVED';
            
            if (absPct >= 30) {
                status = 'BLOCKED';
                blockedCount++;
            } else if (absPct >= 10) {
                status = 'PENDING_APPROVAL';
                pendingCount++;
            } else {
                autoCount++;
            }

            let ruleSnap = {
                simulated_alloy_price: sim.targetPrice,
                active_multiplier: multiplier
            };

            await conn.execute(`
                INSERT INTO pricing_sync_preview 
                (batch_id, product_id, alloy_id, old_alloy_base_price, new_alloy_base_price, old_product_price_kg, new_product_price_kg, percentage_change, sync_status, rule_snapshot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                batchId, prod.product_id, alloy.id, alloy.basePrice, sim.targetPrice, 
                oldPrice, newPrice, diffPct, status, JSON.stringify(ruleSnap)
            ]);
        }
    }

    console.log('\\n=== PHASE 6 DRY RUN REPORT ===');
    console.log(`Batch ID Generated: ${batchId}`);
    console.log(`✅ AUTO_APPROVED (<10%): ${autoCount} products`);
    console.log(`⚠️ PENDING_APPROVAL (10%-30%): ${pendingCount} products`);
    console.log(`⛔ BLOCKED (>30%): ${blockedCount} products`);
    
    console.log('\\n--- Sample Previews (Status Check) ---');
    const [samples] = await conn.execute(`
        SELECT product_id, percentage_change as change_pct, sync_status 
        FROM pricing_sync_preview 
        GROUP BY sync_status 
        ORDER BY RAND() LIMIT 10
    `);
    console.table(samples);

  } catch (e) {
    console.error('Phase 6 failed:', e);
  } finally {
    await conn.end();
  }
}

runPhase6SyncPreview();
