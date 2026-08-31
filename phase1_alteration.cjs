const mysql = require('mysql2/promise');

async function runPhase1() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- EXECUTING PHASE 1: PRICE UNIT LOGIC FIX ---');
    
    // Clear the pilot data to apply fresh schema changes cleanly
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    await conn.execute('TRUNCATE TABLE `pricing_dry_run_reports`');
    await conn.execute('TRUNCATE TABLE `product_pricing_attributes`');
    await conn.execute('TRUNCATE TABLE `product_alloy_mapping`');
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Pilot data cleared.');

    // Alter product_pricing_attributes
    const alterPpa = `
      ALTER TABLE \`product_pricing_attributes\`
      CHANGE COLUMN \`calculated_price_per_unit\` \`calculated_price_per_kg\` DECIMAL(15, 2) DEFAULT NULL,
      ADD COLUMN \`calculated_total_price_per_unit\` DECIMAL(15, 2) DEFAULT NULL AFTER \`calculated_price_per_kg\`
    `;
    await conn.execute(alterPpa);
    console.log('product_pricing_attributes altered successfully.');

    // Alter pricing_dry_run_reports
    const alterDryRun = `
      ALTER TABLE \`pricing_dry_run_reports\`
      CHANGE COLUMN \`calculated_new_price\` \`calculated_new_price_per_kg\` DECIMAL(15, 2) NOT NULL
    `;
    await conn.execute(alterDryRun);
    console.log('pricing_dry_run_reports altered successfully.');

    // Verify structures
    const [descPpa] = await conn.execute('SHOW CREATE TABLE `product_pricing_attributes`');
    console.log('\\n--- VERIFIED product_pricing_attributes ---');
    console.log(descPpa[0]['Create Table']);

    const [descDryRun] = await conn.execute('SHOW CREATE TABLE `pricing_dry_run_reports`');
    console.log('\\n--- VERIFIED pricing_dry_run_reports ---');
    console.log(descDryRun[0]['Create Table']);

  } catch (e) {
    console.error('Phase 1 failed:', e);
  } finally {
    await conn.end();
  }
}

runPhase1();
