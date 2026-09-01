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

const DENSITY = 7.93;
const AREA = 1.22 * 2.44;
const BASE = 668001; // Industrial Base for 304

// We will use 0.8mm as the anchor for Area-Based extrapolation for unknown thicknesses
const anchor08 = marketData.filter(d => d.thickness === 0.8);

function getFinishNameMap(f) {
  if (f === "میرور نقره ای") return "نقرهای میرور";
  if (f === "خش دار نقره ای") return "نقره ای خشدار";
  if (f === "میرور طلایی") return "طلایی میرور";
  if (f === "خش دار طلایی") return "طلایی خشدار";
  return f; // fallback
}

// Generate the composite target price/kg dictionary
const compositeTargets = {};
const areaBasedModelParams = {}; // finish -> cost per m2

// First, store explicit market benchmarks
for (const d of marketData) {
  const weight = AREA * d.thickness * DENSITY;
  const marketPerKg = d.sheet / weight;
  const targetPerKg = marketPerKg * 1.03; // Market + 3%
  const f = getFinishNameMap(d.finish);
  const key = `${f}_${d.thickness}`;
  compositeTargets[key] = targetPerKg;
}

// Second, calculate Area-Based Finish Cost per m2 for the 0.8 anchor to extrapolate
for (const d of anchor08) {
  const f = getFinishNameMap(d.finish);
  const weight = AREA * d.thickness * DENSITY;
  const marketPerKg = d.sheet / weight;
  const finishPremiumPerKg = marketPerKg - BASE;
  const costPerM2 = (finishPremiumPerKg * weight) / AREA;
  areaBasedModelParams[f] = costPerM2;
}

// Map unknown finishes (Black Mirror, Bronze) to Gold Mirror + 3% flat premium on the M2 cost
const goldM2Cost = areaBasedModelParams["طلایی میرور"];
areaBasedModelParams["مشکی میرور"] = goldM2Cost * 1.05;
areaBasedModelParams["برنز"] = goldM2Cost * 1.05;

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const [products] = await conn.query(
    "SELECT p.id, p.brand_origin, p.condition as form, p.finish_surface, CAST(p.thickness AS DECIMAL(10,5)) as thickness, " +
    "       ppa.calculated_price_per_kg as current_price " +
    "FROM products p " +
    "JOIN product_pricing_attributes ppa ON p.id = ppa.product_id " +
    "WHERE p.category_id = 266"
  );
  
  let stats = {
    total: 0,
    under3: 0,
    under5: 0,
    under10: 0,
    over10: 0,
    underpriced: 0,
    overpriced: 0,
    deviations: [],
    outliersByThick: {}
  };
  
  const simulatedProducts = [];

  for (const p of products) {
    const f = p.finish_surface;
    const th = parseFloat(p.thickness);
    let key = `${f}_${th}`;
    let targetPrice = compositeTargets[key];
    
    // Extrapolate if not explicitly in benchmark
    if (!targetPrice) {
      // Find area-based param
      let m2Cost = areaBasedModelParams[f];
      // If we don't have this exact finish in area-based, fallback to Silver Hairline (cheapest)
      if (!m2Cost) m2Cost = areaBasedModelParams["نقره ای خشدار"] || 0;
      
      const weight = AREA * th * DENSITY;
      // Base + AreaCost
      const marketPriceEst = BASE + (m2Cost * AREA) / weight;
      targetPrice = marketPriceEst * 1.03;
    }
    
    // Simulate SP logic: Target = Base * Brand * Form * Composite
    // Here we find what the Composite multiplier WOULD be:
    // (Note: in the actual DB, we would just insert the multiplier. Here we simulate the final price).
    
    // In our SP V2, Final Price = Target Price (since we reverse-engineered the multiplier).
    // Let's just say new_price = targetPrice * Brand * Form.
    // Wait, the targetPrice we calculated WAS for a generic product. 
    // To be precise:
    let brandMult = 1.0;
    if (p.brand_origin === "چاینا (چین)") brandMult = 1.0010;
    if (p.brand_origin === "جندال هند") brandMult = 1.0020;
    if (p.brand_origin === "پوسکو کره") brandMult = 1.0030;
    
    let formMult = 1.0;
    if (p.form === "رول") formMult = 1.0005;
    
    let simulatedFinalPrice = Math.round(targetPrice * brandMult * formMult);
    
    // Compare Simulated New Price with Current Price
    const currentPrice = parseFloat(p.current_price);
    const diffPct = ((currentPrice - simulatedFinalPrice) / simulatedFinalPrice) * 100; // how much current is off from the NEW ideal price
    
    stats.total++;
    stats.deviations.push(diffPct);
    
    const absDiff = Math.abs(diffPct);
    if (absDiff < 3) stats.under3++;
    else if (absDiff < 5) stats.under5++;
    else if (absDiff < 10) stats.under10++;
    else stats.over10++;
    
    if (currentPrice < simulatedFinalPrice) stats.underpriced++;
    else if (currentPrice > simulatedFinalPrice) stats.overpriced++;
    
    if (!stats.outliersByThick[th]) stats.outliersByThick[th] = [];
    if (absDiff > 10) {
      stats.outliersByThick[th].push({
        id: p.id, finish: f, brand: p.brand_origin, 
        current: currentPrice, simulated: simulatedFinalPrice, diffPct
      });
    }
    
    simulatedProducts.push({
      id: p.id,
      brand: p.brand_origin,
      form: p.form,
      finish: f,
      thickness: th,
      current: currentPrice,
      simulated: simulatedFinalPrice
    });
  }
  
  // Calculate average, median, min, max deviation
  stats.deviations.sort((a,b) => a - b);
  stats.minDev = stats.deviations[0];
  stats.maxDev = stats.deviations[stats.deviations.length - 1];
  stats.avgDev = stats.deviations.reduce((a,b)=>a+b, 0) / stats.total;
  stats.medianDev = stats.deviations[Math.floor(stats.total / 2)];
  
  console.log("=== SIMULATION RESULTS ===");
  console.log("Total Products:", stats.total);
  console.log("Average Deviation:", stats.avgDev.toFixed(2) + "%");
  console.log("Median Deviation:", stats.medianDev.toFixed(2) + "%");
  console.log("Min Deviation:", stats.minDev.toFixed(2) + "%");
  console.log("Max Deviation:", stats.maxDev.toFixed(2) + "%");
  console.log("Products < 3% Diff:", stats.under3);
  console.log("Products 3-5% Diff:", stats.under5);
  console.log("Products 5-10% Diff:", stats.under10);
  console.log("Products > 10% Diff:", stats.over10);
  console.log("Underpriced currently:", stats.underpriced);
  console.log("Overpriced currently:", stats.overpriced);
  
  console.log("\nOutliers by Thickness (>10% dev):");
  for (const th of Object.keys(stats.outliersByThick).sort((a,b)=>parseFloat(a)-parseFloat(b))) {
    console.log(`Thickness ${th}: ${stats.outliersByThick[th].length} outliers`);
  }

  // Pick one random example
  const ex = simulatedProducts.find(p => p.finish === "طلایی میرور" && p.thickness === 1.5 && p.brand === "پوسکو کره");
  if (ex) {
    console.log("\nExample 304 1.5mm Gold Mirror Posco:");
    console.log(`Base: 668001 -> Brand: x1.003 -> Form: x1.0 -> Composite: x1.08 -> Final: ${ex.simulated}`);
    console.log(`Current DB Price: ${ex.current}`);
  }
  
  // Create the SP V2 SQL
  const spSql = "DELIMITER $$\n" +
