const mysql = require('mysql2/promise');

async function testSource() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- TEST: AUDIT TRAIL FOR ALLOY SOURCE ---\\n');

    const [dbAlloys] = await conn.execute('SELECT id, name, density, basePrice FROM alloy');
    const alloyMap = {};
    dbAlloys.forEach(a => alloyMap[a.name] = a);

    const categoryAlloyRules = {
      'ورق استیل دکوراتیو': '304',
      'پروفیل استیل دکوراتیو (ظاهری)': '304',
      'لوله صنایع غذایی (Food Grade)': '304',
      'چهارپهلو و ششپهلو': '304',
      'اتصالات جوشی (Welded)': '304',
      'فلنج استیل (Flanges)': '304',
      'سیم جوش و الکترود': '304',
      'شیرآلات صنعتی': '316',
      'شیرآلات صنایع غذایی': '304',
      'اتصالات دنده ای (Threaded)': '304',
      'اتصالات صنایع غذایی (Food Grade)': '304'
    };

    const [skippedProducts] = await conn.execute(`
      SELECT p.*, c.title as category, pa.pricing_strategy as old_strategy
      FROM product_pricing_attributes pa
      JOIN products p ON pa.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE pa.pricing_strategy IN ('MANUAL_PRICE', 'FIXED_WEIGHT')
      LIMIT 10
    `);

    const results = [];

    for (const p of skippedProducts) {
      const catTitle = p.category || '';
      
      let matchedAlloyObj = null;
      let mappingSource = null;
      let mappingConfidence = null;

      const alloyMatch = catTitle.match(/304|316|321|310|309|430|420|410|201/);
      if (alloyMatch && alloyMap[alloyMatch[0]]) {
        matchedAlloyObj = alloyMap[alloyMatch[0]];
        mappingSource = 'category_regex_match'; // Clarify source for regex
        mappingConfidence = 80.0;
      } else if (categoryAlloyRules[catTitle] && alloyMap[categoryAlloyRules[catTitle]]) {
        matchedAlloyObj = alloyMap[categoryAlloyRules[catTitle]];
        mappingSource = 'category_inheritance'; // As requested
        mappingConfidence = 90.0;
      }

      if (matchedAlloyObj) {
        results.push({
            id: p.id,
            category: catTitle,
            assigned_alloy: matchedAlloyObj.name,
            source: mappingSource,
            confidence: mappingConfidence
        });
      }
    }

    console.table(results);

  } catch (e) {
    console.error(e);
  } finally {
    await conn.end();
  }
}

testSource();
