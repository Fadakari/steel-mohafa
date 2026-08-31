const mysql = require('mysql2/promise');

async function runFinalAudit() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- FINAL READ-ONLY AUDIT (PRE-PHASE 5) ---\\n');

    // 1. Basic Counts
    const [[{totActive}]] = await conn.execute('SELECT COUNT(*) as totActive FROM products WHERE is_active = 1');
    const [[{totTotal}]] = await conn.execute('SELECT COUNT(*) as totTotal FROM products');
    const [[{totPam}]] = await conn.execute('SELECT COUNT(*) as totPam FROM product_alloy_mapping');
    const [[{totPpa}]] = await conn.execute('SELECT COUNT(*) as totPpa FROM product_pricing_attributes');
    const [[{totPdrr}]] = await conn.execute('SELECT COUNT(*) as totPdrr FROM pricing_dry_run_reports');

    console.log('1. Database Record Counts:');
    console.log(`   - Total Products (is_active=1): ${totActive} (out of ${totTotal} total)`);
    console.log(`   - Mappings in product_alloy_mapping: ${totPam}`);
    console.log(`   - Attributes in product_pricing_attributes: ${totPpa}`);
    console.log(`   - Reports in pricing_dry_run_reports: ${totPdrr}\\n`);

    // 2. Integrity Checks
    const [[{missingMap}]] = await conn.execute('SELECT COUNT(*) as missingMap FROM products p WHERE p.is_active = 1 AND p.id NOT IN (SELECT product_id FROM product_alloy_mapping)');
    const [[{missingAttr}]] = await conn.execute('SELECT COUNT(*) as missingAttr FROM products p WHERE p.is_active = 1 AND p.id NOT IN (SELECT product_id FROM product_pricing_attributes)');
    
    const [dupPam] = await conn.execute('SELECT product_id, COUNT(*) as c FROM product_alloy_mapping GROUP BY product_id HAVING c > 1');
    const [dupPpa] = await conn.execute('SELECT product_id, COUNT(*) as c FROM product_pricing_attributes GROUP BY product_id HAVING c > 1');
    const [[{orphanPam}]] = await conn.execute('SELECT COUNT(*) as orphanPam FROM product_alloy_mapping WHERE product_id NOT IN (SELECT id FROM products)');
    const [[{orphanPpa}]] = await conn.execute('SELECT COUNT(*) as orphanPpa FROM product_pricing_attributes WHERE product_id NOT IN (SELECT id FROM products)');

    console.log('2. Integrity Checks:');
    console.log(`   - Active products WITHOUT Alloy Mapping: ${missingMap}`);
    console.log(`   - Active products WITHOUT Pricing Attributes: ${missingAttr}`);
    console.log(`   - Duplicate product_id in Mapping Table: ${dupPam.length}`);
    console.log(`   - Duplicate product_id in Attributes Table: ${dupPpa.length}`);
    console.log(`   - Orphan records in Mapping Table (no valid product): ${orphanPam}`);
    console.log(`   - Orphan records in Attributes Table (no valid product): ${orphanPpa}\\n`);

    // 3. Formula Validation
    const [[{wZero}]] = await conn.execute('SELECT COUNT(*) as wZero FROM product_pricing_attributes WHERE calculated_weight_kg = 0');
    const [[{wNeg}]] = await conn.execute('SELECT COUNT(*) as wNeg FROM product_pricing_attributes WHERE calculated_weight_kg < 0');
    const [[{pNull}]] = await conn.execute('SELECT COUNT(*) as pNull FROM product_pricing_attributes WHERE calculated_price_per_kg IS NULL AND pricing_strategy = "FORMULA_WEIGHT"');
    const [[{fixedW}]] = await conn.execute('SELECT COUNT(*) as fixedW FROM product_pricing_attributes WHERE pricing_strategy = "FIXED_WEIGHT"');
    const [[{manualP}]] = await conn.execute('SELECT COUNT(*) as manualP FROM product_pricing_attributes WHERE pricing_strategy = "MANUAL_PRICE"');

    console.log('3. Formula & Edge-Case Validation:');
    console.log(`   - Records with Weight == 0: ${wZero}`);
    console.log(`   - Records with Weight < 0: ${wNeg}`);
    console.log(`   - Records with calculated_price_per_kg IS NULL (FORMULA_WEIGHT): ${pNull}`);
    console.log(`   - Total FIXED_WEIGHT records: ${fixedW}`);
    console.log(`   - Total MANUAL_PRICE records: ${manualP}\\n`);

    // 4. Breakdowns
    console.log('4. Distributions:');
    
    // By Type
    const [byType] = await conn.execute('SELECT product_type, COUNT(*) as c FROM product_pricing_attributes GROUP BY product_type ORDER BY c DESC');
    console.log('   --- By Product Type ---');
    console.table(byType);

    // By Alloy
    const [byAlloy] = await conn.execute(`
        SELECT a.name as alloy, COUNT(*) as c 
        FROM product_alloy_mapping pam 
        JOIN alloy a ON pam.alloy_id = a.id 
        GROUP BY a.name ORDER BY c DESC
    `);
    console.log('   --- By Alloy ---');
    console.table(byAlloy);

    // By Category
    const [byCat] = await conn.execute(`
        SELECT c.title as category, COUNT(*) as c 
        FROM products p 
        JOIN categories c ON p.category_id = c.id 
        JOIN product_pricing_attributes ppa ON p.id = ppa.product_id 
        GROUP BY c.title 
        ORDER BY c DESC 
        LIMIT 10
    `);
    console.log('   --- By Category (Top 10) ---');
    console.table(byCat);

  } catch (e) {
    console.error('Final Audit failed:', e);
  } finally {
    await conn.end();
  }
}

runFinalAudit();
