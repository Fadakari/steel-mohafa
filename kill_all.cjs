const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  await conn.query("SET GLOBAL event_scheduler = OFF");
  console.log("Event Scheduler is OFF.");
  
  const [procs] = await conn.query("SHOW PROCESSLIST");
  for (let p of procs) {
      if (p.Id !== await conn.threadId) {
          console.log(`Killing process ${p.Id} - ${p.Command}`);
          try { await conn.query(`KILL ${p.Id}`); } catch(e){}
      }
  }
  process.exit(0);
}
main();
