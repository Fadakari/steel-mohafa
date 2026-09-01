const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  await conn.query("DROP TRIGGER IF EXISTS after_alloy_update");
  await conn.query(`
    CREATE TRIGGER after_alloy_update
    AFTER UPDATE ON alloy
    FOR EACH ROW
    BEGIN
        IF NEW.basePrice <> OLD.basePrice THEN
            INSERT INTO pricing_recalc_queue (rule_type, rule_value, alloy_id) VALUES ('alloy', NEW.id, NEW.id);
        END IF;
    END;
  `);

  // Update Event Scheduler to handle 'alloy' rule type
  await conn.query("DROP EVENT IF EXISTS process_pricing_queue");
  await conn.query(`
    CREATE EVENT process_pricing_queue
    ON SCHEDULE EVERY 1 SECOND
    DO
    BEGIN
      DECLARE v_id INT;
      DECLARE v_type VARCHAR(50);
      DECLARE v_val VARCHAR(255);
      DECLARE v_alloy INT;
      DECLARE v_cat INT;
      
      DECLARE done INT DEFAULT FALSE;
      DECLARE cur CURSOR FOR SELECT id, rule_type, rule_value, alloy_id, category_id FROM pricing_recalc_queue WHERE status = 'pending';
      DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
      
      OPEN cur;
      read_loop: LOOP
        FETCH cur INTO v_id, v_type, v_val, v_alloy, v_cat;
        IF done THEN
          LEAVE read_loop;
        END IF;
        
        START TRANSACTION;
        
        SET @b=NULL, @f=NULL, @fin=NULL, @th=NULL;
        
        IF v_type = 'brand_origin' THEN SET @b = v_val; END IF;
        IF v_type = 'product_type' THEN SET @f = v_val; END IF;
        IF v_type = 'finish_surface' THEN SET @fin = v_val; END IF;
        IF v_type = 'thickness' THEN SET @th = v_val; END IF;
        
        -- If it's an alloy update, we just pass v_alloy which is already set, and 'mysql_alloy_update'
        IF v_type = 'alloy' THEN
            CALL sp_recalculate_pricing(v_alloy, NULL, NULL, NULL, NULL, NULL, 'mysql_alloy_update');
        ELSE
            CALL sp_recalculate_pricing(v_alloy, v_cat, @b, @f, @fin, @th, 'mysql_rule_update');
        END IF;
        
        DELETE FROM pricing_recalc_queue WHERE id = v_id;
        COMMIT;
      END LOOP;
      CLOSE cur;
    END;
  `);
  
  console.log("Alloy Trigger now uses the Queue to prevent deadlocks!");
  process.exit(0);
}
main();
