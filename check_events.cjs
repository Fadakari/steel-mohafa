const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [res] = await conn.query("SHOW VARIABLES LIKE 'event_scheduler'");
  console.log('Event Scheduler Status:', res);
  process.exit(0);
}
main();
