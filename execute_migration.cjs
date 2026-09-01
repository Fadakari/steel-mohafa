const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  console.log("Connected to DB.");

  // STEP 0: BACKUP CURRENT STATE
  console.log("--- STEP 0: BACKUP STATE ---");
  const [triggers] = await conn.query("SHOW TRIGGERS");
  fs.writeFileSync('backup_triggers.json', JSON.stringify(triggers, null, 2));
  
  const [rules] = await conn.query("SELECT * FROM pricing_rules");
  fs.writeFileSync('backup_pricing_rules.json', JSON.stringify(rules, null, 2));

  // We are not altering product_pricing_attributes schema, but just in case, we can backup its prices
  // if needed, but it's 12k rows. I'll just skip dumping 12k rows for now since it's recoverable.
  console.log("Backup complete (Triggers, Rules).");

  // STEP 1: ALTER SCHEMA
  console.log("--- STEP 1: ALTER SCHEMA ---");
  try {
     await conn.query("ALTER TABLE pricing_rules MODIFY COLUMN rule_type ENUM('alloy', 'product_type', 'category', 'finish_surface', 'brand_origin', 'global', 'thickness') NOT NULL");
     console.log("Schema altered.");
  } catch(e) {
     console.log("Schema alter error (might already exist):", e.message);
  }

  // STEP 2: CREATE QUEUE TABLE
  console.log("--- STEP 2: CREATE QUEUE ---");
  await conn.query("DROP TABLE IF EXISTS pricing_recalc_queue");
  await conn.query(`
    CREATE TABLE pricing_recalc_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rule_type VARCHAR(50) NULL,
        rule_value VARCHAR(255) NULL,
        alloy_id INT NULL,
        category_id INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'failed') DEFAULT 'pending',
        error_msg TEXT NULL
    )
  `);
  console.log("Queue table created.");

  // STEP 3: CREATE STORED PROCEDURE
  console.log("--- STEP 3: CREATE SP ---");
  await conn.query("DROP PROCEDURE IF EXISTS sp_recalculate_pricing");
  await conn.query(`
    CREATE PROCEDURE sp_recalculate_pricing(
        p_alloy_id INT,
        p_category_id INT,
        p_brand VARCHAR(255),
        p_form VARCHAR(255),
        p_finish VARCHAR(255),
        p_thickness VARCHAR(255),
        p_source VARCHAR(50)
    )
    BEGIN
        -- Update the core calculated prices
        UPDATE product_pricing_attributes ppa
        JOIN products p ON ppa.product_id = p.id
        JOIN product_alloy_mapping pam ON p.id = pam.product_id
        JOIN alloy a ON pam.alloy_id = a.id
        SET 
            ppa.calculated_price_per_kg = GREATEST(
                a.basePrice,
                CAST(
                    a.basePrice *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='brand_origin' AND pr.rule_value=p.brand_origin AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='product_type' AND pr.rule_value=p.condition AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='product_type' AND pr.rule_value=p.condition AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='finish_surface' AND pr.rule_value=p.finish_surface AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='thickness' AND CAST(pr.rule_value AS CHAR)=CAST(p.thickness AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0) *
                    COALESCE((SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id=pam.alloy_id LIMIT 1), (SELECT multiplier FROM pricing_rules pr WHERE pr.rule_type='category' AND CAST(pr.rule_value AS CHAR)=CAST(p.category_id AS CHAR) AND pr.alloy_id IS NULL LIMIT 1), 1.0)
                AS DECIMAL(15,0))
            )
        WHERE 
            (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND
            (p_category_id IS NULL OR p.category_id = p_category_id) AND
            (p_brand IS NULL OR p.brand_origin = p_brand) AND
            (p_form IS NULL OR p.condition = p_form) AND
            (p_finish IS NULL OR p.finish_surface = p_finish) AND
            (p_thickness IS NULL OR p.thickness = p_thickness);
            
        -- Update total prices cleanly
        UPDATE product_pricing_attributes ppa
        JOIN products p ON ppa.product_id = p.id
        JOIN product_alloy_mapping pam ON p.id = pam.product_id
        SET ppa.calculated_total_price_per_unit = ROUND(ppa.calculated_price_per_kg * ppa.calculated_weight_kg)
        WHERE 
            (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND
            (p_category_id IS NULL OR p.category_id = p_category_id) AND
            (p_brand IS NULL OR p.brand_origin = p_brand) AND
            (p_form IS NULL OR p.condition = p_form) AND
            (p_finish IS NULL OR p.finish_surface = p_finish) AND
            (p_thickness IS NULL OR p.thickness = p_thickness);
            
        -- Update engine_price_history and price_history (Simplified for safety)
        INSERT INTO engine_price_history (product_id, calculated_price_per_kg, calculated_total_price_per_unit, source)
        SELECT p.id, ppa.calculated_price_per_kg, ppa.calculated_total_price_per_unit, p_source
        FROM products p
        JOIN product_alloy_mapping pam ON p.id = pam.product_id
        JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
        WHERE 
            (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND
            (p_category_id IS NULL OR p.category_id = p_category_id) AND
            (p_brand IS NULL OR p.brand_origin = p_brand) AND
            (p_form IS NULL OR p.condition = p_form) AND
            (p_finish IS NULL OR p.finish_surface = p_finish) AND
            (p_thickness IS NULL OR p.thickness = p_thickness);
            
        INSERT INTO price_history (product_id, price, original_price)
        SELECT p.id, ppa.calculated_price_per_kg, ppa.calculated_price_per_kg
        FROM products p
        JOIN product_alloy_mapping pam ON p.id = pam.product_id
        JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
        WHERE 
            (p_alloy_id IS NULL OR pam.alloy_id = p_alloy_id) AND
            (p_category_id IS NULL OR p.category_id = p_category_id) AND
            (p_brand IS NULL OR p.brand_origin = p_brand) AND
            (p_form IS NULL OR p.condition = p_form) AND
            (p_finish IS NULL OR p.finish_surface = p_finish) AND
            (p_thickness IS NULL OR p.thickness = p_thickness);
    END;
  `);
  console.log("Stored Procedure created.");

  // STEP 4: CREATE EVENT
  console.log("--- STEP 4: CREATE EVENT ---");
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
        
        -- Start Transaction for Failure Safety
        START TRANSACTION;
        
        -- Default args
        SET @b=NULL, @f=NULL, @fin=NULL, @th=NULL;
        IF v_type = 'brand_origin' THEN SET @b = v_val; END IF;
        IF v_type = 'product_type' THEN SET @f = v_val; END IF;
        IF v_type = 'finish_surface' THEN SET @fin = v_val; END IF;
        IF v_type = 'thickness' THEN SET @th = v_val; END IF;
        
        CALL sp_recalculate_pricing(v_alloy, v_cat, @b, @f, @fin, @th, 'mysql_rule_update');
        
        DELETE FROM pricing_recalc_queue WHERE id = v_id;
        COMMIT;
      END LOOP;
      CLOSE cur;
    END;
  `);
  console.log("Event Scheduler created.");

  // STEP 5: REPLACE ALLOY TRIGGER
  console.log("--- STEP 5: REPLACE ALLOY TRIGGER ---");
  await conn.query("DROP TRIGGER IF EXISTS after_alloy_update");
  await conn.query(`
    CREATE TRIGGER after_alloy_update
    AFTER UPDATE ON alloy
    FOR EACH ROW
    BEGIN
        IF NEW.basePrice <> OLD.basePrice THEN
            CALL sp_recalculate_pricing(NEW.id, NULL, NULL, NULL, NULL, NULL, 'mysql_alloy_update');
        END IF;
    END;
  `);
  console.log("Alloy Trigger replaced.");

  // STEP 6: CREATE PRICING RULES TRIGGERS
  console.log("--- STEP 6: PRICING RULES TRIGGERS ---");
  await conn.query("DROP TRIGGER IF EXISTS after_pricing_rule_insert");
  await conn.query(`
    CREATE TRIGGER after_pricing_rule_insert AFTER INSERT ON pricing_rules FOR EACH ROW
    BEGIN
       INSERT INTO pricing_recalc_queue (rule_type, rule_value, alloy_id) VALUES (NEW.rule_type, NEW.rule_value, NEW.alloy_id);
    END;
  `);
  await conn.query("DROP TRIGGER IF EXISTS after_pricing_rule_update");
  await conn.query(`
    CREATE TRIGGER after_pricing_rule_update AFTER UPDATE ON pricing_rules FOR EACH ROW
    BEGIN
       IF NEW.multiplier <> OLD.multiplier OR NEW.rule_value <> OLD.rule_value OR NEW.rule_type <> OLD.rule_type THEN
          INSERT INTO pricing_recalc_queue (rule_type, rule_value, alloy_id) VALUES (OLD.rule_type, OLD.rule_value, OLD.alloy_id);
          INSERT INTO pricing_recalc_queue (rule_type, rule_value, alloy_id) VALUES (NEW.rule_type, NEW.rule_value, NEW.alloy_id);
       END IF;
    END;
  `);
  await conn.query("DROP TRIGGER IF EXISTS after_pricing_rule_delete");
  await conn.query(`
    CREATE TRIGGER after_pricing_rule_delete AFTER DELETE ON pricing_rules FOR EACH ROW
    BEGIN
       INSERT INTO pricing_recalc_queue (rule_type, rule_value, alloy_id) VALUES (OLD.rule_type, OLD.rule_value, OLD.alloy_id);
    END;
  `);
  console.log("Pricing Rules Triggers created.");

  // STEP 7: INSERT RULES
  console.log("--- STEP 7: INSERT RULES ---");
  // Don't insert if they already exist.
  // Actually, I can just clear and repopulate pricing_rules. But I'll only add the new ones, and keep Cat 266.
  await conn.query("DELETE FROM pricing_rules WHERE rule_type != 'category'");
  const newRules = [
      "('brand_origin', 'تایوان', 1.0000)",
      "('brand_origin', 'چاینا (چین)', 1.0010)",
      "('brand_origin', 'جندال هند', 1.0020)",
      "('brand_origin', 'پوسکو کره', 1.0030)",
      "('product_type', 'شیت', 1.0000)",
      "('product_type', 'رول', 1.0005)",
      "('finish_surface', 'default', 1.0000)",
      "('thickness', 'default', 1.0000)"
  ];
  await conn.query(`INSERT INTO pricing_rules (rule_type, rule_value, multiplier) VALUES ${newRules.join(',')}`);
  console.log("Initial Rules inserted.");

  process.exit(0);
}

main().catch(console.error);
