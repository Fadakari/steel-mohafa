const mysql = require('mysql2/promise');

async function runBatch3() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 4: BATCH 3 START ---\\n');

    // Get Alloy data
    const [dbAlloys] = await conn.execute('SELECT id, name, density, basePrice FROM alloy');
    const alloyMap = {};
    dbAlloys.forEach(a => alloyMap[a.name] = a);

    // Get Categories data
    const [categories] = await conn.execute('SELECT id, title FROM categories');
    const catTitleMap = {};
    categories.forEach(c => catTitleMap[c.id] = c.title);

    // Default Alloy Rules
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

    // Select 1000 unprocessed active products, randomized
    const [products] = await conn.execute(`
      SELECT p.*, 
        (SELECT price FROM price_history ph WHERE ph.product_id = p.id ORDER BY date_created DESC LIMIT 1) as current_price
      FROM products p 
      WHERE p.is_active = 1 
      AND p.id NOT IN (SELECT product_id FROM product_pricing_attributes)
      ORDER BY RAND() 
      LIMIT 1000
    `);

    if (products.length === 0) {
        console.log('No unprocessed products found.');
        return;
    }

    let successMappingCount = 0;
    let successCalcCount = 0;
    let missingAlloyCount = 0;     // MANUAL_PRICE
    let missingFormulaCount = 0;   // FIXED_WEIGHT
    let anomalyCount = 0;
    let errorCount = 0;
    
    // Additional Metrics
    const typeCounts = { Sheet: 0, Pipe: 0, Bar: 0, Profile: 0, FlatBar: 0, Wire: 0, Angle: 0, SquareBar: 0, Unknown: 0 };
    const alloyCounts = {};
    const alloyDiffSum = {};
    let minWeight = null;
    let maxWeight = null;

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
        else if (catTitle.includes('تسمه')) type = 'FlatBar';
        else if (catTitle.includes('مفتول')) type = 'Wire';
        else if (catTitle.includes('نبشی')) type = 'Angle';
        else if (catTitle.includes('چهارپهلو')) type = 'SquareBar';
        else if (catTitle.includes('ناودانی')) type = 'Angle'; // Treat as angle for weight approx if no specific formula

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
          if (!alloyCounts[matchedAlloyObj.name]) {
            alloyCounts[matchedAlloyObj.name] = 0;
            alloyDiffSum[matchedAlloyObj.name] = 0;
          }
          alloyCounts[matchedAlloyObj.name]++;

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
        const L = (l_mm > 100) ? l_mm / 1000 : (l_mm > 0 ? l_mm : null) || 6; // Default 6m for linear products

        let weight = 0;
        let formulaUsed = '';
        let calculatedPricePerKg = null;
        let calculatedTotalPrice = null;

        if (!matchedAlloyId) {
          missingAlloyCount++; // MANUAL_PRICE
          await conn.execute(
            `INSERT IGNORE INTO product_pricing_attributes 
            (product_id, width_mm, length_m, thickness_mm, outer_diameter_mm, product_type, pricing_strategy)
            VALUES (?, ?, ?, ?, ?, ?, 'MANUAL_PRICE')`,
            [p.id, w_mm, L, t_mm, od_mm, type]
          );
        } else if (type === 'Unknown') {
          missingFormulaCount++; // FIXED_WEIGHT
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
            
            // Min / Max Weight Tracking
            if (minWeight === null || weight < minWeight) minWeight = weight;
            if (maxWeight === null || weight > maxWeight) maxWeight = weight;

            await conn.execute(
              `INSERT IGNORE INTO product_pricing_attributes 
              (product_id, width_mm, length_m, thickness_mm, outer_diameter_mm, height_mm, product_type, pricing_strategy, calculated_weight_kg, calculated_price_per_kg, calculated_total_price_per_unit)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'FORMULA_WEIGHT', ?, ?, ?)`,
              [p.id, w_mm, L, t_mm, od_mm, (type === 'Profile' ? l_mm : null), type, weight, calculatedPricePerKg, calculatedTotalPrice]
            );

            const currentPricePerKg = p.current_price || 0;
            const diff = calculatedPricePerKg - currentPricePerKg;
            const pct = currentPricePerKg > 0 ? Math.abs((diff / currentPricePerKg) * 100) : 0;
            
            alloyDiffSum[matchedAlloyObj.name] += pct;

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
            missingFormulaCount++; // FIXED_WEIGHT
          }
        }
      } catch (err) {
        errorCount++;
        console.error(`Error processing product ${p.id}: `, err.message);
      }
    }

    const checkpoint = {
        batch_number: 3,
        total_processed: products.length,
        success_count: successCalcCount,
        skipped_count: missingAlloyCount + missingFormulaCount,
        error_count: errorCount,
        timestamp: new Date().toISOString()
    };

    console.log('=== CHECKPOINT RECORDED ===');
    console.log(JSON.stringify(checkpoint, null, 2));

    console.log('\\n=== BATCH 3 REPORT ===');
    console.log(`Successful Mappings (product_alloy_mapping): ${successMappingCount}`);
    console.log(`Successful Calculations (FORMULA_WEIGHT): ${successCalcCount}`);
    console.log(`Skipped - Missing Alloy (MANUAL_PRICE): ${missingAlloyCount}`);
    console.log(`Skipped - Missing Formula/Type (FIXED_WEIGHT): ${missingFormulaCount}`);
    console.log(`Anomalies (>20% diff from placeholder): ${anomalyCount}`);
    console.log(`Errors: ${errorCount}`);
    
    console.log('\\n--- Additional Batch 3 Metrics ---');
    console.log(`Products by Type:`, JSON.stringify(typeCounts));
    console.log(`Products by Alloy:`, JSON.stringify(alloyCounts));
    
    console.log(`Average % Change by Alloy:`);
    for (const [al, count] of Object.entries(alloyCounts)) {
        if (count > 0) {
            const avg = alloyDiffSum[al] / count;
            console.log(` - Alloy ${al}: ${avg.toFixed(2)}%`);
        }
    }
    
    console.log(`MANUAL_PRICE Count: ${missingAlloyCount}`);
    console.log(`FIXED_WEIGHT Count: ${missingFormulaCount}`);
    console.log(`Calculated Weight Range: Min ${minWeight ? minWeight.toFixed(2) : 'N/A'} kg, Max ${maxWeight ? maxWeight.toFixed(2) : 'N/A'} kg`);

    console.log('\\n10 Samples from Batch 3:');
    console.table(samples);

  } catch (e) {
    console.error('Batch 3 failed:', e);
  } finally {
    await conn.end();
  }
}

runBatch3();
