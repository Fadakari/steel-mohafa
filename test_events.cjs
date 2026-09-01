const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  await conn.query('DROP TABLE IF EXISTS test_queue');
  await conn.query('CREATE TABLE test_queue (id INT AUTO_INCREMENT PRIMARY KEY, msg VARCHAR(255))');
  await conn.query('DROP TABLE IF EXISTS test_result');
  await conn.query('CREATE TABLE test_result (id INT AUTO_INCREMENT PRIMARY KEY, msg VARCHAR(255))');
  
  await conn.query('DROP EVENT IF EXISTS test_event');
  await conn.query(`
    CREATE EVENT test_event
    ON SCHEDULE EVERY 1 SECOND
    DO
    BEGIN
      DECLARE v_id INT;
      DECLARE v_msg VARCHAR(255);
      DECLARE done INT DEFAULT FALSE;
      DECLARE cur CURSOR FOR SELECT id, msg FROM test_queue;
      DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
      
      OPEN cur;
      read_loop: LOOP
        FETCH cur INTO v_id, v_msg;
        IF done THEN
          LEAVE read_loop;
        END IF;
        
        INSERT INTO test_result (msg) VALUES (v_msg);
        DELETE FROM test_queue WHERE id = v_id;
      END LOOP;
      CLOSE cur;
    END;
  `);
  
  await conn.query("INSERT INTO test_queue (msg) VALUES ('Hello from Event!')");
  
  console.log("Waiting 3 seconds...");
  await new Promise(r => setTimeout(r, 3000));
  
  const [res] = await conn.query('SELECT * FROM test_result');
  console.log("Results from event:", res);
  
  await conn.query('DROP EVENT IF EXISTS test_event');
  await conn.query('DROP TABLE IF EXISTS test_queue');
  await conn.query('DROP TABLE IF EXISTS test_result');
  process.exit(0);
}
main();
