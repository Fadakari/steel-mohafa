const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [procs] = await conn.query("SHOW PROCESSLIST");
  for (let p of procs) {
      if (p.Command === 'Sleep' && p.Time > 10) {
          console.log(`Killing process ${p.Id}`);
          try { await conn.query(`KILL ${p.Id}`); } catch(e){}
      }
  }
  process.exit(0);
}
main();
