const mysql = require('mysql2/promise');

async function runCategoryProposal() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    const [rows] = await conn.execute(`
      SELECT c.title, COUNT(p.id) as total_products
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      GROUP BY c.title
    `);

    const missingAlloyCats = [];

    for (const r of rows) {
      const match = r.title.match(/304|316|321|310|309|430|420|410|201/);
      if (!match) {
        missingAlloyCats.push(r);
      }
    }

    // Sort by count desc
    missingAlloyCats.sort((a,b) => b.total_products - a.total_products);

    console.log('--- CATEGORY ALLOY PROPOSAL ---');
    console.table(missingAlloyCats);

  } catch (e) {
    console.error(e);
  } finally {
    await conn.end();
  }
}

runCategoryProposal();
