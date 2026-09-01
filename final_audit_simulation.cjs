const mysql = require('mysql2/promise');

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

  const [products] = await conn.query(`
    SELECT p.id, pam.alloy_id, a.name as alloy_name, a.basePrice, 
           p.brand_origin, p.condition, p.finish_surface, p.thickness, p.category_id, ppa.calculated_weight_kg
    FROM products p
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    JOIN alloy a ON pam.alloy_id = a.id
  `);

  let totalProducts = products.length;
  let belowBase = 0;
  
  let alloyStats = {};
  
  let examples304 = [];
  let uniqueCombos = new Set();
  
  for (let p of products) {
    const bMult = rules.brand_origin[p.brand_origin] || 1.0000;
    const fMult = rules.condition[p.condition] || 1.0000;
    const cMult = rules.category[p.category_id] || 1.0000;
    const finishMult = 1.0000;
    const thickMult = 1.0000;
    
    const finalMult = bMult * fMult * cMult * finishMult * thickMult;
    const calcPrice = Math.round(p.basePrice * finalMult);
    const finalPrice = Math.max(p.basePrice, calcPrice);
    
    if (finalPrice < p.basePrice) belowBase++;
    
    if (!alloyStats[p.alloy_name]) {
      alloyStats[p.alloy_name] = { minDiff: Infinity, maxDiff: -Infinity, brands: {}, forms: {} };
    }
    
    let diff = finalPrice - p.basePrice;
    if (diff < alloyStats[p.alloy_name].minDiff) alloyStats[p.alloy_name].minDiff = diff;
    if (diff > alloyStats[p.alloy_name].maxDiff) alloyStats[p.alloy_name].maxDiff = diff;
    
    if (p.alloy_name === '304' && p.category_id !== 266) {
        let key = p.brand_origin + '_' + p.condition;
        if(!uniqueCombos.has(key) && examples304.length < 20) {
            uniqueCombos.add(key);
            examples304.push({
               ID: p.id, Alloy: p.alloy_name, Brand: p.brand_origin, Form: p.condition,
               Thick: p.thickness, Finish: p.finish_surface, Cat: p.category_id,
               Base: p.basePrice, BrandMult: bMult, FormMult: fMult, CatMult: cMult,
               FinalMult: finalMult.toFixed(6), FinalPrice: finalPrice
            });
        }
    }
  }
  
  console.log("Total products processed:", totalProducts);
  console.log("Products strictly below Base Price:", belowBase);
  console.log("Stats:", JSON.stringify(alloyStats, null, 2));
  console.log("Examples:", JSON.stringify(examples304, null, 2));
  
  process.exit(0);
}

main().catch(console.error);
