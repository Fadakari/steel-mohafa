const mysql = require('mysql2/promise');

const marketData = [
  { finish: "میرور نقره ای", thickness: 0.4, sheet: 9249690 },
  { finish: "خش دار نقره ای", thickness: 0.4, sheet: 7066490 },
  { finish: "میرور طلایی", thickness: 0.4, sheet: 9535950 },
  { finish: "خش دار نقره ای", thickness: 0.5, sheet: 9242050 },
  { finish: "میرور نقره ای", thickness: 0.5, sheet: 9929070 },
  { finish: "میرور طلایی", thickness: 0.5, sheet: 10215330 },
  { finish: "میرور نقره ای", thickness: 0.6, sheet: 11932880 },
  { finish: "خش دار نقره ای", thickness: 0.6, sheet: 11074100 },
  { finish: "میرور طلایی", thickness: 0.6, sheet: 12505390 },
  { finish: "میرور نقره ای", thickness: 0.7, sheet: 14222940 },
  { finish: "خش دار نقره ای", thickness: 0.7, sheet: 13364170 },
  { finish: "میرور طلایی", thickness: 0.7, sheet: 14795460 },
  { finish: "خش دار نقره ای", thickness: 0.8, sheet: 13997400 },
  { finish: "میرور نقره ای", thickness: 0.8, sheet: 15142440 },
  { finish: "میرور طلایی", thickness: 0.8, sheet: 16799260 },
  { finish: "میرور نقره ای", thickness: 1.0, sheet: 21193540 },
  { finish: "خش دار طلایی", thickness: 1.0, sheet: 20164920 },
  { finish: "میرور طلایی", thickness: 1.0, sheet: 21515420 },
  { finish: "میرور نقره ای", thickness: 1.25, sheet: 22623550 },
  { finish: "میرور طلایی", thickness: 1.25, sheet: 23750770 },
  { finish: "خش دار نقره ای", thickness: 1.5, sheet: 23356360 },
  { finish: "میرور نقره ای", thickness: 1.5, sheet: 24537020 },
  { finish: "میرور طلایی", thickness: 1.5, sheet: 24876710 }
];
const AREA = 1.22 * 2.44; // 2.9768
const DENSITY = 7.93;
const W_MULTIPLIER = AREA * DENSITY; // ~23.606056
const BASE_PRICE = 668001;

