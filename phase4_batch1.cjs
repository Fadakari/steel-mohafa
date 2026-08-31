const mysql = require('mysql2/promise');

async function runBatch1() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 4: BATCH 1 START ---\\n');
    
    // Clear previous pilot data to ensure a clean 1-11996 sequential run
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    await conn.execute('TRUNCATE TABLE `pricing_dry_run_reports`');
    await conn.execute('TRUNCATE TABLE `product_pricing_attributes`');
    await conn.execute('TRUNCATE TABLE `product_alloy_mapping`');
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Cleaned previous pilot data for a fresh start.\\n');

    // Get Alloy data
    const [dbAlloys] = await conn.execute('SELECT id, name, density, basePrice FROM alloy');
    const alloyMap = {};
    dbAlloys.forEach(a => alloyMap[a.name] = a);

    // Get Categories data
    const [categories] = await conn.execute('SELECT id, title FROM categories');
    const catTitleMap = {};
    categories.forEach(c => catTitleMap[c.id] = c.title);

    // Select the first 1000 active products
    const [products] = await conn.execute(`
      SELECT p.*, 
        (SELECT price FROM price_history ph WHERE ph.product_id = p.id ORDER BY date_created DESC LIMIT 1) as current_price
      FROM products p 
      WHERE p.is_active = 1 
      ORDER BY p.id ASC 
      LIMIT 1000
    `);

    if (products.length === 0) {
        console.log('No products to process.');
        return;
    }

    const minId = products[0].id;
    const maxId = products[products.length - 1].id;

    let successMappingCount = 0;
    let successCalcCount = 0;
    let missingAlloyCount = 0;
    let missingFormulaCount = 0;
    let anomalyCount = 0;
    let errorCount = 0;
    const samples = [];

    function parseDimensions(dimStr) {
      if (!dimStr) return null;
      const regex = /([\d\.]+)\s*(x|\*)\s*([\d\.]+)/i;
      const match = dimStr.match(regex);
      if (match) return { w: parseFloat(match[1]), l: parseFloat(match[3]) };
      return null;
    }

    for (const p of products) {
      try {
        const catTitle = catTitleMap[p.category_id] || '';
        
        let type = 'Unknown';
        if (catTitle.includes('ورق')) type = 'Sheet';
        else if (catTitle.includes('لوله')) type = 'Pipe';
        else if (catTitle.includes('میلگرد')) type = 'Bar';
        else if (catTitle.includes('پروفیل')) type = 'Profile';
        
        let matchedAlloyId = null;
        let matchedAlloyObj = null;
        const alloyMatch = catTitle.match(/304|316|321|310|309|430|420|410|201/);
        if (alloyMatch && alloyMap[alloyMatch[0]]) {
          matchedAlloyObj = alloyMap[alloyMatch[0]];
          matchedAlloyId = matchedAlloyObj.id;
        }

        if (matchedAlloyId) {
          await conn.execute(
            'INSERT IGNORE INTO product_alloy_mapping (product_id, alloy_id, source, confidence_score) VALUES (?, ?, ?, ?)',
            [p.id, matchedAlloyId, 'category_inheritance', 80.0]
          );
          successMappingCount++;
        }

        const parsed = parseDimensions(p.dimensions);
        const w_mm = parsed ? parsed.w : null;
        const l_mm = parsed ? parsed.l : null;
        const t_mm = parseFloat(p.thickness) || null;
        const od_mm = parseFloat(p.outer_diameter) || null;
        const L = (l_mm > 100) ? l_mm / 1000 : (l_mm > 0 ? l_mm : null);

        let weight = 0;
        let formulaUsed = '';
        let calculatedPricePerKg = null;
        let calculatedTotalPrice = null;

        if (!matchedAlloyId) {
          missingAlloyCount++;
          await conn.execute(
            `INSERT IGNORE INTO product_pricing_attributes 
            (product_id, width_mm, length_m, thickness_mm, outer_diameter_mm, product_type, pricing_strategy)
            VALUES (?, ?, ?, ?, ?, ?, 'MANUAL_PRICE')`,
            [p.id, w_mm, L, t_mm, od_mm, type]
          );
        } else if (type === 'Unknown') {
          missingFormulaCount++;
          await conn.execute(
            `INSERT IGNORE INTO product_pricing_attributes 
            (product_id, width_mm, length_m, thickness_mm, outer_diameter_mm, product_type, pricing_strategy)
            VALUES (?, ?, ?, ?, ?, ?, 'FIXED_WEIGHT')`,
            [p.id, w_mm, L, t_mm, od_mm, type]
          );
        } else {
          const rho = matchedAlloyObj.density;
          const basePrice = matchedAlloyObj.basePrice;

          if (type === 'Sheet' && w_mm && L && t_mm) {
            weight = L * (w_mm / 1000) * t_mm * rho;
            formulaUsed = `L(${L}) * (W(${w_mm})/1000) * T(${t_mm}) * rho(${rho})`;
          } else if (type === 'Pipe' && od_mm && t_mm) {
            weight = (Math.PI * (od_mm - t_mm) * t_mm * 6 * rho) / 1000;
            formulaUsed = `(PI * (D(${od_mm}) - T(${t_mm})) * T(${t_mm}) * L(6) * rho(${rho})) / 1000`;
          } else if (type === 'Bar' && od_mm) {
            weight = (Math.pow(od_mm, 2) / 162) * 6;
            formulaUsed = `(D(${od_mm})^2 / 162) * L(6)`;
          } else if (type === 'Profile' && t_mm) {
            const P_w = w_mm || 0;
            const P_h = l_mm || P_w;
            if (P_w > 0) {
               weight = ( 2 * t_mm * (P_w + P_h - 2*t_mm) * 6 * rho ) / 1000; 
               formulaUsed = `2 * T(${t_mm}) * (W(${P_w}) + H(${P_h}) - 2T(${t_mm})) * L(6) * rho(${rho}) / 1000`;
            }
          }

          if (weight > 0) {
            calculatedPricePerKg = basePrice;
            calculatedTotalPrice = weight * calculatedPricePerKg;
            
            await conn.execute(
              `INSERT IGNORE INTO product_pricing_attributes 
              (product_id, width_mm, length_m, thickness_mm, outer_diameter_mm, height_mm, product_type, pricing_strategy, calculated_weight_kg, calculated_price_per_kg, calculated_total_price_per_unit)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'FORMULA_WEIGHT', ?, ?, ?)`,
              [p.id, w_mm, L, t_mm, od_mm, (type === 'Profile' ? l_mm : null), type, weight, calculatedPricePerKg, calculatedTotalPrice]
            );

            const currentPricePerKg = p.current_price || 0;
            const diff = calculatedPricePerKg - currentPricePerKg;
            const pct = currentPricePerKg > 0 ? Math.abs((diff / currentPricePerKg) * 100) : 0;

            if (pct > 20) anomalyCount++;

            await conn.execute(
              `INSERT IGNORE INTO pricing_dry_run_reports 
              (product_id, current_price, current_unit, calculated_new_price_per_kg, price_difference_amount, percentage_change, rule_snapshot)
              VALUES (?, ?, 'کیلوگرم', ?, ?, ?, ?)`,
              [p.id, currentPricePerKg, calculatedPricePerKg, diff, pct, JSON.stringify({
                alloy_name: matchedAlloyObj.name,
                alloy_base_price: basePrice,
                formula: formulaUsed,
                calculated_weight: weight,
                total_piece_price: calculatedTotalPrice
              })]
            );
            
            successCalcCount++;
            
            if (samples.length < 10) {
                samples.push({
                    product_id: p.id,
                    type: type,
                    alloy: matchedAlloyObj.name,
                    weight_kg: weight.toFixed(2),
                    formula: formulaUsed,
                    old_price_kg: currentPricePerKg,
                    new_price_kg: calculatedPricePerKg,
                    percentage_change: pct.toFixed(2) + '%'
                });
            }
          } else {
            missingFormulaCount++;
          }
        }
      } catch (err) {
        errorCount++;
        console.error(`Error processing product ${p.id}: `, err.message);
      }
    }

    const checkpoint = {
        batch_number: 1,
        product_id_range: `${minId} - ${maxId}`,
        total_processed: products.length,
        success_count: successCalcCount,
        skipped_count: missingAlloyCount + missingFormulaCount,
        error_count: errorCount,
        timestamp: new Date().toISOString()
    };

    console.log('=== CHECKPOINT RECORDED ===');
    console.log(JSON.stringify(checkpoint, null, 2));

    console.log('\n=== BATCH 1 REPORT ===');
    console.log(`Successful Mappings (product_alloy_mapping): ${successMappingCount}`);
    console.log(`Successful Calculations (FORMULA_WEIGHT): ${successCalcCount}`);
    console.log(`Skipped - Missing Alloy (MANUAL_PRICE): ${missingAlloyCount}`);
    console.log(`Skipped - Missing Formula/Type (FIXED_WEIGHT): ${missingFormulaCount}`);
    console.log(`Anomalies (>20% diff from placeholder): ${anomalyCount}`);
    console.log(`Errors: ${errorCount}`);
    
    console.log('\n10 Samples from Batch 1:');
    console.table(samples);

  } catch (e) {
    console.error('Batch 1 failed:', e);
  } finally {
    await conn.end();
  }
}

runBatch1();
