const mysql = require('mysql2/promise');

async function runAuditSkipped() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- AUDIT: MANUAL_PRICE & FIXED_WEIGHT ---\\n');

    const [rows] = await conn.execute(`
      SELECT 
        pa.product_id, 
        c.title as category, 
        p.dimensions, 
        p.thickness, 
        p.outer_diameter, 
        pa.pricing_strategy, 
        pa.product_type
      FROM product_pricing_attributes pa
      JOIN products p ON pa.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE pa.pricing_strategy IN ('MANUAL_PRICE', 'FIXED_WEIGHT')
    `);

    const summary = {
      MANUAL_PRICE: {
        total: 0,
        byCategory: {},
        samples: [],
        rootCause: 'Missing Alloy (Could not infer alloy from Category Name)'
      },
      FIXED_WEIGHT: {
        total: 0,
        byCategory: {},
        samples: [],
        rootCause: 'Missing Geometric Formula (Type is not Sheet, Pipe, Bar, or Profile)'
      }
    };

    for (const row of rows) {
      const strategy = row.pricing_strategy;
      const cat = row.category || 'Unknown Category';
      
      summary[strategy].total++;
      
      if (!summary[strategy].byCategory[cat]) {
        summary[strategy].byCategory[cat] = 0;
      }
      summary[strategy].byCategory[cat]++;

      if (summary[strategy].samples.length < 20) {
        summary[strategy].samples.push({
          id: row.product_id,
          category: cat,
          dim: row.dimensions,
          thk: row.thickness,
          od: row.outer_diameter,
          type: row.product_type
        });
      }
    }

    console.log(`Total MANUAL_PRICE: ${summary.MANUAL_PRICE.total}`);
    console.log(`Root Cause: ${summary.MANUAL_PRICE.rootCause}`);
    console.log('Breakdown by Category:');
    const sortedManual = Object.entries(summary.MANUAL_PRICE.byCategory).sort((a,b) => b[1]-a[1]);
    sortedManual.forEach(([cat, count]) => console.log(`  - ${cat}: ${count}`));
    console.log('\\n20 Samples (MANUAL_PRICE):');
    console.table(summary.MANUAL_PRICE.samples);
    
    console.log('\\n--------------------------------------------------\\n');

    console.log(`Total FIXED_WEIGHT: ${summary.FIXED_WEIGHT.total}`);
    console.log(`Root Cause: ${summary.FIXED_WEIGHT.rootCause}`);
    console.log('Breakdown by Category:');
    const sortedFixed = Object.entries(summary.FIXED_WEIGHT.byCategory).sort((a,b) => b[1]-a[1]);
    sortedFixed.forEach(([cat, count]) => console.log(`  - ${cat}: ${count}`));
    console.log('\\n20 Samples (FIXED_WEIGHT):');
    console.table(summary.FIXED_WEIGHT.samples);

    // Provide recommendation logic based on categories
    console.log('\\n--- RECOMMENDATIONS ---');
    console.log('1. For "اتصالات" (Fittings) and "فلنج" (Flanges): Formulas cannot be used. We must populate the `fixed_weight_kg` column manually or via a lookup table mapping size to standard weight. Highly automatable via an external weight CSV mapping.');
    console.log('2. For "چهارپهلو و ششپهلو" (Square & Hex Bars): We can add a formula for them. Square Bar = (W^2)*L*rho. Hex Bar = (0.866 * W^2) * L * rho. If we parse the width from dimension, this is 100% automatable.');
    console.log('3. For "نبشی و ناودانی" (Angles/Channels): We can add angle formulas (e.g., L = 2*W*T*rho). This is highly automatable.');
    console.log('4. For products missing alloys in their category title (e.g. "شیرآلات"): We can map the specific subcategory to an alloy via `pricing_rules` instead of requiring the alloy name in the category string.');

  } catch (e) {
    console.error('Audit failed:', e);
  } finally {
    await conn.end();
  }
}

runAuditSkipped();
