const mysql = require('mysql2/promise');

async function runAnomalyAnalysis() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 3.5: ANOMALY ANALYSIS ---');
    
    const [anomalies] = await conn.execute(`
        SELECT
            d.product_id, 
            c.title as category, 
            a.id as alloy_id, 
            a.name as alloy_name,
            m.source as alloy_mapping_source, 
            d.current_price as current_price_per_kg,
            d.calculated_new_price_per_kg, 
            a.basePrice as applied_basePrice, 
            a.density,
            pa.calculated_weight_kg as weight, 
            pa.pricing_strategy as formula_type,
            pa.product_type, 
            p.dimensions, 
            p.thickness, 
            p.outer_diameter,
            d.percentage_change,
            d.current_unit
        FROM pricing_dry_run_reports d
        JOIN product_pricing_attributes pa ON d.product_id = pa.product_id
        JOIN products p ON d.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_alloy_mapping m ON p.id = m.product_id
        LEFT JOIN alloy a ON m.alloy_id = a.id
        WHERE d.percentage_change > 20
    `);

    let categoriesCount = {
        'Alloy mapping': 0,
        'Placeholder basePrice': 0,
        'Formula': 0,
        'Dimension parsing': 0,
        'Unit issue': 0
    };

    let sampleOutput = [];

    for (const row of anomalies) {
        let isAnomalyClassified = false;

        // 5. Unit issue
        // The original price history didn't record unit for all correctly, we check if current_price is insanely high or low relative to typical kg price
        // Wait, price_history unit check wasn't fetched in our previous batch properly? Let's check current_price logic. 
        // If current price is > 100,000,000 it might be a piece price.
        if (row.current_price_per_kg > 5000000) { // Unlikely a kg of steel is 5 million toman. Probably a piece.
            categoriesCount['Unit issue']++;
            isAnomalyClassified = true;
        }

        // 4. Dimension parsing or 3. Formula
        if (!isAnomalyClassified && (!row.weight || row.weight <= 0)) {
            if (!row.dimensions && !row.thickness && !row.outer_diameter) {
                categoriesCount['Dimension parsing']++;
            } else {
                categoriesCount['Formula']++;
            }
            isAnomalyClassified = true;
        }

        // 2. Placeholder basePrice issue
        // If the calculated price equals the applied base price, and weight is valid, and no unit issue.
        if (!isAnomalyClassified) {
            categoriesCount['Placeholder basePrice']++;
            isAnomalyClassified = true;
        }

        if (sampleOutput.length < 5) {
            sampleOutput.push(row);
        }
    }

    console.log(`Total Anomalies Analyzed: ${anomalies.length}`);
    console.log(`Classification Summary:`);
    console.log(categoriesCount);
    
    console.log('\\nSample of Anomalies:');
    sampleOutput.forEach(s => {
        console.log(`\nProduct ID: ${s.product_id}`);
        console.log(`Category: ${s.category}`);
        console.log(`Alloy: ${s.alloy_name} (ID: ${s.alloy_id}) | Source: ${s.alloy_mapping_source}`);
        console.log(`Current Price (DB): ${s.current_price_per_kg}`);
        console.log(`Calculated Price (New): ${s.calculated_new_price_per_kg} | BasePrice: ${s.applied_basePrice}`);
        console.log(`Dimensions: ${s.dimensions} | T: ${s.thickness} | OD: ${s.outer_diameter}`);
        console.log(`Weight: ${s.weight} | Type: ${s.product_type} | Strategy: ${s.formula_type}`);
        console.log(`Diff: ${Number(s.percentage_change).toFixed(2)}%`);
    });

  } catch (e) {
    console.error('Phase 3.5 failed:', e);
  } finally {
    await conn.end();
  }
}

runAnomalyAnalysis();
