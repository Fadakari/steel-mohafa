const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const rules = {
    brand_origin: {
      'تایوان': 1.0000,
      'چاینا (چین)': 1.0020,
      'جندال هند': 1.0040,
      'پوسکو کره': 1.0060,
    },
    condition: {
      'شیت': 1.0000,
      'رول': 1.0015,
    },
    category: {
      266: 1.5320
    }
  };

  const targetAlloyNames = ['304', '316', '430', '310', '420', '201'];
  
  const [allAlloys] = await conn.query('SELECT id, name, basePrice FROM alloy');
  const alloys = allAlloys.filter(a => targetAlloyNames.includes(a.name));

  let results = [];
  
  for (let alloy of alloys) {
    const [products] = await conn.query(`
      SELECT p.id, pam.alloy_id, p.brand_origin, p.condition, p.finish_surface, p.thickness, p.category_id, ppa.calculated_weight_kg
      FROM products p
      JOIN product_alloy_mapping pam ON p.id = pam.product_id
      JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
      WHERE pam.alloy_id = ?
    `, [alloy.id]);
    
    let uniqueCombos = new Set();
    let selectedProducts = [];
    for(let p of products) {
      let key = p.brand_origin + '_' + p.condition + '_' + p.finish_surface + '_' + p.thickness + '_' + p.category_id;
      if(!uniqueCombos.has(key) && selectedProducts.length < 15) {
        uniqueCombos.add(key);
        selectedProducts.push(p);
      }
    }
    
    for (let p of selectedProducts) {
      const bMult = rules.brand_origin[p.brand_origin] || 1.0000;
      const fMult = rules.condition[p.condition] || 1.0000;
      const cMult = rules.category[p.category_id] || 1.0000;
      const finishMult = 1.0000;
      const thickMult = 1.0000;
      
      const calcPrice = Math.round(alloy.basePrice * bMult * fMult * cMult * finishMult * thickMult);
      const finalPrice = Math.max(alloy.basePrice, calcPrice);
      
      const totalWeight = parseFloat(p.calculated_weight_kg) || 0;
      const finalTotal = Math.round(finalPrice * totalWeight);
      
      results.push({
        ProductID: p.id,
        Alloy: alloy.name,
        Brand: p.brand_origin || 'N/A',
        Form: p.condition || 'N/A',
        Finish: p.finish_surface || 'N/A',
        Thickness: p.thickness,
        BasePrice: alloy.basePrice,
        BrandMult: bMult.toFixed(4),
        FormMult: fMult.toFixed(4),
        FinishMult: finishMult.toFixed(4),
        ThickMult: thickMult.toFixed(4),
        CatMult: cMult.toFixed(4),
        CalculatedPrice: calcPrice,
        FloorPrice: alloy.basePrice,
        FinalPrice: finalPrice,
        FinalPriceGTEBase: finalPrice >= alloy.basePrice ? 'YES' : 'NO',
        Weight: totalWeight,
        TotalPrice: finalTotal
      });
    }
  }
  
  fs.writeFileSync('preview_results.json', JSON.stringify(results, null, 2));
  
  const summaries = {};
  for(let r of results) {
    if(!summaries[r.Alloy]) summaries[r.Alloy] = { base: r.BasePrice, min: Infinity, max: -Infinity, brands: {}, forms: { 'شیت': [], 'رول': [] } };
    let s = summaries[r.Alloy];
    if(r.FinalPrice < s.min) s.min = r.FinalPrice;
    if(r.FinalPrice > s.max) s.max = r.FinalPrice;
    
    if(!s.brands[r.Brand]) s.brands[r.Brand] = [];
    s.brands[r.Brand].push(r.FinalPrice);
    
    if(r.Form === 'شیت' || r.Form === 'رول') s.forms[r.Form].push(r.FinalPrice);
  }
  
  for(let a in summaries) {
     let s = summaries[a];
     console.log(`\n================ SUMMARY FOR ALLOY ${a} ================`);
     console.log(`Base Price: ${s.base}`);
     console.log(`Minimum Final Price: ${s.min} (Diff: +${s.min - s.base})`);
     console.log(`Maximum Final Price: ${s.max} (Diff: +${s.max - s.base})`);
     
     let brandAvgs = {};
     for(let b in s.brands) {
       brandAvgs[b] = Math.round(s.brands[b].reduce((sum, val) => sum+val, 0) / s.brands[b].length);
     }
     console.log(`Brand Avg Prices:`, brandAvgs);
     
     let sheetAvg = s.forms['شیت'].length ? Math.round(s.forms['شیت'].reduce((sum, val) => sum+val, 0) / s.forms['شیت'].length) : 0;
     let rollAvg = s.forms['رول'].length ? Math.round(s.forms['رول'].reduce((sum, val) => sum+val, 0) / s.forms['رول'].length) : 0;
     console.log(`Form Avg -> Sheet: ${sheetAvg}, Roll: ${rollAvg}, Spread: ${Math.abs(sheetAvg - rollAvg)}`);
  }
  
  process.exit(0);
}

main().catch(console.error);
