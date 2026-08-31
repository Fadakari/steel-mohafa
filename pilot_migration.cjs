const mysql = require('mysql2/promise');

async function runPilot() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    // 1. Seed Alloys for Pilot
    console.log('Seeding alloys for Pilot Migration...');
    const alloysToSeed = [
      { name: '304', price: 200000, density: 7.86 },
      { name: '316', price: 280000, density: 7.93 },
      { name: '201', price: 120000, density: 7.93 },
      { name: '321', price: 230000, density: 7.93 },
      { name: '430', price: 100000, density: 7.70 },
      { name: '410', price: 90000, density: 7.70 },
      { name: '310', price: 400000, density: 7.98 },
      { name: '420', price: 95000, density: 7.73 },
      { name: '309', price: 380000, density: 7.98 }
    ];
    
    for (const a of alloysToSeed) {
      await conn.execute(
        'INSERT IGNORE INTO alloy (name, basePrice, density, updatedAt) VALUES (?, ?, ?, NOW())',
        [a.name, a.price, a.density]
      );
    }
    
    const [dbAlloys] = await conn.execute('SELECT id, name, density, basePrice FROM alloy');
    const alloyMap = {};
    dbAlloys.forEach(a => alloyMap[a.name] = a);

    // 2. Select 50 Pilot Products (mixed types)
    const [categories] = await conn.execute('SELECT id, title FROM categories');
    const catTitleMap = {};
    categories.forEach(c => catTitleMap[c.id] = c.title);

    const [products] = await conn.execute(`
      SELECT p.*, (SELECT price FROM price_history ph WHERE ph.product_id = p.id ORDER BY date_created DESC LIMIT 1) as current_price
      FROM products p 
      WHERE p.is_active = 1 
      ORDER BY RAND() 
      LIMIT 1000
    `);

    const pilotProducts = [];
    let counts = { Sheet: 0, Pipe: 0, Bar: 0, Profile: 0, Unknown: 0 };
    
    for (const p of products) {
      const catTitle = catTitleMap[p.category_id] || '';
      let type = 'Unknown';
      if (catTitle.includes('ورق')) type = 'Sheet';
      else if (catTitle.includes('لوله')) type = 'Pipe';
      else if (catTitle.includes('میلگرد')) type = 'Bar';
      else if (catTitle.includes('پروفیل')) type = 'Profile';
      
      if (counts[type] < 10) {
        pilotProducts.push(p);
        counts[type]++;
      }
      if (pilotProducts.length >= 50) break;
    }

    // 3. Process Pilot Migration
    const report = {
      total_processed: 0,
      successfully_calculated: 0,
      missing_alloy_or_unknown_type: 0,
      samples: []
    };

    function parseDimensions(dimStr) {
      if (!dimStr) return null;
      const regex = /([\d\.]+)\s*(x|\*)\s*([\d\.]+)/i;
      const match = dimStr.match(regex);
      if (match) return { w: parseFloat(match[1]), l: parseFloat(match[3]) };
      return null;
    }

    for (const p of pilotProducts) {
      report.total_processed++;
      const catTitle = catTitleMap[p.category_id] || '';
      
      // Determine Type
      let type = 'Unknown';
      if (catTitle.includes('ورق')) type = 'Sheet';
      else if (catTitle.includes('لوله')) type = 'Pipe';
      else if (catTitle.includes('میلگرد')) type = 'Bar';
      else if (catTitle.includes('پروفیل')) type = 'Profile';
      
      // Determine Alloy
      let matchedAlloyId = null;
      let matchedAlloyObj = null;
      const alloyMatch = catTitle.match(/304|316|321|310|309|430|420|410|201/);
      if (alloyMatch && alloyMap[alloyMatch[0]]) {
        matchedAlloyObj = alloyMap[alloyMatch[0]];
        matchedAlloyId = matchedAlloyObj.id;
      }

      // Map Alloy
      if (matchedAlloyId) {
        await conn.execute(
          'INSERT IGNORE INTO product_alloy_mapping (product_id, alloy_id, source, confidence_score) VALUES (?, ?, ?, ?)',
          [p.id, matchedAlloyId, 'category_inheritance', 80.0]
        );
      }

      const parsed = parseDimensions(p.dimensions);
      const w_mm = parsed ? parsed.w : null;
      const l_mm = parsed ? parsed.l : null;
      const t_mm = parseFloat(p.thickness) || null;
      const od_mm = parseFloat(p.outer_diameter) || null;
      const L = (l_mm > 100) ? l_mm / 1000 : (l_mm > 0 ? l_mm : null);

      let weight = 0;
      let formulaUsed = '';
      let calculatedPrice = null;

      if (!matchedAlloyId || type === 'Unknown') {
        report.missing_alloy_or_unknown_type++;
        // Insert empty attributes
        await conn.execute(
          `INSERT IGNORE INTO product_pricing_attributes 
          (product_id, width_mm, length_m, thickness_mm, outer_diameter_mm, product_type, pricing_strategy)
          VALUES (?, ?, ?, ?, ?, ?, 'MANUAL_PRICE')`,
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
          calculatedPrice = weight * basePrice;
          
          await conn.execute(
            `INSERT IGNORE INTO product_pricing_attributes 
            (product_id, width_mm, length_m, thickness_mm, outer_diameter_mm, height_mm, product_type, pricing_strategy, calculated_weight_kg, calculated_price_per_unit)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'FORMULA_WEIGHT', ?, ?)`,
            [p.id, w_mm, L, t_mm, od_mm, (type === 'Profile' ? l_mm : null), type, weight, calculatedPrice]
          );

          const currentPrice = p.current_price || 0;
          const diff = calculatedPrice - currentPrice;
          const pct = currentPrice > 0 ? (diff / currentPrice) * 100 : 0;

          await conn.execute(
            `INSERT IGNORE INTO pricing_dry_run_reports 
            (product_id, current_price, current_unit, calculated_new_price, price_difference_amount, percentage_change, rule_snapshot)
            VALUES (?, ?, 'کیلوگرم', ?, ?, ?, ?)`,
            [p.id, currentPrice, calculatedPrice, diff, pct, JSON.stringify({
              alloy_name: matchedAlloyObj.name,
              alloy_base_price: basePrice,
              formula: formulaUsed,
              calculated_weight: weight
            })]
          );
          
          report.successfully_calculated++;
          report.samples.push({
            id: p.id,
            type: type,
            alloy: matchedAlloyObj.name,
            weight_kg: weight.toFixed(2),
            old_price: currentPrice,
            new_price: Math.round(calculatedPrice),
            formula: formulaUsed
          });
        } else {
          report.missing_alloy_or_unknown_type++;
        }
      }
    }

    console.log(JSON.stringify(report, null, 2));

  } catch (e) {
    console.error('Pilot migration failed:', e);
  } finally {
    await conn.end();
  }
}

runPilot();
