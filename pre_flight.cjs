const mysql = require('mysql2/promise');

async function runPreFlight() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('=== PRE-FLIGHT VALIDATION ===\\n');

    // 1. Verify schema
    console.log('1. Verifying Schema Columns...');
    const [colsPpa] = await conn.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'product_pricing_attributes' AND TABLE_SCHEMA = 'steel_mahfa'");
    const ppaColumns = colsPpa.map(c => c.COLUMN_NAME);
    console.log('calculated_price_per_kg exists:', ppaColumns.includes('calculated_price_per_kg'));
    console.log('calculated_total_price_per_unit exists:', ppaColumns.includes('calculated_total_price_per_unit'));
    
    const [colsDry] = await conn.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'pricing_dry_run_reports' AND TABLE_SCHEMA = 'steel_mahfa'");
    console.log('calculated_new_price_per_kg exists:', colsDry.map(c => c.COLUMN_NAME).includes('calculated_new_price_per_kg'));

    // 2. Verify no data mutation
    console.log('\\n2. Verifying Original Tables Unchanged...');
    const [pOrig] = await conn.execute('SELECT COUNT(*) as c FROM products');
    const [pBak] = await conn.execute('SELECT COUNT(*) as c FROM products_backup_20260831');
    console.log(`products table count: ${pOrig[0].c} | Backup count: ${pBak[0].c} | Match: ${pOrig[0].c === pBak[0].c}`);

    const [phOrig] = await conn.execute('SELECT COUNT(*) as c FROM price_history');
    const [phBak] = await conn.execute('SELECT COUNT(*) as c FROM price_history_backup_20260831');
    console.log(`price_history table count: ${phOrig[0].c} | Backup count: ${phBak[0].c} | Match: ${phOrig[0].c === phBak[0].c}`);

    // 3. Ten Product Mock Sample
    console.log('\\n3. Ten Product Read-Only Mock Calculation...');
    const [categories] = await conn.execute('SELECT id, title FROM categories');
    const catTitleMap = {};
    categories.forEach(c => catTitleMap[c.id] = c.title);
    
    const [dbAlloys] = await conn.execute('SELECT id, name, density, basePrice FROM alloy');
    const alloyMap = {};
    dbAlloys.forEach(a => alloyMap[a.name] = a);

    const [sampleProducts] = await conn.execute(`
      SELECT p.*, (SELECT price FROM price_history ph WHERE ph.product_id = p.id ORDER BY date_created DESC LIMIT 1) as current_price
      FROM products p 
      WHERE p.is_active = 1 
      ORDER BY RAND() 
      LIMIT 50
    `);

    let validCount = 0;
    
    function parseDimensions(dimStr) {
      if (!dimStr) return null;
      const regex = /([\d\.]+)\s*(x|\*)\s*([\d\.]+)/i;
      const match = dimStr.match(regex);
      if (match) return { w: parseFloat(match[1]), l: parseFloat(match[3]) };
      return null;
    }

    for (const p of sampleProducts) {
      if (validCount >= 10) break;
      const catTitle = catTitleMap[p.category_id] || '';
      
      let type = 'Unknown';
      if (catTitle.includes('ورق')) type = 'Sheet';
      else if (catTitle.includes('لوله')) type = 'Pipe';
      else if (catTitle.includes('میلگرد')) type = 'Bar';
      else if (catTitle.includes('پروفیل')) type = 'Profile';
      
      const alloyMatch = catTitle.match(/304|316|321|310|309|430|420|410|201/);
      let matchedAlloyObj = null;
      if (alloyMatch && alloyMap[alloyMatch[0]]) matchedAlloyObj = alloyMap[alloyMatch[0]];
      
      if (!matchedAlloyObj || type === 'Unknown') continue;

      const parsed = parseDimensions(p.dimensions);
      const w_mm = parsed ? parsed.w : null;
      const l_mm = parsed ? parsed.l : null;
      const t_mm = parseFloat(p.thickness) || null;
      const od_mm = parseFloat(p.outer_diameter) || null;
      const L = (l_mm > 100) ? l_mm / 1000 : (l_mm > 0 ? l_mm : null);

      let weight = 0;
      const rho = matchedAlloyObj.density;
      const basePricePerKg = matchedAlloyObj.basePrice; // Placeholder

      if (type === 'Sheet' && w_mm && L && t_mm) {
        weight = L * (w_mm / 1000) * t_mm * rho;
      } else if (type === 'Pipe' && od_mm && t_mm) {
        weight = (Math.PI * (od_mm - t_mm) * t_mm * 6 * rho) / 1000;
      } else if (type === 'Bar' && od_mm) {
        weight = (Math.pow(od_mm, 2) / 162) * 6;
      } else if (type === 'Profile' && t_mm) {
        const P_w = w_mm || 0;
        const P_h = l_mm || P_w;
        if (P_w > 0) weight = ( 2 * t_mm * (P_w + P_h - 2*t_mm) * 6 * rho ) / 1000;
      }

      if (weight > 0) {
        const currentPricePerKg = p.current_price || 0;
        const newPricePerKg = basePricePerKg; // since multipliers are 1 for now
        const diff = newPricePerKg - currentPricePerKg;
        const pct = currentPricePerKg > 0 ? (diff / currentPricePerKg) * 100 : 0;
        
        console.log(`- Product ID: ${p.id}`);
        console.log(`  Category: ${catTitle}`);
        console.log(`  Alloy: ${matchedAlloyObj.name}`);
        console.log(`  Weight: ${weight.toFixed(2)} kg`);
        console.log(`  Current Price/kg: ${currentPricePerKg}`);
        console.log(`  Calculated Price/kg: ${newPricePerKg} (Based on placeholder alloy base price)`);
        console.log(`  Difference: ${diff} (${pct.toFixed(2)}%)\\n`);
        validCount++;
      }
    }

  } catch (e) {
    console.error(e);
  } finally {
    await conn.end();
  }
}

runPreFlight();
