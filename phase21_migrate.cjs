const mysql = require('mysql2/promise');
const fs = require('fs');

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
const BASE = 668001; 

function getFinishNameMap(f) {
  if (f === "میرور نقره ای") return "نقرهای میرور"; 
  if (f === "خش دار نقره ای") return "نقره ای خشدار";
  if (f === "میرور طلایی") return "طلایی میرور";
  if (f === "خش دار طلایی") return "طلایی خشدار";
  return f; 
}

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  console.log("=== PHASE 21 MIGRATION ===");
  console.log("1. Creating Backups...");
  
  // Backup SP
  const [sp] = await conn.query("SHOW CREATE PROCEDURE sp_recalculate_pricing");
  const spV1 = sp[0]['Create Procedure'];
  fs.writeFileSync('sp_v1_backup.sql', spV1);
  
  // Backup Rules
  const [rules] = await conn.query("SELECT * FROM pricing_rules");
  fs.writeFileSync('pricing_rules_backup.json', JSON.stringify(rules, null, 2));
  
  // Baseline Prices
  const [baselineCat266] = await conn.query("SELECT p.id, ppa.calculated_price_per_kg FROM products p JOIN product_pricing_attributes ppa ON p.id = ppa.product_id WHERE p.category_id = 266");
  const base266Map = {};
  baselineCat266.forEach(r => base266Map[r.id] = parseFloat(r.calculated_price_per_kg));

  const [baselineInd] = await conn.query("SELECT p.id, ppa.calculated_price_per_kg FROM products p JOIN product_pricing_attributes ppa ON p.id = ppa.product_id WHERE p.category_id != 266");
  const baseIndMap = {};
  baselineInd.forEach(r => baseIndMap[r.id] = parseFloat(r.calculated_price_per_kg));

  console.log(`Baseline captured: ${baselineCat266.length} decorative, ${baselineInd.length} industrial.`);

  // 2. Generate 44 Rules
  const targets = {};
  const areaBased = {};
  marketData.forEach(d => {
    const f = getFinishNameMap(d.finish);
    const weight = AREA * d.thickness * DENSITY;
    const marketPerKg = d.sheet / weight;
    targets[`${f}_${d.thickness}`] = marketPerKg * 1.03;
    if (d.thickness === 0.8) {
      areaBased[f] = ((marketPerKg - BASE) * weight) / AREA;
    }
  });

  const goldArea = areaBased["طلایی میرور"];
  areaBased["مشکی میرور"] = goldArea * 1.05;
  areaBased["برنز"] = goldArea * 1.05;

  const [combinations] = await conn.query("SELECT DISTINCT finish_surface, CAST(thickness AS CHAR) as casted_thick, thickness FROM products WHERE category_id = 266 ORDER BY finish_surface, thickness");
  
  const rulesToInsert = [];
  combinations.forEach(c => {
    const f = c.finish_surface;
    const th = parseFloat(c.thickness);
    let tPrice = targets[`${f}_${th}`];
    let isEstimated = false;
    
    if (!tPrice) {
      let areaCost = areaBased[f] || areaBased["نقره ای خشدار"];
      const weight = AREA * th * DENSITY;
      const mktEst = BASE + (areaCost * AREA) / weight;
      tPrice = mktEst * 1.03;
      isEstimated = true;
    }
    
    const reqMultiplier = (tPrice / BASE).toFixed(5);
    rulesToInsert.push({
      rule_type: 'global',
      category_id: 266,
      rule_value: `${f}_${c.casted_thick}`,
      multiplier: reqMultiplier,
      targetPrice: tPrice,
      isEstimated
    });
  });

  if (rulesToInsert.length !== 44) {
    console.error("FATAL: Did not generate exactly 44 rules.");
    process.exit(1);
  }
  
  // Checking duplicates before insert
  const uniqueRules = new Set(rulesToInsert.map(r => r.rule_value));
  if (uniqueRules.size !== 44) {
    console.error("FATAL: Duplicate rules detected.");
    process.exit(1);
  }

  console.log("2. Replacing SP and Inserting Rules...");
  
  const spV2 = `CREATE PROCEDURE sp_recalculate_pricing_v2(
    p_alloy_id INT, p_category_id INT, p_brand VARCHAR(255), p_form VARCHAR(255), p_finish VARCHAR(255), p_thickness VARCHAR(255), p_source VARCHAR(50)
)
BEGIN
    UPDATE product_pricing_attributes ppa
    JOIN products p ON ppa.product_id = p.id
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN alloy a ON pam.alloy_id = a.id
    SET 
        ppa.calculated_price_per_kg = GREATEST(
            a.basePrice,
            CAST(
                a.basePrice *
                COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='product_type' AND pr.rule_value=p.condition AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='product_type' AND pr.rule_value=p.condition AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                COALESCE(
                  (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='global' AND pr.category_id=p.category_id AND pr.rule_value=CONCAT(p.finish_surface, '_', CAST(p.thickness AS CHAR)) LIMIT 1),
                  (
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0)
                  )
                )
            AS DECIMAL(15,0))
        )
    WHERE (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND (p_category_id IS NULL OR p.category_id = p_category_id) AND (p_brand IS NULL OR p.brand_origin = p_brand) AND (p_form IS NULL OR p.condition = p_form) AND (p_finish IS NULL OR p.finish_surface = p_finish) AND (p_thickness IS NULL OR p.thickness = p_thickness);
        
    UPDATE product_pricing_attributes ppa
    JOIN products p ON ppa.product_id = p.id
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    SET ppa.calculated_total_price_per_unit = ROUND(ppa.calculated_price_per_kg * ppa.calculated_weight_kg)
    WHERE (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND (p_category_id IS NULL OR p.category_id = p_category_id) AND (p_brand IS NULL OR p.brand_origin = p_brand) AND (p_form IS NULL OR p.condition = p_form) AND (p_finish IS NULL OR p.finish_surface = p_finish) AND (p_thickness IS NULL OR p.thickness = p_thickness);
END`;

  try {
    await conn.query("DROP PROCEDURE IF EXISTS sp_recalculate_pricing");
    await conn.query(spV2.replace('sp_recalculate_pricing_v2', 'sp_recalculate_pricing'));
    
    await conn.query("DELETE FROM pricing_rules WHERE rule_type='global' AND category_id=266");
    
    for (const r of rulesToInsert) {
      await conn.query("INSERT INTO pricing_rules (rule_type, rule_value, multiplier, category_id, priority) VALUES (?, ?, ?, ?, ?)", [r.rule_type, r.rule_value, r.multiplier, r.category_id, 0]);
    }
    
    console.log("3. Recalculating Category 266...");
    await conn.query("CALL sp_recalculate_pricing(null, 266, null, null, null, null, 'Phase 21 - Composite')");
    
  } catch (e) {
    console.error("MIGRATION FAILED. Rolling back...", e);
    await conn.query("DROP PROCEDURE IF EXISTS sp_recalculate_pricing");
    await conn.query(spV1);
    await conn.query("DELETE FROM pricing_rules WHERE rule_type='global' AND category_id=266");
    await conn.query("CALL sp_recalculate_pricing(null, 266, null, null, null, null, 'Rollback')");
    process.exit(1);
  }

  console.log("4. Validating...");
  
  let isValid = true;
  
  // Val 1: 44 Rules
  const [activeRules] = await conn.query("SELECT COUNT(*) as c FROM pricing_rules WHERE rule_type='global' AND category_id=266");
  if (activeRules[0].c !== 44) { console.error("Validation failed: Active rules != 44"); isValid = false; }
  
  // Val 2: No NULL/0
  const [nullPrices] = await conn.query("SELECT COUNT(*) as c FROM product_pricing_attributes ppa JOIN products p ON p.id=ppa.product_id WHERE p.category_id=266 AND (ppa.calculated_price_per_kg IS NULL OR ppa.calculated_price_per_kg = 0)");
  if (nullPrices[0].c > 0) { console.error("Validation failed: NULL or 0 prices found"); isValid = false; }
  
  // Val 3: Industrial untouched
  const [newInd] = await conn.query("SELECT p.id, ppa.calculated_price_per_kg FROM products p JOIN product_pricing_attributes ppa ON p.id = ppa.product_id WHERE p.category_id != 266");
  let indChanged = 0;
  newInd.forEach(r => {
    if (baseIndMap[r.id] !== parseFloat(r.calculated_price_per_kg)) indChanged++;
  });
  if (indChanged > 0) { console.error(`Validation failed: ${indChanged} industrial products changed!`); isValid = false; }

  if (!isValid) {
    console.error("VALIDATION FAILED. Rolling back...");
    await conn.query("DROP PROCEDURE IF EXISTS sp_recalculate_pricing");
    await conn.query(spV1);
    await conn.query("DELETE FROM pricing_rules WHERE rule_type='global' AND category_id=266");
    await conn.query("CALL sp_recalculate_pricing(null, 266, null, null, null, null, 'Rollback')");
    process.exit(1);
  }

  // 5. Reporting
  const [newCat266] = await conn.query("SELECT p.id, p.finish_surface, p.thickness, p.brand_origin, p.condition as form, ppa.calculated_price_per_kg FROM products p JOIN product_pricing_attributes ppa ON p.id = ppa.product_id WHERE p.category_id = 266");
  
  let changed266 = 0;
  let devList = [];
  let currentPrices = [];
  let newPrices = [];
  
  const ruleMapFast = {};
  rulesToInsert.forEach(r => ruleMapFast[r.rule_value] = r);

  newCat266.forEach(p => {
    const oldP = base266Map[p.id];
    const newP = parseFloat(p.calculated_price_per_kg);
    if (oldP !== newP) changed266++;
    
    currentPrices.push(oldP);
    newPrices.push(newP);
    
    // Deviation from target
    const r = ruleMapFast[`${p.finish_surface}_${parseFloat(p.thickness).toFixed(5)}`];
    let brandM = 1.0;
    if (p.brand_origin === "چاینا (چین)") brandM = 1.0010;
    if (p.brand_origin === "جندال هند") brandM = 1.0020;
    if (p.brand_origin === "پوسکو کره") brandM = 1.0030;
    let formM = p.form === "رول" ? 1.0005 : 1.0;
    
    const target = r.targetPrice * brandM * formM;
    const diff = ((newP - target)/target)*100;
    devList.push(diff);
  });
  
  currentPrices.sort((a,b)=>a-b);
  newPrices.sort((a,b)=>a-b);
  devList.sort((a,b)=>a-b);
  
  const avgBefore = currentPrices.reduce((a,b)=>a+b, 0) / currentPrices.length;
  const avgAfter = newPrices.reduce((a,b)=>a+b, 0) / newPrices.length;
  
  console.log("\\n=== SUCCESS: MIGRATION COMMITTED ===");
  console.log(`Rules Created: 44`);
  console.log(`Cat 266 Products Changed: ${changed266} / 1056`);
  console.log(`Industrial Products Changed: ${indChanged} / ${baselineInd.length}`);
  
  console.log("\\n--- BEFORE vs AFTER ---");
  console.log(`Avg Price/KG: ${avgBefore.toFixed(0)} -> ${avgAfter.toFixed(0)}`);
  console.log(`Median Price/KG: ${currentPrices[Math.floor(currentPrices.length/2)]} -> ${newPrices[Math.floor(newPrices.length/2)]}`);
  
  const avgDev = devList.reduce((a,b)=>a+b,0)/devList.length;
  console.log(`\\nAvg Deviation from Target (Market+3%): ${avgDev.toFixed(4)}%`);
  console.log(`Min Deviation: ${devList[0].toFixed(4)}% | Max Deviation: ${devList[devList.length-1].toFixed(4)}%`);
  
  console.log("\\n--- SAMPLE E2E (RANDOM) ---");
  for (let i=0; i<5; i++) {
    const p = newCat266[Math.floor(Math.random()*newCat266.length)];
    const oldP = base266Map[p.id];
    console.log(`ID ${p.id} | ${p.finish_surface.padEnd(15)} | Th: ${p.thickness} | Brand: ${p.brand_origin} | Before: ${oldP} -> After: ${p.calculated_price_per_kg}`);
  }

  process.exit(0);
}

main();
