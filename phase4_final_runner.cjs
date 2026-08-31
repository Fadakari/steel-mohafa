const mysql = require('mysql2/promise');

async function runFinalMigration() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 4: FINAL BATCH RUNNER START ---\\n');

    // Pre-flight metrics
    const [processedRes] = await conn.execute('SELECT COUNT(*) as cnt FROM product_pricing_attributes');
    const [totalActiveRes] = await conn.execute('SELECT COUNT(*) as cnt FROM products WHERE is_active = 1');
    const totalProcessedSoFar = processedRes[0].cnt;
    const totalActive = totalActiveRes[0].cnt;
    const initialRemaining = totalActive - totalProcessedSoFar;

    console.log('=== FINAL MIGRATION INITIAL CHECKPOINT ===');
    console.log(`Total Active Products in DB: ${totalActive}`);
    console.log(`Total Processed So Far (Batches 1-6): ${totalProcessedSoFar}`);
    console.log(`Total Remaining to Process: ${initialRemaining}\\n`);

    if (initialRemaining <= 0) {
        console.log('No unprocessed products remaining. Exiting.');
        return;
    }

    // Load static lookups once
    const [dbAlloys] = await conn.execute('SELECT id, name, density, basePrice FROM alloy');
    const alloyMap = {};
    dbAlloys.forEach(a => alloyMap[a.name] = a);

    const [categories] = await conn.execute('SELECT id, title FROM categories');
    const catTitleMap = {};
    categories.forEach(c => catTitleMap[c.id] = c.title);

    const categoryAlloyRules = {
      'ورق استیل دکوراتیو': '304',
      'پروفیل استیل دکوراتیو (ظاهری)': '304',
      'لوله صنایع غذایی (Food Grade)': '304',
      'چهارپهلو و ششپهلو': '304',
      'اتصالات جوشی (Welded)': '304',
      'فلنج استیل (Flanges)': '304',
      'سیم جوش و الکترود': '304',
      'شیرآلات صنعتی': '316',
      'شیرآلات صنایع غذایی': '304',
      'اتصالات دنده ای (Threaded)': '304',
      'اتصالات صنایع غذایی (Food Grade)': '304'
    };

    function parseDimensions(dimStr) {
      if (!dimStr) return null;
      const regex = /([\d\.]+)\s*(x|\*)\s*([\d\.]+)/i;
      const match = dimStr.match(regex);
      if (match) return { w: parseFloat(match[1]), l: parseFloat(match[3]) };
      return null;
    }

    let batchNumber = 7; // Continuing from batch 6

    while (true) {
        console.log(`\n>>> Starting Execution for Batch ${batchNumber}...`);
        
        // Ensure resumability by only selecting unprocessed items
        const [products] = await conn.execute(`
          SELECT p.*, 
            (SELECT price FROM price_history ph WHERE ph.product_id = p.id ORDER BY date_created DESC LIMIT 1) as current_price
          FROM products p 
          WHERE p.is_active = 1 
          AND p.id NOT IN (SELECT product_id FROM product_pricing_attributes)
          ORDER BY p.id ASC 
          LIMIT 1000
        `);

        if (products.length === 0) {
            console.log('\\n✅ MIGRATION COMPLETE! All active products have been processed.');
            break;
        }

        let successMappingCount = 0;
        let successCalcCount = 0;
        let missingAlloyCount = 0;
        let missingFormulaCount = 0;
        let anomalyCount = 0;
        let errorCount = 0;
        
        const typeCounts = { Sheet: 0, Pipe: 0, Bar: 0, Profile: 0, FlatBar: 0, Wire: 0, Angle: 0, SquareBar: 0, Unknown: 0 };

        // Process current batch
        for (const p of products) {
          try {
            const catTitle = catTitleMap[p.category_id] || '';
            
            let type = 'Unknown';
            if (catTitle.includes('ورق')) type = 'Sheet';
            else if (catTitle.includes('لوله')) type = 'Pipe';
            else if (catTitle.includes('میلگرد')) type = 'Bar';
            else if (catTitle.includes('پروفیل')) type = 'Profile';
            else if (catTitle.includes('تسمه')) type = 'FlatBar';
            else if (catTitle.includes('مفتول')) type = 'Wire';
            else if (catTitle.includes('نبشی')) type = 'Angle';
            else if (catTitle.includes('چهارپهلو')) type = 'SquareBar';
            else if (catTitle.includes('ناودانی')) type = 'Angle';

            typeCounts[type]++;
            
            let matchedAlloyId = null;
            let matchedAlloyObj = null;
            let mappingSource = null;
            let mappingConfidence = null;

            const alloyMatch = catTitle.match(/304|316|321|310|309|430|420|410|201/);
            
            if (alloyMatch && alloyMap[alloyMatch[0]]) {
              matchedAlloyObj = alloyMap[alloyMatch[0]];
              matchedAlloyId = matchedAlloyObj.id;
              mappingSource = 'category_regex';
              mappingConfidence = 80.0;
            } else if (categoryAlloyRules[catTitle] && alloyMap[categoryAlloyRules[catTitle]]) {
              matchedAlloyObj = alloyMap[categoryAlloyRules[catTitle]];
              matchedAlloyId = matchedAlloyObj.id;
              mappingSource = 'category_inheritance';
              mappingConfidence = 90.0;
            }

            if (matchedAlloyId) {
              await conn.execute(
                'INSERT IGNORE INTO product_alloy_mapping (product_id, alloy_id, source, confidence_score) VALUES (?, ?, ?, ?)',
                [p.id, matchedAlloyId, mappingSource, mappingConfidence]
              );
              successMappingCount++;
            }

            const parsed = parseDimensions(p.dimensions);
            const w_mm = parsed ? parsed.w : null;
            const l_mm = parsed ? parsed.l : null;
            const t_mm = parseFloat(p.thickness) || null;
            const od_mm = parseFloat(p.outer_diameter) || null;
            const L = (l_mm > 100) ? l_mm / 1000 : (l_mm > 0 ? l_mm : null) || 6;

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
                weight = (Math.PI * (od_mm - t_mm) * t_mm * L * rho) / 1000;
                formulaUsed = `(PI * (D(${od_mm}) - T(${t_mm})) * T(${t_mm}) * L(${L}) * rho(${rho})) / 1000`;
              } else if (type === 'Bar' && od_mm) {
                weight = (Math.pow(od_mm, 2) / 162) * L;
                formulaUsed = `(D(${od_mm})^2 / 162) * L(${L})`;
              } else if (type === 'Profile' && t_mm) {
                const P_w = w_mm || 0;
                const P_h = l_mm || P_w;
                if (P_w > 0) {
                   weight = ( 2 * t_mm * (P_w + P_h - 2*t_mm) * L * rho ) / 1000; 
                   formulaUsed = `2 * T(${t_mm}) * (W(${P_w}) + H(${P_h}) - 2T(${t_mm})) * L(${L}) * rho(${rho}) / 1000`;
                }
              } else if (type === 'FlatBar' && w_mm && t_mm) {
                weight = (w_mm * t_mm * L * rho) / 1000;
                formulaUsed = `W(${w_mm}) * T(${t_mm}) * L(${L}) * rho(${rho}) / 1000`;
              } else if (type === 'Wire' && od_mm) {
                weight = (Math.pow(od_mm, 2) / 162) * L;
                formulaUsed = `(D(${od_mm})^2 / 162) * L(${L})`;
              } else if (type === 'Angle' && w_mm && t_mm) {
                weight = ((2 * w_mm - t_mm) * t_mm * L * rho) / 1000;
                formulaUsed = `((2 * W(${w_mm}) - T(${t_mm})) * T(${t_mm}) * L(${L}) * rho(${rho})) / 1000`;
              } else if (type === 'SquareBar' && w_mm) {
                weight = (Math.pow(w_mm, 2) * L * rho) / 1000;
                formulaUsed = `W(${w_mm})^2 * L(${L}) * rho(${rho}) / 1000`;
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
              } else {
                missingFormulaCount++; // FIXED_WEIGHT
              }
            }
          } catch (err) {
            errorCount++;
            console.error(`Error processing product ${p.id}: `, err.message);
          }
        }

        const successRate = ((successCalcCount / products.length) * 100).toFixed(2);

        const checkpoint = {
            batch_number: batchNumber,
            processed_in_batch: products.length,
            success_count: successCalcCount,
            skipped_manual: missingAlloyCount,
            skipped_fixed: missingFormulaCount,
            error_count: errorCount,
            timestamp: new Date().toISOString()
        };

        console.log(`\n--- BATCH ${batchNumber} REPORT ---`);
        console.log(JSON.stringify(checkpoint, null, 2));
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Anomalies (>20% diff): ${anomalyCount}`);
        console.log(`Type Distribution:`, JSON.stringify(typeCounts));
        console.log(`------------------------------------\n`);

        batchNumber++;
    }

  } catch (e) {
    console.error('Final Runner failed:', e);
  } finally {
    await conn.end();
  }
}

runFinalMigration();
