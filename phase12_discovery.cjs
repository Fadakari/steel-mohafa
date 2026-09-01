const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const [data] = await conn.execute(`
    SELECT 
      p.id as product_id, 
      pam.alloy_id, 
      p.thickness, 
      p.brand_origin as brand, 
      p.condition as form, 
      p.finish_surface as finish,
      p.dimensions,
      p.category_id,
      CAST(ph.price AS DOUBLE) as price
    FROM products p
    JOIN (
      SELECT product_id, price, ROW_NUMBER() OVER(PARTITION BY product_id ORDER BY date_created DESC) as rn
      FROM price_history WHERE date_created < '2026-08-30'
    ) ph ON p.id = ph.product_id AND ph.rn = 1
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
  `);
  
  const histBase = { 1: 219000, 2: 309000, 3: 136000, 4: 319000, 5: 154000, 6: 156000, 7: 394000, 8: 163000, 9: 365000 };
  
  let dataset = [];
  data.forEach(r => {
    let base = histBase[r.alloy_id];
    if(base && r.price > 0 && r.brand && r.thickness && r.form && r.finish) {
      dataset.push({
        ...r,
        base: base,
        ratio: r.price / base,
        diff: r.price - base
      });
    }
  });

  const avg = (arr) => arr && arr.length > 0 ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  
  // Calculate Brand overall mean
  let brandRat = {};
  dataset.forEach(r => {
    if(!brandRat[r.brand]) brandRat[r.brand] = []; brandRat[r.brand].push(r.ratio);
  });
  console.log("=== BRAND MULTIPLIERS ===");
  for(let b in brandRat) console.log(`${b}: ${avg(brandRat[b]).toFixed(4)} (n=${brandRat[b].length})`);
  
  // Check interaction Thick x Brand
  let txbRat = {};
  dataset.forEach(r => {
    const k = `${r.thickness} | ${r.brand}`;
    if(!txbRat[k]) txbRat[k] = []; txbRat[k].push(r.ratio);
  });
  console.log("\\n=== INTERACTION: THICKNESS x BRAND ===");
  ["0.5 | تایوان", "3 | تایوان", "0.5 | چاینا (چین)", "3 | چاینا (چین)"].forEach(k => {
    console.log(`${k}: ${avg(txbRat[k]).toFixed(4)} (n=${txbRat[k] ? txbRat[k].length : 0})`);
  });

  // Check 8 Variants
  const targetVars = [
    {b: 'تایوان', f: 'شیت'}, {b: 'چاینا (چین)', f: 'شیت'}, {b: 'جندال هند', f: 'شیت'}, {b: 'پوسکو کره', f: 'شیت'},
    {b: 'تایوان', f: 'رول'}, {b: 'چاینا (چین)', f: 'رول'}, {b: 'جندال هند', f: 'رول'}, {b: 'پوسکو کره', f: 'رول'}
  ];
  
  console.log("\\n=== 8 VARIANTS RATIOS ===");
  for (let v of targetVars) {
    const item = dataset.find(r => r.alloy_id===1 && r.thickness==0.5 && r.finish==='مات 2B' && r.brand===v.b && r.form===v.f && r.dimensions.includes('1000'));
    if(item) {
      console.log(`${v.b} ${v.f} -> Price: ${item.price}, Base: ${item.base}, Ratio: ${(item.price/item.base).toFixed(4)}`);
    }
  }

  process.exit(0);
}
main();
