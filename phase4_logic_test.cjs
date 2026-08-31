const mysql = require('mysql2/promise');

async function runLogicTest() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 4: LOGIC ENGINE UPGRADE TEST ---\\n');

    // 1. Setup Data
    const [dbAlloys] = await conn.execute('SELECT id, name, density, basePrice FROM alloy');
    const alloyMap = {};
    dbAlloys.forEach(a => alloyMap[a.name] = a);

    // Hardcoded Category Rules for Default Alloys
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

    // 2. Fetch Previously Skipped Products (from Batch 2)
    const [skippedProducts] = await conn.execute(`
      SELECT p.*, c.title as category, pa.pricing_strategy as old_strategy
      FROM product_pricing_attributes pa
      JOIN products p ON pa.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE pa.pricing_strategy IN ('MANUAL_PRICE', 'FIXED_WEIGHT')
    `);

    console.log(`Found ${skippedProducts.length} previously skipped products for testing.\\n`);

    let newFormulaCount = 0;
    let newManualCount = 0;
    let newFixedCount = 0;
    let transitionCount = { 'MANUAL_PRICE': 0, 'FIXED_WEIGHT': 0 };

    function parseDimensions(dimStr) {
      if (!dimStr) return null;
      const regex = /([\d\.]+)\s*(x|\*)\s*([\d\.]+)/i;
      const match = dimStr.match(regex);
      if (match) return { w: parseFloat(match[1]), l: parseFloat(match[3]) };
      return null;
    }

    for (const p of skippedProducts) {
      const catTitle = p.category || '';
      
      // Extended Type Detection
      let type = 'Unknown';
      if (catTitle.includes('ورق')) type = 'Sheet';
      else if (catTitle.includes('لوله')) type = 'Pipe';
      else if (catTitle.includes('میلگرد')) type = 'Bar';
      else if (catTitle.includes('پروفیل')) type = 'Profile';
      else if (catTitle.includes('تسمه')) type = 'FlatBar';
      else if (catTitle.includes('مفتول')) type = 'Wire';
      else if (catTitle.includes('نبشی')) type = 'Angle';
      else if (catTitle.includes('چهارپهلو')) type = 'SquareBar'; // Added for potential formulas
      
      // Extended Alloy Mapping
      let matchedAlloyObj = null;
      const alloyMatch = catTitle.match(/304|316|321|310|309|430|420|410|201/);
      if (alloyMatch && alloyMap[alloyMatch[0]]) {
        matchedAlloyObj = alloyMap[alloyMatch[0]];
      } else if (categoryAlloyRules[catTitle] && alloyMap[categoryAlloyRules[catTitle]]) {
        // Apply Default Rule
        matchedAlloyObj = alloyMap[categoryAlloyRules[catTitle]];
      }

      const parsed = parseDimensions(p.dimensions);
      const w_mm = parsed ? parsed.w : null;
      const l_mm = parsed ? parsed.l : null;
      const t_mm = parseFloat(p.thickness) || null;
      const od_mm = parseFloat(p.outer_diameter) || null;
      const L = (l_mm > 100) ? l_mm / 1000 : (l_mm > 0 ? l_mm : null) || 6; // Assume 6m if L is missing for profiles/bars

      let weight = 0;
      
      if (!matchedAlloyObj) {
        newManualCount++;
      } else if (type === 'Unknown') {
        newFixedCount++;
      } else {
        const rho = matchedAlloyObj.density;

        if (type === 'Sheet' && w_mm && L && t_mm) {
          weight = L * (w_mm / 1000) * t_mm * rho;
        } else if (type === 'Pipe' && od_mm && t_mm) {
          weight = (Math.PI * (od_mm - t_mm) * t_mm * L * rho) / 1000;
        } else if (type === 'Bar' && od_mm) {
          weight = (Math.pow(od_mm, 2) / 162) * L;
        } else if (type === 'Profile' && t_mm) {
          const P_w = w_mm || 0;
          const P_h = l_mm || P_w;
          if (P_w > 0) weight = ( 2 * t_mm * (P_w + P_h - 2*t_mm) * L * rho ) / 1000;
        } else if (type === 'FlatBar' && w_mm && t_mm) {
          weight = (w_mm * t_mm * L * rho) / 1000; // Flat bar formula
        } else if (type === 'Wire' && od_mm) {
          weight = (Math.pow(od_mm, 2) / 162) * L; // Same as bar
        } else if (type === 'Angle' && w_mm && t_mm) {
          weight = ((2 * w_mm - t_mm) * t_mm * L * rho) / 1000; // Angle formula
        } else if (type === 'SquareBar' && w_mm) {
          weight = (Math.pow(w_mm, 2) * L * rho) / 1000;
        }

        if (weight > 0) {
          newFormulaCount++;
          transitionCount[p.old_strategy]++;
        } else {
          newFixedCount++; // Failed to compute weight -> fallback to fixed
        }
      }
    }

    console.log('--- TEST RESULTS ---');
    console.log(`Original Skipped Count: ${skippedProducts.length}`);
    console.log(`Successfully Converted to FORMULA_WEIGHT: ${newFormulaCount}`);
    console.log(`  - Converted from MANUAL_PRICE (No Alloy): ${transitionCount['MANUAL_PRICE']}`);
    console.log(`  - Converted from FIXED_WEIGHT (No Formula): ${transitionCount['FIXED_WEIGHT']}`);
    console.log(`Remaining MANUAL_PRICE: ${newManualCount}`);
    console.log(`Remaining FIXED_WEIGHT: ${newFixedCount}`);

  } catch (e) {
    console.error(e);
  } finally {
    await conn.end();
  }
}

runLogicTest();
