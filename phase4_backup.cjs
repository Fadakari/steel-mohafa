const mysql = require('mysql2/promise');
const fs = require('fs');

async function backup() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    const backupData = {};
    
    console.log('Fetching product_alloy_mapping...');
    const [pam] = await conn.execute('SELECT * FROM product_alloy_mapping');
    backupData.product_alloy_mapping = pam;

    console.log('Fetching product_pricing_attributes...');
    const [ppa] = await conn.execute('SELECT * FROM product_pricing_attributes');
    backupData.product_pricing_attributes = ppa;

    console.log('Fetching pricing_dry_run_reports...');
    const [pdrr] = await conn.execute('SELECT * FROM pricing_dry_run_reports');
    backupData.pricing_dry_run_reports = pdrr;

    console.log('Writing to final_pricing_tables_backup.json...');
    fs.writeFileSync('final_pricing_tables_backup.json', JSON.stringify(backupData, null, 2));
    
    console.log('Backup successful!');
  } catch (e) {
    console.error('Backup failed:', e);
  } finally {
    await conn.end();
  }
}

backup();
