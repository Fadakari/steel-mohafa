const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  console.log("Dropping existing trigger if any...");
  await conn.query(`DROP TRIGGER IF EXISTS after_alloy_update;`);
  
  console.log("Creating new trigger...");
  await conn.query(`
    CREATE TRIGGER after_alloy_update
    AFTER UPDATE ON alloy
    FOR EACH ROW
    BEGIN
      -- Only run if basePrice actually changed
      IF NEW.basePrice <> OLD.basePrice THEN
      
        -- 1. Update product_pricing_attributes
        UPDATE product_pricing_attributes ppa
        JOIN product_alloy_mapping pam ON ppa.product_id = pam.product_id
        SET 
          ppa.calculated_price_per_kg = ROUND(NEW.basePrice * ppa.base_price_ratio),
          ppa.calculated_total_price_per_unit = IF(ppa.calculated_weight_kg IS NOT NULL, ROUND(NEW.basePrice * ppa.base_price_ratio) * ppa.calculated_weight_kg, NULL)
        WHERE pam.alloy_id = NEW.id AND ppa.base_price_ratio IS NOT NULL;
        
        -- 2. Insert into engine_price_history
        INSERT INTO engine_price_history 
          (product_id, new_price_per_kg, new_total_price, change_percentage, source, base_alloy_price_used)
        SELECT 
          pam.product_id,
          ROUND(NEW.basePrice * ppa.base_price_ratio),
          IF(ppa.calculated_weight_kg IS NOT NULL, ROUND(NEW.basePrice * ppa.base_price_ratio) * ppa.calculated_weight_kg, NULL),
          0,
          'mysql_trigger_auto',
          NEW.basePrice
        FROM product_alloy_mapping pam
        JOIN product_pricing_attributes ppa ON pam.product_id = ppa.product_id
        WHERE pam.alloy_id = NEW.id AND ppa.base_price_ratio IS NOT NULL;
        
        -- 3. Insert into price_history
        INSERT INTO price_history 
          (product_id, price, unit, is_call_for_price, date_created)
        SELECT 
          pam.product_id,
          ROUND(NEW.basePrice * ppa.base_price_ratio),
          'کیلوگرم',
          0,
          NOW()
        FROM product_alloy_mapping pam
        JOIN product_pricing_attributes ppa ON pam.product_id = ppa.product_id
        WHERE pam.alloy_id = NEW.id AND ppa.base_price_ratio IS NOT NULL;
        
      END IF;
    END;
  `);
  
  console.log("Trigger successfully created!");
  process.exit(0);
}
main().catch(console.error);