function getFinishNameMap(f) {
  if (f === "میرور نقره ای") return "نقرهای میرور"; 
  if (f === "خش دار نقره ای") return "نقره ای خشدار";
  if (f === "میرور طلایی") return "طلایی میرور";
  if (f === "خش دار طلایی") return "طلایی خشدار";
  return f; 
}

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  console.log("=== PHASE 22: POST-MIGRATION AUDIT ===\\n");

  const [products] = await conn.query(`
    SELECT p.id, p.finish_surface, p.thickness, CAST(p.thickness AS CHAR) as casted_thick, p.brand_origin, p.condition as form, 
           ppa.calculated_price_per_kg, ppa.calculated_total_price_per_unit, p.category_id
    FROM products p
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    WHERE p.category_id = 266
  `);

  // 1 & 2. Trend & Sheet Price Audit
  const thicknessList = [0.5, 0.6, 0.8, 1, 1.25, 1.5, 2, 3, 4, 5, 6];
  // Select Taiwan / Sheet for a standardized comparison across all thicks/finishes
  const benchmarkProducts = products.filter(p => p.brand_origin === 'تایوان' && p.form !== 'رول');
  
  const finishes = ["طلایی میرور", "نقره ای خشدار", "مشکی میرور", "برنز"];
  
  console.log("1 & 2. THICKNESS TREND AUDIT (Taiwan, Sheet)");
  for (const f of finishes) {
    console.log(`\\n--- Finish: ${f} ---`);
    console.log("Thick | Price/kg   | Sheet Weight | Price/Sheet  | kg Trend | Sheet Trend | Benchmark?");
    
    let prevKg = null;
    let prevSheet = null;
    
    for (const th of thicknessList) {
      const p = benchmarkProducts.find(x => x.finish_surface === f && parseFloat(x.thickness) === th);
      if (!p) continue;
      
      const kgPrice = parseFloat(p.calculated_price_per_kg);
      const weight = th * W_MULTIPLIER;
      const sheetPrice = kgPrice * weight;
      
      let kgTrend = prevKg ? (kgPrice < prevKg ? "↓ OK" : "↑ WARN") : "-";
      let sheetTrend = prevSheet ? (sheetPrice > prevSheet ? "↑ OK" : "↓ WARN") : "-";
      
      let bench = "MODEL-BASED / NO DIRECT MARKET BENCHMARK";
      if (th <= 1.5) bench = "DIRECT BENCHMARK";
      
      console.log(`${th.toString().padEnd(5)} | ${kgPrice.toString().padEnd(10)} | ${weight.toFixed(2).padEnd(12)} | ${Math.round(sheetPrice).toString().padEnd(12)} | ${kgTrend.padEnd(8)} | ${sheetTrend.padEnd(11)} | ${bench}`);
      
      prevKg = kgPrice;
      prevSheet = sheetPrice;
    }
  }

  // 4 & 5. Brand & Form Neutrality
  console.log("\\n4 & 5. BRAND & FORM NEUTRALITY AUDIT (0.8mm طلایی میرور)");
  const bnfGroup = products.filter(p => p.finish_surface === "طلایی میرور" && parseFloat(p.thickness) === 0.8);
  const baseFormBrand = bnfGroup.find(p => p.brand_origin === 'تایوان' && p.form !== 'رول');
  if (baseFormBrand) {
    const baseP = parseFloat(baseFormBrand.calculated_price_per_kg);
    bnfGroup.forEach(p => {
      const pP = parseFloat(p.calculated_price_per_kg);
      let expectedMult = 1.0;
      if (p.brand_origin === "چاینا (چین)") expectedMult *= 1.001;
      if (p.brand_origin === "جندال هند") expectedMult *= 1.002;
      if (p.brand_origin === "پوسکو کره") expectedMult *= 1.003;
      if (p.form === "رول") expectedMult *= 1.0005;
      
      const calcP = Math.round(baseP * expectedMult);
      console.log(`${p.brand_origin.padEnd(15)} | ${p.form.padEnd(15)} | Actual: ${pP} | Expected: ${calcP} | Match: ${Math.abs(pP - calcP) <= 1 ? "YES" : "NO"}`);
    });
  }

  // 6. Fallback Verification
  console.log("\\n6. FALLBACK VERIFICATION (V1 vs V2 Logic Check)");
  const fbTest = products.find(p => p.finish_surface === "طلایی میرور" && parseFloat(p.thickness) === 1.5 && p.brand_origin === 'تایوان' && p.form !== 'رول');
  if (fbTest) {
    // V1 calculation: Base * Brand * Form * Cat * Finish * Thick
    const v1Calc = Math.round(BASE_PRICE * 1.0 * 1.0 * 1.0 * 1.572 * 1.0); // 1.5mm thick mult = 1.0
    console.log(`Product ID ${fbTest.id} (1.5mm Gold Mirror Taiwan Sheet):`);
    console.log(`Current DB Price (Composite): ${fbTest.calculated_price_per_kg}`);
    console.log(`V1 Fallback (Without Composite): ${v1Calc}`);
    console.log(`Impact of Composite Rule: Price reduced by ${v1Calc - parseFloat(fbTest.calculated_price_per_kg)} per kg`);
  }

  // 7, 8, 9. Rule Coverage, Duplicates, Integrity
  console.log("\\n7, 8, 9. INTEGRITY & COVERAGE AUDIT");
  const [globalRules] = await conn.query("SELECT rule_value, count(*) as c FROM pricing_rules WHERE rule_type='global' AND category_id=266 GROUP BY rule_value");
  console.log(`Total Unique Composite Rules: ${globalRules.length}`);
  const dups = globalRules.filter(r => r.c > 1);
  console.log(`Duplicate Rules: ${dups.length}`);
  
  const [nullPrices] = await conn.query("SELECT count(*) as c FROM product_pricing_attributes WHERE calculated_price_per_kg IS NULL OR calculated_price_per_kg <= 0");
  console.log(`Products with NULL/0 price: ${nullPrices[0].c}`);

  const [totalCat266] = await conn.query("SELECT count(*) as c FROM products WHERE category_id = 266");
  console.log(`Total Cat 266 Products: ${totalCat266[0].c} (Should be 1056)`);

  const orphans = products.filter(p => !globalRules.find(r => r.rule_value === p.finish_surface + "_" + p.casted_thick));
  console.log(`Cat 266 Products missing a Composite Rule: ${orphans.length}`);

  // 10. Market Validation (Benchmark Accuracy)
  console.log("\\n10. MARKET VALIDATION");
  const bProducts = products.filter(p => p.brand_origin === 'تایوان' && p.form !== 'رول');
  for (const d of marketData) {
    const f = getFinishNameMap(d.finish);
    const p = bProducts.find(x => x.finish_surface === f && parseFloat(x.thickness) === d.thickness);
    if (p) {
      const kgPrice = parseFloat(p.calculated_price_per_kg);
      const weight = d.thickness * W_MULTIPLIER;
      const targetSheet = Math.round((kgPrice * weight) / 1.03); // Reversing 3% margin to get market base
      const actualMarket = d.sheet;
      const diff = ((targetSheet - actualMarket) / actualMarket) * 100;
      console.log(`Th: ${d.thickness} | Finish: ${f.padEnd(15)} | Derived Market: ${targetSheet} | Actual Market: ${actualMarket} | Diff: ${diff.toFixed(2)}%`);
    }
  }

  // 11. Outlier Detection
  console.log("\\n11. OUTLIER DETECTION (Top 5 / Bottom 5)");
  const sortedP = [...products].sort((a,b) => parseFloat(a.calculated_price_per_kg) - parseFloat(b.calculated_price_per_kg));
  console.log("Lowest Price/kg:");
  for (let i=0; i<5; i++) {
    console.log(`ID: ${sortedP[i].id} | ${sortedP[i].finish_surface.padEnd(15)} | Th: ${sortedP[i].thickness} | Price: ${sortedP[i].calculated_price_per_kg}`);
  }
  console.log("Highest Price/kg:");
  for (let i=sortedP.length-1; i>=sortedP.length-5; i--) {
    console.log(`ID: ${sortedP[i].id} | ${sortedP[i].finish_surface.padEnd(15)} | Th: ${sortedP[i].thickness} | Price: ${sortedP[i].calculated_price_per_kg}`);
  }
  
  // Highest Change from V1
  console.log("Highest absolute change from V1 logic:");
  const diffs = products.map(p => {
    let finishM = 1.0;
    if (p.finish_surface === "طلایی میرور") finishM = 1.572;
    if (p.finish_surface === "مشکی میرور") finishM = 1.646;
    if (p.finish_surface === "برنز") finishM = 1.646;
    if (p.finish_surface === "نقرهای میرور") finishM = 1.272;
    if (p.finish_surface === "نقره ای خشدار") finishM = 1.272;
    if (p.finish_surface === "طلایی خشدار") finishM = 1.497;
    let thickM = 1.0;
    if (parseFloat(p.thickness) === 0.5) thickM = 1.08;
    if (parseFloat(p.thickness) === 0.6) thickM = 1.05;
    
    let brandM = 1.0;
    if (p.brand_origin === "چاینا (چین)") brandM = 1.0010;
    if (p.brand_origin === "جندال هند") brandM = 1.0020;
    if (p.brand_origin === "پوسکو کره") brandM = 1.0030;
    let formM = p.form === "رول" ? 1.0005 : 1.0;
    
    const oldP = Math.round(BASE_PRICE * brandM * formM * finishM * thickM);
    const newP = parseFloat(p.calculated_price_per_kg);
    return { ...p, diff: oldP - newP };
  });
  
  diffs.sort((a,b) => b.diff - a.diff);
  for (let i=0; i<5; i++) {
    console.log(`ID: ${diffs[i].id} | ${diffs[i].finish_surface.padEnd(15)} | Th: ${diffs[i].thickness} | Price drop/kg: -${diffs[i].diff}`);
  }
  
  process.exit(0);
}

main();
