const mysql = require('mysql2/promise');
async function runAudit() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });
  try {
    const [p] = await conn.execute('SHOW CREATE TABLE products');
    console.log('--- products ---');
    console.log(p[0]['Create Table']);
    const [c] = await conn.execute('SHOW CREATE TABLE categories');
    console.log('--- categories ---');
    console.log(c[0]['Create Table']);
    const [a] = await conn.execute('SHOW CREATE TABLE alloy');
    console.log('--- alloy ---');
    console.log(a[0]['Create Table']);

    const tablesToInspect = ['price_history', 'pricehistory', 'pricinggroup', 'coefficient', 'product'];
    for(const t of tablesToInspect) {
      try {
        const [desc] = await conn.execute(`DESCRIBE ${t}`);
        console.log(`\n--- TABLE ${t} ---`);
        console.log(desc.map(col => `${col.Field} (${col.Type})`).join(', '));
      } catch (e) {
        console.log(`Table ${t} could not be described: ${e.message}`);
      }
    }
  } catch (e) { console.error(e); } finally { await conn.end(); }
}
runAudit();
