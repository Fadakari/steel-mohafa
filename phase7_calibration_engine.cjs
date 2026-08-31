const mysql = require('mysql2/promise');

async function runCalibrationEngine() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 7: PRICING CALIBRATION ENGINE ---\\n');

    // 1. Create Calibration Report Table
    console.log('1. Creating `pricing_calibration_report` table...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS pricing_calibration_report (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        category_id INT,
        alloy_id INT,
        product_type VARCHAR(100),
        calculated_price DECIMAL(15,2),
        current_market_price DECIMAL(15,2),
        difference_amount DECIMAL(15,2),
        difference_percent DECIMAL(10,2),
        recommended_adjustment DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category_id),
        INDEX idx_alloy (alloy_id),
        INDEX idx_product_type (product_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await conn.execute('TRUNCATE TABLE pricing_calibration_report');

    // 2. Fetch Data and Populate Calibration Report
    console.log('2. Populating calibration data...');
    const [products] = await conn.execute(`
        SELECT p.id as product_id, 
               p.category_id, 
               pam.alloy_id, 
               a.name as alloy_name,
               c.title as category_name,
               ppa.product_type,
               ppa.calculated_price_per_kg as calculated_price,
               dr.current_price as market_price
        FROM products p
        JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
        JOIN pricing_dry_run_reports dr ON p.id = dr.product_id
        LEFT JOIN product_alloy_mapping pam ON p.id = pam.product_id
        LEFT JOIN alloy a ON pam.alloy_id = a.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE ppa.pricing_strategy = 'FORMULA_WEIGHT' 
        AND dr.current_price > 0
    `);

    const calibrationData = [];
    const targetOffset = -15000; // Target: calculated price should be 15,000 Toman UNDER market price

    for (const prod of products) {
        const calcPrice = parseFloat(prod.calculated_price);
        const mktPrice = parseFloat(prod.market_price);
        
        const diffAmount = calcPrice - mktPrice;
        const diffPercent = (diffAmount / mktPrice) * 100;
        
        // Recommended adjustment to reach (mktPrice - 15000)
        // new_calc_price = calcPrice + adjustment
        // mktPrice - 15000 = calcPrice + adjustment
        // adjustment = (mktPrice - 15000) - calcPrice
        const adjustment = (mktPrice + targetOffset) - calcPrice;

        calibrationData.push({
            ...prod,
            calcPrice,
            mktPrice,
            diffAmount,
            diffPercent,
            adjustment
        });
    }

    // Insert to DB in chunks
    const insertQuery = `
        INSERT INTO pricing_calibration_report 
        (product_id, category_id, alloy_id, product_type, calculated_price, current_market_price, difference_amount, difference_percent, recommended_adjustment)
        VALUES ?
    `;
    
    const chunk = 1000;
    for (let i = 0; i < calibrationData.length; i += chunk) {
        const batch = calibrationData.slice(i, i + chunk).map(d => [
            d.product_id, d.category_id, d.alloy_id, d.product_type, 
            d.calcPrice, d.mktPrice, d.diffAmount, d.diffPercent, d.adjustment
        ]);
        await conn.query(insertQuery, [batch]);
    }

    // 3. Statistical Grouping & Reporting
    console.log('\\n3. Analyzing Groups (Alloy, Product Type, Category)...\\n');

    function calculateStats(groupData) {
        if (groupData.length === 0) return null;
        
        // Avg
        const totalDiff = groupData.reduce((acc, curr) => acc + curr.diffAmount, 0);
        const avgDiff = totalDiff / groupData.length;
        
        const totalPct = groupData.reduce((acc, curr) => acc + curr.diffPercent, 0);
        const avgPct = totalPct / groupData.length;

        // Median
        const sortedDiffs = groupData.map(d => d.diffAmount).sort((a, b) => a - b);
        const mid = Math.floor(sortedDiffs.length / 2);
        const medianDiff = sortedDiffs.length % 2 !== 0 ? sortedDiffs[mid] : (sortedDiffs[mid - 1] + sortedDiffs[mid]) / 2;
        
        // Avg Adjustment Needed
        const avgAdjustment = groupData.reduce((acc, curr) => acc + curr.adjustment, 0) / groupData.length;

        return { avgDiff, avgPct, medianDiff, avgAdjustment, count: groupData.length };
    }

    // Grouping Dictionaries
    const alloys = {};
    const types = {};
    const categories = {};

    calibrationData.forEach(d => {
        if (d.alloy_name) {
            if (!alloys[d.alloy_name]) alloys[d.alloy_name] = [];
            alloys[d.alloy_name].push(d);
        }
        if (d.product_type) {
            if (!types[d.product_type]) types[d.product_type] = [];
            types[d.product_type].push(d);
        }
        if (d.category_name) {
            if (!categories[d.category_name]) categories[d.category_name] = [];
            categories[d.category_name].push(d);
        }
    });

    // Report Helpers
    const printStats = (title, dict) => {
        console.log(`=== ${title} ===`);
        const report = [];
        for (const [key, items] of Object.entries(dict)) {
            const s = calculateStats(items);
            if (s.count < 10) continue; // Ignore very small groups for clean reporting
            report.push({
                Name: key,
                Count: s.count,
                'Avg Diff (Toman)': Math.round(s.avgDiff),
                'Median Diff': Math.round(s.medianDiff),
                'Avg Diff (%)': s.avgPct.toFixed(2) + '%',
                'Needed Rule (Toman)': Math.round(s.avgAdjustment)
            });
        }
        console.table(report.sort((a, b) => a['Needed Rule (Toman)'] - b['Needed Rule (Toman)']));
    };

    printStats('Alloy Analysis', alloys);
    printStats('Product Type Analysis', types);
    printStats('Top Category Analysis (Recommendations)', categories);

    console.log('\\n[!] Recommendations Strategy:');
    console.log('To push the calculated prices into the (-10,000 to -20,000) Toman gap below market, we recommend creating Flat Markup/Discount rules (or multiplier rules) based on the "Needed Rule" column above.');
    
    console.log('\\n[✓] Directus CMS Compatibility:');
    console.log('- Directus easily supports updating `alloy.basePrice` and managing `pricing_rules`.');
    console.log('- The Sync Engine (Phase 6) listens to these updates and applies changes efficiently without modifying legacy structures.');
    
    console.log('\\n[!] NO ACTUAL UPDATES WERE MADE TO `products` OR `price_history`.');

  } catch (e) {
    console.error('Calibration failed:', e);
  } finally {
    await conn.end();
  }
}

runCalibrationEngine();