"CREATE PROCEDURE sp_recalculate_pricing_v2_simulation(\n" +
"    p_alloy_id INT,\n" +
"    p_category_id INT,\n" +
"    p_brand VARCHAR(255),\n" +
"    p_form VARCHAR(255),\n" +
"    p_finish VARCHAR(255),\n" +
"    p_thickness VARCHAR(255),\n" +
"    p_source VARCHAR(50)\n" +
")\n" +
"BEGIN\n" +
"    UPDATE product_pricing_attributes ppa\n" +
"    JOIN products p ON ppa.product_id = p.id\n" +
"    JOIN product_alloy_mapping pam ON p.id = pam.product_id\n" +
"    JOIN alloy a ON pam.alloy_id = a.id\n" +
"    SET \n" +
"        ppa.calculated_price_per_kg = GREATEST(\n" +
"            a.basePrice,\n" +
"            CAST(\n" +
"                a.basePrice *\n" +
"                COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id IS NULL LIMIT 1), 1.0) *\n" +
"                COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='product_type' AND pr.rule_value=p.condition AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='product_type' AND pr.rule_value=p.condition AND pr.alloy_id IS NULL LIMIT 1), 1.0) *\n" +
"                COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0) *\n" +
"                COALESCE(\n" +
"                  (SELECT multiplier FROM pricing_rules pr \n" +
"                   WHERE pr.rule_type='global' \n" +
"                     AND pr.category_id=p.category_id \n" +
"                     AND pr.rule_value=CONCAT(p.finish_surface, '_', CAST(p.thickness AS CHAR)) \n" +
"                   LIMIT 1),\n" +
"                  (\n" +
"                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id IS NULL LIMIT 1), 1.0) *\n" +
"                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0)\n" +
"                  )\n" +
"                )\n" +
"            AS DECIMAL(15,0))\n" +
"        )\n" +
"    WHERE \n" +
"        (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND\n" +
"        (p_category_id IS NULL OR p.category_id = p_category_id) AND\n" +
"        (p_brand IS NULL OR p.brand_origin = p_brand) AND\n" +
"        (p_form IS NULL OR p.condition = p_form) AND\n" +
"        (p_finish IS NULL OR p.finish_surface = p_finish) AND\n" +
"        (p_thickness IS NULL OR p.thickness = p_thickness);\n" +
"END$$\n" +
"DELIMITER ;\n";

  require('fs').writeFileSync('sp_v2_simulation.sql', spSql);
  console.log("\\nSaved SP V2 Simulation to sp_v2_simulation.sql");
  process.exit(0);
}

main();
