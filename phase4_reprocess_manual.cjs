const mysql = require('mysql2/promise');

async function runReprocess() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 4: REPROCESS MANUAL_PRICE ITEMS ---\\n');

    // Counts Before
    const [beforeManual] = await conn.execute("SELECT COUNT(*) as cnt FROM product_pricing_attributes WHERE pricing_strategy = 'MANUAL_PRICE'");
    const [beforeFormula] = await conn.execute("SELECT COUNT(*) as cnt FROM product_pricing_attributes WHERE pricing_strategy = 'FORMULA_WEIGHT'");
    console.log(`[Before] MANUAL_PRICE count: ${beforeManual[0].cnt}`);
    console.log(`[Before] FORMULA_WEIGHT count: ${beforeFormula[0].cnt}\\n`);

    // Get Target Products
    const [productsToProcess] = await conn.execute(`
      SELECT p.*, c.title as category 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id IN (
        SELECT product_id FROM product_pricing_attributes WHERE pricing_strategy = 'MANUAL_PRICE'
      )
    `);

    if (productsToProcess.length === 0) {
      console.log('No MANUAL_PRICE products found to reprocess.');
      return;
    }

    const productIds = productsToProcess.map(p => p.id);
    
    // Clear old data for these specific products
    const placeholders = productIds.map(() => '?').join(',');
    await conn.execute(`DELETE FROM pricing_dry_run_reports WHERE product_id IN (${placeholders})`, productIds);
    await conn.execute(`DELETE FROM product_pricing_attributes WHERE product_id IN (${placeholders})`, productIds);
    await conn.execute(`DELETE FROM product_alloy_mapping WHERE product_id IN (${placeholders})`, productIds);

    // Setup Engine Data
    const [dbAlloys] = await conn.execute('SELECT id, name, density, basePrice FROM alloy');
    const alloyMap = {};
    dbAlloys.forEach(a => alloyMap[a.name] = a);

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

    let successMappingCount = 0;
    let successCalcCount = 0;
    let missingAlloyCount = 0;
    let missingFormulaCount = 0;

    // Run Engine
    for (const p of productsToProcess) {
      const catTitle = p.category || '';
      
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
          'INSERT INTO product_alloy_mapping (product_id, alloy_id, source, confidence_score) VALUES (?, ?, ?, ?)',
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
          `INSERT INTO product_pricing_attributes 
          (product_id, width_mm, length_m, thickness_mm, outer_diameter_mm, product_type, pricing_strategy)
          VALUES (?, ?, ?, ?, ?, ?, 'MANUAL_PRICE')`,
          [p.id, w_mm, L, t_mm, od_mm, type]
        );
      } else if (type === 'Unknown') {
        missingFormulaCount++;
        await conn.execute(
          `INSERT INTO product_pricing_attributes 
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
          
          await conn.execute(
            `INSERT INTO product_pricing_attributes 
            (product_id, width_mm, length_m, thickness_mm, outer_diameter_mm, height_mm, product_type, pricing_strategy, calculated_weight_kg, calculated_price_per_kg, calculated_total_price_per_unit)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'FORMULA_WEIGHT', ?, ?, ?)`,
            [p.id, w_mm, L, t_mm, od_mm, (type === 'Profile' ? l_mm : null), type, weight, calculatedPricePerKg, calculatedTotalPrice]
          );

          const currentPricePerKg = p.current_price || 0;
          const diff = calculatedPricePerKg - currentPricePerKg;
          const pct = currentPricePerKg > 0 ? Math.abs((diff / currentPricePerKg) * 100) : 0;

          await conn.execute(
            `INSERT INTO pricing_dry_run_reports 
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
          await conn.execute(
            `INSERT INTO product_pricing_attributes 
            (product_id, width_mm, length_m, thickness_mm, outer_diameter_mm, product_type, pricing_strategy)
            VALUES (?, ?, ?, ?, ?, ?, 'FIXED_WEIGHT')`,
            [p.id, w_mm, L, t_mm, od_mm, type]
          );
        }
      }
    }

    // Counts After
    const [afterManual] = await conn.execute("SELECT COUNT(*) as cnt FROM product_pricing_attributes WHERE pricing_strategy = 'MANUAL_PRICE'");
    const [afterFormula] = await conn.execute("SELECT COUNT(*) as cnt FROM product_pricing_attributes WHERE pricing_strategy = 'FORMULA_WEIGHT'");
    const [afterFixed] = await conn.execute("SELECT COUNT(*) as cnt FROM product_pricing_attributes WHERE pricing_strategy = 'FIXED_WEIGHT'");

    console.log(`\n--- REPROCESS RESULTS ---`);
    console.log(`Reprocessed: ${productIds.length} items`);
    console.log(`New Mappings: ${successMappingCount}`);
    console.log(`New FORMULA_WEIGHT computations: ${successCalcCount}`);
    console.log(`New FIXED_WEIGHT fallbacks: ${missingFormulaCount}`);
    console.log(`\n[After] Total MANUAL_PRICE count: ${afterManual[0].cnt}`);
    console.log(`[After] Total FORMULA_WEIGHT count: ${afterFormula[0].cnt}`);
    console.log(`[After] Total FIXED_WEIGHT count: ${afterFixed[0].cnt}`);

  } catch (e) {
    console.error('Reprocess failed:', e);
  } finally {
    await conn.end();
  }
}

runReprocess();
