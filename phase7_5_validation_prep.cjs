const mysql = require('mysql2/promise');

async function runValidationPrep() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 7.5: VALIDATION PREPARATION ---\\n');

    // 1. Create Validation Table
    console.log('1. Creating `pricing_validation_samples` structure...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS pricing_validation_samples (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        product_type VARCHAR(50),
        alloy_name VARCHAR(50),
        engine_price DECIMAL(15,2),
        manual_market_price DECIMAL(15,2) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await conn.execute('TRUNCATE TABLE pricing_validation_samples');

    // 2. Select Diverse Samples
    console.log('2. Selecting diverse samples (1 from each Product Type / Alloy combination)...');
    
    // Using a window function to get 1 random product per product_type + alloy combination
    const [samples] = await conn.execute(`
        WITH RankedSamples AS (
            SELECT p.id as product_id, 
                   a.name as alloy_name, 
                   ppa.product_type, 
                   ppa.calculated_price_per_kg as engine_price,
                   ROW_NUMBER() OVER(PARTITION BY ppa.product_type, a.id ORDER BY RAND()) as rn
            FROM products p
            JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
            JOIN product_alloy_mapping pam ON p.id = pam.product_id
            JOIN alloy a ON pam.alloy_id = a.id
            WHERE ppa.pricing_strategy = 'FORMULA_WEIGHT'
        )
        SELECT product_id, alloy_name, product_type, engine_price 
        FROM RankedSamples 
        WHERE rn = 1
        ORDER BY product_type, alloy_name
    `);

    // Insert into validation table
    for (const s of samples) {
        await conn.execute(`
            INSERT INTO pricing_validation_samples 
            (product_id, product_type, alloy_name, engine_price)
            VALUES (?, ?, ?, ?)
        `, [s.product_id, s.product_type, s.alloy_name, s.engine_price]);
    }

    console.log(`   -> Successfully isolated ${samples.length} unique sample combinations.\\n`);

    // 3. Simulate Manual Market Price Entry for a few samples
    console.log('3. Simulating manual "Market Price" entry for 5 random validation samples...');
    const [randomSamples] = await conn.execute('SELECT id, engine_price FROM pricing_validation_samples ORDER BY RAND() LIMIT 5');
    
    for (const rs of randomSamples) {
        // Create a fake market price (e.g. Engine Price + a random noise between -30k and +30k)
        const noise = Math.floor((Math.random() * 60000) - 30000);
        const simMarketPrice = Math.round(parseFloat(rs.engine_price) + noise);
        
        await conn.execute('UPDATE pricing_validation_samples SET manual_market_price = ? WHERE id = ?', [simMarketPrice, rs.id]);
    }

    // 4. Validation Report Generation
    console.log('\\n4. Generating Validation Report Template...');
    
    const [reportData] = await conn.execute(`
        SELECT product_id, 
               product_type, 
               alloy_name, 
               engine_price, 
               manual_market_price,
               (manual_market_price - 15000) as target_price,
               (engine_price - manual_market_price) as engine_vs_market_diff
        FROM pricing_validation_samples
        WHERE manual_market_price IS NOT NULL
    `);

    console.log('\\n=== VALIDATION SAMPLE SET (Simulated Results) ===');
    console.table(reportData.map(d => ({
        'Product ID': d.product_id,
        'Type': d.product_type,
        'Alloy': d.alloy_name,
        'Engine Price': Math.round(d.engine_price),
        'Market (Manual)': Math.round(d.manual_market_price),
        'Target Price (-15k)': Math.round(d.target_price),
        'Current Gap': Math.round(d.engine_vs_market_diff)
    })));

    const [unfilledData] = await conn.execute(`
        SELECT product_id, product_type, alloy_name
        FROM pricing_validation_samples
        WHERE manual_market_price IS NULL
        LIMIT 5
    `);
    
    console.log('\\n=== PENDING VALIDATION SAMPLES (Require Manual Price Entry) ===');
    console.table(unfilledData);
    
    console.log('\\n[!] SUMMARY:');
    console.log(`- Created validation table with ${samples.length} items covering all possible permutations.`);
    console.log('- Operators can now query \`pricing_validation_samples\` and UPDATE \`manual_market_price\` with actual phone/bazaar inquiry data.');
    console.log('- NO production tables or pricing rules were altered.');

  } catch (e) {
    console.error('Validation prep failed:', e);
  } finally {
    await conn.end();
  }
}

runValidationPrep();
