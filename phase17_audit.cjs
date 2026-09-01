const mysql = require('mysql2/promise');

const refData = [
  { finish: "نقره ای میرور", thickness: 0.4, sheet_price: 9249690 },
  { finish: "نقره ای خشدار", thickness: 0.4, sheet_price: 7066490 },
  { finish: "طلایی میرور", thickness: 0.4, sheet_price: 9535950 },
  { finish: "نقره ای خشدار", thickness: 0.5, sheet_price: 9242050 },
  { finish: "نقره ای میرور", thickness: 0.5, sheet_price: 9929070 },
  { finish: "طلایی میرور", thickness: 0.5, sheet_price: 10215330 },
  { finish: "نقره ای میرور", thickness: 0.6, sheet_price: 11932880 },
  { finish: "نقره ای خشدار", thickness: 0.6, sheet_price: 11074100 },
  { finish: "طلایی میرور", thickness: 0.6, sheet_price: 12505390 },
  { finish: "نقره ای میرور", thickness: 0.7, sheet_price: 14222940 },
  { finish: "نقره ای خشدار", thickness: 0.7, sheet_price: 13364170 },
  { finish: "طلایی میرور", thickness: 0.7, sheet_price: 14795460 },
  { finish: "نقره ای خشدار", thickness: 0.8, sheet_price: 13997400 },
  { finish: "نقره ای میرور", thickness: 0.8, sheet_price: 15142440 },
  { finish: "طلایی میرور", thickness: 0.8, sheet_price: 16799260 },
  { finish: "نقره ای میرور", thickness: 1.0, sheet_price: 21193540 },
  { finish: "طلایی خشدار", thickness: 1.0, sheet_price: 20164920 },
  { finish: "طلایی میرور", thickness: 1.0, sheet_price: 21515420 },
  { finish: "نقره ای میرور", thickness: 1.25, sheet_price: 22623550 },
  { finish: "طلایی میرور", thickness: 1.25, sheet_price: 23750770 },
  { finish: "نقره ای خشدار", thickness: 1.5, sheet_price: 23356360 },
  { finish: "نقره ای میرور", thickness: 1.5, sheet_price: 24537020 },
  { finish: "طلایی میرور", thickness: 1.5, sheet_price: 24876710 }
];

const DENSITY = 7.93; // standard SS304 density
const AREA = 1.22 * 2.44; // 2.9768

const refMap = {};
refData.forEach(r => {
  const weight = AREA * r.thickness * DENSITY;
  const pricePerKg = r.sheet_price / weight;
  
  // Normalize names to match DB
  let dbFinish = r.finish;
  if (r.finish === "میرور نقره ای") dbFinish = "نقرهای میرور";
  if (r.finish === "خش دار نقره ای") dbFinish = "نقره ای خشدار";
  if (r.finish === "میرور طلایی") dbFinish = "طلایی میرور";
  if (r.finish === "خش دار طلایی") dbFinish = "طلایی خشدار";
  // The provided table has "نقره ای میرور" etc.
  if (r.finish === "نقره ای میرور") dbFinish = "نقره ای میرور"; 
  
  const key = dbFinish + "_" + r.thickness;
  refMap[key] = pricePerKg;
});

function getRefPrice(finish, thick) {
  // Normalize finish to ref map format
  let f = finish;
  // Fallbacks if not found exactly
  if (finish === 'مشکی میرور' || finish === 'برنز') {
    // These usually carry a ~5% premium over Gold Mirror
    f = "طلایی میرور";
  }
  if (!f) return null;
  
  let key = f + "_" + thick;
  if (refMap[key]) {
      let p = refMap[key];
      return (finish === 'مشکی میرور' || finish === 'برنز') ? p * 1.05 : p;
  }
  
  // Find closest thickness
  const availableThicks = refData.filter(r => {
      let rF = r.finish;
      if (rF === "میرور نقره ای") rF = "نقره ای میرور";
      if (rF === "خش دار نقره ای") rF = "نقره ای خشدار";
      return rF === f;
  }).map(r => r.thickness);
  
  if (availableThicks.length === 0) {
      // Fallback to silver mirror if entirely unknown
      return getRefPrice("نقره ای میرور", thick); 
  }
  
  const closest = availableThicks.reduce((prev, curr) => Math.abs(curr - thick) < Math.abs(prev - thick) ? curr : prev);
  let baseP = refMap[f + "_" + closest];
  
  return (finish === 'مشکی میرور' || finish === 'برنز') ? baseP * 1.05 : baseP;
}

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [products] = await conn.query(
    'SELECT p.id, p.brand_origin, p.condition as form, p.finish_surface, p.thickness, ppa.calculated_price_per_kg ' +
    'FROM products p ' +
    'JOIN product_pricing_attributes ppa ON p.id = ppa.product_id ' +
    'WHERE p.category_id = 266'
  );
  
  let results = {
      total: 0,
      green: 0,
      acceptable: 0,
      review: 0,
      warning: 0,
      max_over: -Infinity,
      max_under: Infinity,
      byFinish: {},
      byThick: {},
      byBrand: {},
      outliers: []
  };

  products.forEach(p => {
    const ourPrice = parseFloat(p.calculated_price_per_kg);
    let refPrice = getRefPrice(p.finish_surface, p.thickness);
    if (!refPrice) return; // skip if totally unmappable
    
    // Some thicknesses are >1.5, let's normalize ref price for logic checks
    const diffPct = ((ourPrice - refPrice) / refPrice) * 100;
    
    results.total++;
    const absDiff = Math.abs(diffPct);
    
    if (absDiff <= 5) results.green++;
    else if (absDiff <= 10) results.acceptable++;
    else if (absDiff <= 15) results.review++;
    else results.warning++;
    
    if (diffPct > results.max_over) results.max_over = diffPct;
    if (diffPct < results.max_under) results.max_under = diffPct;
    
    // Aggregates
    if (!results.byFinish[p.finish_surface]) results.byFinish[p.finish_surface] = { sumOur: 0, sumRef: 0, count: 0 };
    results.byFinish[p.finish_surface].sumOur += ourPrice;
    results.byFinish[p.finish_surface].sumRef += refPrice;
    results.byFinish[p.finish_surface].count++;
    
    if (!results.byThick[p.thickness]) results.byThick[p.thickness] = { sumOur: 0, sumRef: 0, count: 0 };
    results.byThick[p.thickness].sumOur += ourPrice;
    results.byThick[p.thickness].sumRef += refPrice;
    results.byThick[p.thickness].count++;

    if (!results.byBrand[p.brand_origin]) results.byBrand[p.brand_origin] = { sumOur: 0, sumRef: 0, count: 0 };
    results.byBrand[p.brand_origin].sumOur += ourPrice;
    results.byBrand[p.brand_origin].sumRef += refPrice;
    results.byBrand[p.brand_origin].count++;
    
    if (absDiff > 10) { // store significant outliers
      results.outliers.push({
          id: p.id,
          finish: p.finish_surface,
          thick: p.thickness,
          brand: p.brand_origin,
          form: p.form,
          our: ourPrice,
          ref: refPrice,
          diff: diffPct
      });
    }
  });

  results.outliers.sort((a,b) => Math.abs(b.diff) - Math.abs(a.diff));
  results.outliers = results.outliers.slice(0, 20); // Keep top 20
  
  // Output JSON for interpretation
  const fs = require('fs');
  fs.writeFileSync('audit_results.json', JSON.stringify(results, null, 2));
  console.log('Audit complete. Results saved to audit_results.json');
  process.exit(0);
}

main();
