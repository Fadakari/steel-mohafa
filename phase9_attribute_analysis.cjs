const mysql = require('mysql2/promise');

async function analyzeAttributes() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 9: Pricing Attribute Analysis ---\\n');

    // Fetch all products with their latest market price and current engine price parts
    const [products] = await conn.execute(`
      SELECT 
        p.id as product_id,
        c.title as category,
        ppa.product_type,
        ppa.calculated_weight_kg as weight,
        pam.alloy_id,
        al.name as alloy,
        al.basePrice as alloy_base_price,
        (SELECT price FROM price_history ph WHERE ph.product_id = p.id ORDER BY id DESC LIMIT 1) as market_price,
        (SELECT unit FROM price_history ph WHERE ph.product_id = p.id ORDER BY id DESC LIMIT 1) as market_unit,
        p.finish_surface,
        p.condition as prod_condition,
        p.brand_origin
      FROM products p
      JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
      JOIN product_alloy_mapping pam ON p.id = pam.product_id
      JOIN alloy al ON pam.alloy_id = al.id
      JOIN categories c ON p.category_id = c.id
      WHERE ppa.pricing_strategy = 'FORMULA_WEIGHT'
    `);

    // We will analyze differences per attribute.
    // Base Price = alloy_base_price
    // Diff = market_price_per_kg - alloy_base_price
    // We group these diffs by attributes to find "rules".

    const stats = {};

    const addStat = (attrName, attrValue, diff) => {
        if(!attrValue || attrValue === 'null') return;
        attrValue = String(attrValue).replace(/"/g, '').trim();
        const key = `${attrName}::${attrValue}`;
        if (!stats[key]) stats[key] = [];
        stats[key].push(diff);
    };

    products.forEach(p => {
        if (!p.market_price) return;
        let marketPricePerKg = p.market_price;
        if (p.market_unit !== 'کیلوگرم' && p.weight && p.weight > 0) {
            marketPricePerKg = p.market_price / p.weight;
        }
        const diff = marketPricePerKg - p.alloy_base_price;

        addStat('Category', p.category, diff);
        addStat('Finish', p.finish_surface, diff);
        addStat('Condition', p.prod_condition, diff);
        addStat('Brand/Origin', p.brand_origin, diff);
    });

    console.log('Found statistical rules based on Market vs Base Alloy differences:\\n');

    const rules = [];

    for (const [key, diffs] of Object.entries(stats)) {
        if (diffs.length < 5) continue; // Need at least 5 samples

        diffs.sort((a, b) => a - b);
        const mid = Math.floor(diffs.length / 2);
        const median = diffs.length % 2 !== 0 ? diffs[mid] : (diffs[mid - 1] + diffs[mid]) / 2;
        
        const mean = diffs.reduce((a,b) => a+b, 0) / diffs.length;
        const variance = diffs.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / diffs.length;
        const sd = Math.sqrt(variance);

        // Confidence approximation (lower SD means higher confidence)
        // If SD is less than 5000 Toman, it's very confident (95%+)
        let confidence = Math.max(0, 100 - (sd / 1000));
        confidence = Math.min(99, confidence);

        const [attr, val] = key.split('::');

        rules.push({
            attribute: attr,
            value: val,
            average_difference: Math.round(mean),
            median_difference: Math.round(median),
            confidence: confidence.toFixed(1) + '%',
            samples: diffs.length
        });
    }

    rules.sort((a, b) => parseFloat(b.confidence) - parseFloat(a.confidence));
    console.table(rules);

    console.log('\\n--- Step 6: Final Test (Preview only) ---');
    
    // Simulate Final Calculation for a few requested types
    // 304 Sheet Taiwan 2B
    // 304 Sheet China 2B
    // 316 Sheet
    // 304 Decorative

    const testScenarios = [
      { name: '304 Sheet Taiwan 2B', alloy: 219000, rules: [rules.find(r=>r.value==='Taiwan'), rules.find(r=>r.value==='2B')] },
      { name: '304 Sheet China 2B', alloy: 219000, rules: [rules.find(r=>r.value==='China'), rules.find(r=>r.value==='2B')] },
      { name: '316 Sheet', alloy: 309000, rules: [rules.find(r=>r.value==='ورق استیل')] },
      { name: '304 Decorative', alloy: 219000, rules: [rules.find(r=>r.value==='ورق استیل دکوراتیو')] }
    ];

    testScenarios.forEach(sc => {
       console.log(`\nTesting: ${sc.name}`);
       console.log(`- Base Alloy Price: ${sc.alloy}`);
       let finalAdjustment = 0;
       sc.rules.forEach(r => {
           if(r) {
               console.log(`  + Rule Applied: [${r.attribute}] ${r.value} -> Adjustment: ${r.median_difference} Toman (Conf: ${r.confidence})`);
               finalAdjustment += r.median_difference; // Additive adjustment model
           }
       });
       console.log(`=> Calculated Final Price/kg: ${sc.alloy + finalAdjustment}`);
    });

  } catch (e) {
    console.error('Error during analysis:', e);
  } finally {
    await conn.end();
  }
}

analyzeAttributes();
