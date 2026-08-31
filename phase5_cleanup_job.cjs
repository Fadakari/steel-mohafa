const mysql = require('mysql2/promise');

async function runCleanup() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    // 1. Rollback Test Data
    console.log('Rolling back test data (Truncating engine_price_history)...');
    await conn.execute('TRUNCATE TABLE engine_price_history');
    console.log('Rollback complete. Test records removed.');

    /* 
    // 2. Scheduled Cron Job (Example Implementation)
    // You would run this script daily via Linux Cron or a Node scheduler.
    // E.g. `0 3 * * * node /path/to/phase5_cleanup.cjs`
    
    console.log('Running 30-Day Cleanup Job...');
    
    const [result] = await conn.execute(`
        DELETE FROM engine_price_history 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    console.log(`Cleanup complete. Deleted ${result.affectedRows} records older than 30 days.`);
    */

  } catch (e) {
    console.error('Script failed:', e);
  } finally {
    await conn.end();
  }
}

runCleanup();
