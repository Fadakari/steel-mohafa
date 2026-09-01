const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const rules = {
    brand_origin: {
      'تایوان': 1.0000,
      'چاینا (چین)': 1.0010,
      'جندال هند': 1.0020,
      'پوسکو کره': 1.0030,
    },
    condition: {
      'شیت': 1.0000,
      'رول': 1.0005,
    },
    category: {
      266: 1.5320
    }
  };

  const targetAlloyNames = ['304', '316', '430', '310', '420', '201'];
  
  const [allAlloys] = await conn.query('SELECT id, name, basePrice FROM alloy');
  const alloys = allAlloys.filter(a => targetAlloyNames.includes(a.name));

  let results = [];
  let decorativeSamples = [];
  
  for (let alloy of alloys) {
    const [products] = await conn.query(`
      SELECT p.id, pam.alloy_id, p.brand_origin, p.condition, p.finish_surface, p.thickness, p.category_id, ppa.calculated_weight_kg
      FROM products p
      JOIN product_alloy_mapping pam ON p.id = pam.product_id
      JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
      WHERE pam.alloy_id = ?
    `, [alloy.id]);
    
    // Select diverse products for normal variants + ALL decorative
    let uniqueCombos = new Set();
    let selectedProducts = [];
    
    for(let p of products) {
      if (p.category_id === 266) {
         if(decorativeSamples.length < 5) decorativeSamples.push({...p, alloyName: alloy.name, basePrice: alloy.basePrice});
      }
      
      let key = p.brand_origin + '_' + p.condition + '_' + p.finish_surface + '_' + p.thickness + '_' + p.category_id;
      if(!uniqueCombos.has(key) && selectedProducts.length < 20) {
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
  
  // Calculate Decorative separately to output
  let decOut = [];
  for (let p of decorativeSamples) {
      const bMult = rules.brand_origin[p.brand_origin] || 1.0000;
      const fMult = rules.condition[p.condition] || 1.0000;
      const cMult = rules.category[p.category_id] || 1.0000;
      const calcPrice = Math.round(p.basePrice * bMult * fMult * cMult);
      const finalPrice = Math.max(p.basePrice, calcPrice);
      decOut.push({
         ID: p.id,
         Alloy: p.alloyName,
         BasePrice: p.basePrice,
         Category: p.category_id,
         BrandMult: bMult,
         FormMult: fMult,
         CatMult: cMult,
         FinalPrice: finalPrice
      });
  }

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
  
  const finalReport = {
    summaries: [],
    examples: [],
    decorative: decOut
  };
  
  for(let a in summaries) {
     let s = summaries[a];
     
     let brandAvgs = {};
     for(let b in s.brands) {
       brandAvgs[b] = Math.round(s.brands[b].reduce((sum, val) => sum+val, 0) / s.brands[b].length);
     }
     
     let sheetAvg = s.forms['شیت'].length ? Math.round(s.forms['شیت'].reduce((sum, val) => sum+val, 0) / s.forms['شیت'].length) : 0;
     let rollAvg = s.forms['رول'].length ? Math.round(s.forms['رول'].reduce((sum, val) => sum+val, 0) / s.forms['رول'].length) : 0;
     
     finalReport.summaries.push({
       Alloy: a,
       BasePrice: s.base,
       MinFinalPrice: s.min,
       MaxFinalPrice: s.max,
       MinDiff: s.min - s.base,
       MaxDiff: s.max - s.base,
       BrandAvgs: brandAvgs,
       SheetRollAvgSpread: Math.abs(sheetAvg - rollAvg)
     });
  }
  
  // Pick a few normal examples
  finalReport.examples = results.filter(x => x.Alloy === '304' && x.CatMult === '1.0000').slice(0, 10).map(x => ({
      ID: x.ProductID,
      Alloy: x.Alloy,
      Brand: x.Brand,
      Form: x.Form,
      Thick: x.Thickness,
      BasePrice: x.BasePrice,
      BrandMult: x.BrandMult,
      FormMult: x.FormMult,
      FinalPrice: x.FinalPrice,
      GTEBase: x.FinalPriceGTEBase
  }));

  console.log(JSON.stringify(finalReport, null, 2));
  
  process.exit(0);
}

main().catch(console.error);
