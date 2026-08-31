const mysql = require('mysql2/promise');
async function runAudit() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });
  try {
    const [categories] = await conn.execute('SELECT id, title, slug, parent_id FROM categories');
    const catMap = {};
    categories.forEach(c => catMap[c.id] = c);
    const [products] = await conn.execute('SELECT * FROM products WHERE is_active = 1');
    const report = {
      totalProducts: products.length,
      groupedByCategory: {},
      validDimensions: 0,
      missingDimensions: 0,
      missingAlloy: 0,
      missingFormulaType: 0,
      sampleValidations: []
    };
    function parseDimensions(dimStr) {
      if (!dimStr) return null;
      const regex = /([\d\.]+)\s*(x|\*)\s*([\d\.]+)/i;
      const match = dimStr.match(regex);
      if (match) return { w: parseFloat(match[1]), l: parseFloat(match[3]) };
      return null;
    }
    products.forEach(p => {
      const cat = catMap[p.category_id];
      const catTitle = cat ? cat.title : 'Unknown';
      if (!report.groupedByCategory[catTitle]) report.groupedByCategory[catTitle] = 0;
      report.groupedByCategory[catTitle]++;
      let isValidDim = false;
      let w = null, l = null;
      const parsed = parseDimensions(p.dimensions);
      if (parsed) { w = parsed.w; l = parsed.l; }
      let type = 'Unknown';
      if (catTitle.includes('ورق')) type = 'Sheet';
      else if (catTitle.includes('لوله')) type = 'Pipe';
      else if (catTitle.includes('میلگرد')) type = 'Bar';
      else if (catTitle.includes('پروفیل')) type = 'Profile';
      if (type === 'Unknown') report.missingFormulaType++;
      if (type === 'Sheet') {
        if (p.thickness > 0 && w > 0 && l > 0) isValidDim = true;
      } else if (type === 'Pipe') {
        const od = parseFloat(p.outer_diameter);
        if (p.thickness > 0 && od > 0) isValidDim = true;
      } else if (type === 'Bar') {
        const od = parseFloat(p.outer_diameter);
        if (od > 0) isValidDim = true;
      } else if (type === 'Profile') {
        if (p.thickness > 0) isValidDim = true; 
      } else {
        isValidDim = true;
      }
      if (isValidDim) report.validDimensions++;
      else report.missingDimensions++;
      let alloy = null;
      const alloyMatch = catTitle.match(/304|316|321|310|309|430|420|410|201/);
      if (alloyMatch) alloy = alloyMatch[0];
      else report.missingAlloy++;
    });
    let sheetCount = 0, pipeCount = 0, barCount = 0, profCount = 0;
    const variedSamples = [];
    for(const p of products) {
      if(!p.thickness && !p.outer_diameter && !p.dimensions) continue;
      const cat = catMap[p.category_id];
      const catTitle = cat ? cat.title : '';
      if(catTitle.includes('ورق') && sheetCount < 3) { variedSamples.push(p); sheetCount++; }
      else if(catTitle.includes('لوله') && pipeCount < 3) { variedSamples.push(p); pipeCount++; }
      else if(catTitle.includes('میلگرد') && barCount < 3) { variedSamples.push(p); barCount++; }
      else if(catTitle.includes('پروفیل') && profCount < 3) { variedSamples.push(p); profCount++; }
    }
    const samples = variedSamples;
    let sampleCount = 0;
    for (const p of samples) {
      if (sampleCount >= 10) break;
      const cat = catMap[p.category_id];
      const catTitle = cat ? cat.title : '';
      let type = 'Unknown';
      if (catTitle.includes('ورق')) type = 'Sheet';
      else if (catTitle.includes('لوله')) type = 'Pipe';
      else if (catTitle.includes('میلگرد')) type = 'Bar';
      else if (catTitle.includes('پروفیل')) type = 'Profile';
      if (type === 'Unknown') continue;
      let alloy = '304';
      const alloyMatch = catTitle.match(/304|316|321|310|309|430|420|410|201/);
      if (alloyMatch) alloy = alloyMatch[0];
      let rho = 7.93; 
      if (alloy === '304') rho = 7.86;
      else if (alloy === '316') rho = 7.93;
      let weight = 0;
      let formulaUsed = '';
      const parsed = parseDimensions(p.dimensions);
      const w_mm = parsed ? parsed.w : 0;
      const l_mm = parsed ? parsed.l : 0;
      const L = (l_mm > 100) ? l_mm / 1000 : (l_mm > 0 ? l_mm : 1);
      const W = w_mm;
      const T = parseFloat(p.thickness) || 0;
      const D = parseFloat(p.outer_diameter) || 0;
      if (type === 'Sheet' && W && L && T) {
        weight = L * (W / 1000) * T * rho;
        formulaUsed = `L(${L}) * (W(${W})/1000) * T(${T}) * rho(${rho})`;
      } else if (type === 'Pipe' && D && T) {
        weight = (Math.PI * (D - T) * T * 6 * rho) / 1000;
        formulaUsed = `(PI * (D(${D}) - T(${T})) * T(${T}) * L(6) * rho(${rho})) / 1000`;
      } else if (type === 'Bar' && D) {
        weight = (Math.pow(D, 2) / 162) * 6;
        formulaUsed = `(D(${D})^2 / 162) * L(6)`;
      } else if (type === 'Profile' && T) {
        const parsedP = parseDimensions(p.dimensions);
        const P_w = parsedP ? parsedP.w : 0;
        if (P_w > 0) {
           weight = ( 4 * T * (P_w - T) * 6 * rho ) / 1000; 
           formulaUsed = `4 * T(${T}) * (W(${P_w}) - T(${T})) * L(6) * rho(${rho}) / 1000`;
        }
      }
      if (weight > 0) {
        report.sampleValidations.push({
          id: p.id,
          category: catTitle,
          type: type,
          raw_dimensions: p.dimensions,
          raw_thickness: p.thickness,
          raw_outer_diameter: p.outer_diameter,
          calculated_weight_kg: weight.toFixed(2),
          formula: formulaUsed
        });
        sampleCount++;
      }
    }
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { console.error(e); } finally { await conn.end(); }
}
runAudit();
