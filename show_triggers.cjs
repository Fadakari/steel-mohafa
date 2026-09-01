const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  const [t] = await conn.query("SHOW TRIGGERS");
  console.log(t.map(tr => ({Trigger: tr.Trigger, Event: tr.Event, Table: tr.Table, Statement: tr.Statement})));
  process.exit(0);
}
main();
