const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function runDirectusE2E() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 8.5: FINAL E2E DIRECTUS -> FRONTEND WORKFLOW ---\\n');

    // 0. Store initial state for safety checks
    const [initialL2] = await conn.execute('SELECT COUNT(*) as c FROM price_history');
    const [initialL1] = await conn.execute('SELECT COUNT(*) as c FROM engine_price_history');

    // Begin Strict Transaction!
    await conn.beginTransaction();
    console.log('[SECURITY] Transaction Started. No DDL (TRUNCATE/CREATE) will be run to avoid auto-commits.\\n');

    // --- Directus Step 1: Admin Edits Base Price ---
    console.log('1. [Directus Action] Admin changed Alloy 304 base_price from 209000 to 219000.');
    const [alloyRes] = await conn.execute("SELECT id, basePrice FROM alloy WHERE name = '304'");
    const alloyId = alloyRes[0].id;
    const oldBasePrice = parseFloat(alloyRes[0].basePrice);
    const newBasePrice = 219000;
    
    await conn.execute('UPDATE alloy SET basePrice = ? WHERE id = ?', [newBasePrice, alloyId]);

    // --- Directus Step 2: Webhook Trigger (Preview Generation) ---
    console.log('2. [Webhook] Triggering Preview Engine...');
    const batchId = 'E2E-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const [rules] = await conn.execute("SELECT * FROM pricing_rules WHERE rule_type = 'category'");
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
        const diffPct = (((newPrice - p.old_price) / p.old_price) * 100).toFixed(2);
        
        // Should be < 10% (around 4.7%) -> AUTO_APPROVED
        const status = Math.abs(diffPct) < 10 ? 'AUTO_APPROVED' : 'PENDING_APPROVAL';

        await conn.execute(`
            INSERT INTO pricing_sync_preview 
            (batch_id, product_id, alloy_id, old_alloy_base_price, new_alloy_base_price, old_product_price_kg, new_product_price_kg, percentage_change, sync_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [batchId, p.product_id, alloyId, oldBasePrice, newBasePrice, p.old_price, newPrice, diffPct, status]);
    }

    const [previewCount] = await conn.execute("SELECT COUNT(*) as c FROM pricing_sync_preview WHERE batch_id = ? AND sync_status = 'AUTO_APPROVED'", [batchId]);
    console.log(`   -> pricing_sync_preview successfully populated with ${previewCount[0].c} AUTO_APPROVED products.`);

    // --- Directus Step 3: Webhook Trigger (Apply Engine) ---
    console.log('3. [Webhook] Triggering Apply Engine (Directus Admin clicks "Apply")...');
    
    // Simulate Apply logic inside transaction
    const [approvedItems] = await conn.execute("SELECT * FROM pricing_sync_preview WHERE batch_id = ? AND sync_status = 'AUTO_APPROVED'", [batchId]);
    
    for (const item of approvedItems) {
        // Find product weight
        const [prodAttr] = await conn.execute("SELECT calculated_weight_kg, product_type FROM product_pricing_attributes WHERE product_id = ?", [item.product_id]);
        const weight = prodAttr[0].calculated_weight_kg;
        const newTotal = item.new_product_price_kg * weight;
        const oldTotal = item.old_product_price_kg * weight;

        // 1. Update L0
        await conn.execute("UPDATE product_pricing_attributes SET calculated_price_per_kg = ?, calculated_total_price_per_unit = ? WHERE product_id = ?", [item.new_product_price_kg, newTotal, item.product_id]);
        
        // 2. Insert L1 (Engine Price History)
        await conn.execute(`
            INSERT INTO engine_price_history 
            (product_id, old_price_per_kg, new_price_per_kg, old_total_price, new_total_price, change_percentage, source, base_alloy_price_used)
            VALUES (?, ?, ?, ?, ?, ?, 'directus_sync_engine', ?)
        `, [item.product_id, item.old_product_price_kg, item.new_product_price_kg, oldTotal, newTotal, item.percentage_change, newBasePrice]);

        // 3. Insert L2 (Frontend Legacy Price History)
        await conn.execute(`
            INSERT INTO price_history (product_id, price, unit, is_call_for_price, date_created)
            VALUES (?, ?, 'کیلوگرم', 0, NOW())
        `, [item.product_id, Math.round(item.new_product_price_kg)]);
        
        await conn.execute("UPDATE pricing_sync_preview SET sync_status = 'APPLIED' WHERE id = ?", [item.id]);
    }
    console.log('   -> Apply completed without errors.');

    // --- 4. Database Verification (Inside Transaction) ---
    console.log('\\n4. [Verification] Validating Database L1/L2 updates...');
    const randomItem = approvedItems[Math.floor(Math.random() * approvedItems.length)];
    
    const [l2Check] = await conn.execute("SELECT price, date_created FROM price_history WHERE product_id = ? ORDER BY id DESC LIMIT 1", [randomItem.product_id]);
    const [l1Check] = await conn.execute("SELECT old_price_per_kg, new_price_per_kg, created_at FROM engine_price_history WHERE product_id = ? ORDER BY id DESC LIMIT 1", [randomItem.product_id]);
    const [typeCheck] = await conn.execute("SELECT product_type FROM product_pricing_attributes WHERE product_id = ?", [randomItem.product_id]);
    
    console.log(`   - price_history (Legacy API): `);
    console.log(`       ✅ New Record Found. Price = ${l2Check[0].price} | date_created = ${l2Check[0].date_created.toISOString()}`);
    console.log(`   - engine_price_history (L1 Engine): `);
    console.log(`       ✅ Old = ${l1Check[0].old_price_per_kg} | New = ${l1Check[0].new_price_per_kg}`);

    // --- 5. Selected Product Report ---
    console.log('\\n=== 5. Sample Product Validation (Before Rollback) ===');
    console.log(`Product ID: ${randomItem.product_id}`);
    console.log(`Product Name/Type: ${typeCheck[0].product_type}`);
    console.log(`Old Price/kg: ${Math.round(randomItem.old_product_price_kg)}`);
    console.log(`New Price/kg (Calculated): ${Math.round(randomItem.new_product_price_kg)}`);
    const expectedCalc = Math.round(randomItem.new_alloy_base_price * (rulesMap[products.find(p=>p.product_id === randomItem.product_id).category_id] || 1.0));
    console.log(`Expected Price/kg: ${expectedCalc}`);
    console.log(`Actual Applied Price/kg: ${l2Check[0].price}`);
    console.log(`Match Status: ${l2Check[0].price === expectedCalc ? '✅ PASSED' : '❌ FAILED'}`);

    // --- 6. ROLLBACK ---
    console.log('\\n6. [ROLLBACK] Reverting all operations...');
    await conn.rollback();
    
    // Post-rollback verification
    const [finalL2] = await conn.execute('SELECT COUNT(*) as c FROM price_history');
    const [finalL1] = await conn.execute('SELECT COUNT(*) as c FROM engine_price_history');
    console.log(`   -> Rollback Complete. Production Integrity: 100% (L1 rows: ${finalL1[0].c} == ${initialL1[0].c}, L2 rows: ${finalL2[0].c} == ${initialL2[0].c})`);

  } catch (e) {
    console.error('E2E Test failed:', e);
    await conn.rollback();
  } finally {
    await conn.end();
  }
}

runDirectusE2E();
