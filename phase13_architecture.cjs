const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  console.log("1. Checking Schema and Preparing pricing_rules...");
  await conn.query(`
    ALTER TABLE pricing_rules 
    MODIFY COLUMN rule_type ENUM('alloy','product_type','category','finish_surface','brand_origin','global','thickness') NOT NULL
  `);

  console.log("2. Cleaning up old non-decorative rules (if any)...");
  await conn.query(`DELETE FROM pricing_rules WHERE rule_type != 'category'`);
  
  console.log("3. Inserting Initial Baseline Rules...");
  const newRules = [
    // Brands
    `('brand_origin', 'تایوان', 1.0000, 1)`,
    `('brand_origin', 'چاینا (چین)', 1.0020, 1)`,
    `('brand_origin', 'جندال هند', 1.0040, 1)`,
    `('brand_origin', 'پوسکو کره', 1.0060, 1)`,
    // Forms
    `('product_type', 'شیت', 1.0000, 1)`,
    `('product_type', 'رول', 1.0015, 1)`,
    // Base Finish
    `('finish_surface', 'مات 2B', 1.0000, 1)`
  ];
  await conn.query(`INSERT INTO pricing_rules (rule_type, rule_value, multiplier, priority) VALUES ${newRules.join(', ')}`);

  console.log("4. Dropping and Recreating Database Trigger...");
  await conn.query(`DROP TRIGGER IF EXISTS after_alloy_update`);
  
  const triggerSQL = `
    CREATE TRIGGER after_alloy_update
    AFTER UPDATE ON alloy
    FOR EACH ROW
    BEGIN
      IF NEW.basePrice <> OLD.basePrice THEN
      
        -- Step 1: Calculate new price per kg using Dynamic Rules & Floor Price (BasePrice)
        UPDATE product_pricing_attributes ppa
        JOIN products p ON ppa.product_id = p.id
        JOIN product_alloy_mapping pam ON p.id = pam.product_id
        SET ppa.calculated_price_per_kg = 
            GREATEST(
                CAST(NEW.basePrice AS DECIMAL(15,2)), 
                ROUND(
                    CAST(NEW.basePrice AS DECIMAL(15,2))
                    * COALESCE((SELECT multiplier FROM pricing_rules WHERE rule_type = 'category' AND category_id = p.category_id AND alloy_id = NEW.id LIMIT 1), (SELECT multiplier FROM pricing_rules WHERE rule_type = 'category' AND category_id = p.category_id AND alloy_id IS NULL LIMIT 1), 1.0000)
                    * COALESCE((SELECT multiplier FROM pricing_rules WHERE rule_type = 'brand_origin' AND rule_value = p.brand_origin AND alloy_id = NEW.id LIMIT 1), (SELECT multiplier FROM pricing_rules WHERE rule_type = 'brand_origin' AND rule_value = p.brand_origin AND alloy_id IS NULL LIMIT 1), 1.0000)
                    * COALESCE((SELECT multiplier FROM pricing_rules WHERE rule_type = 'product_type' AND rule_value = p.condition AND alloy_id = NEW.id LIMIT 1), (SELECT multiplier FROM pricing_rules WHERE rule_type = 'product_type' AND rule_value = p.condition AND alloy_id IS NULL LIMIT 1), 1.0000)
                    * COALESCE((SELECT multiplier FROM pricing_rules WHERE rule_type = 'finish_surface' AND rule_value = p.finish_surface AND alloy_id = NEW.id LIMIT 1), (SELECT multiplier FROM pricing_rules WHERE rule_type = 'finish_surface' AND rule_value = p.finish_surface AND alloy_id IS NULL LIMIT 1), 1.0000)
                    * COALESCE((SELECT multiplier FROM pricing_rules WHERE rule_type = 'thickness' AND rule_value = CAST(p.thickness AS CHAR) AND alloy_id = NEW.id LIMIT 1), (SELECT multiplier FROM pricing_rules WHERE rule_type = 'thickness' AND rule_value = CAST(p.thickness AS CHAR) AND alloy_id IS NULL LIMIT 1), 1.0000)
                )
            )
        WHERE pam.alloy_id = NEW.id;
        
        -- Step 2: Calculate total unit price based on the exact per-kg price
        UPDATE product_pricing_attributes ppa
        JOIN product_alloy_mapping pam ON ppa.product_id = pam.product_id
        SET ppa.calculated_total_price_per_unit = ROUND(ppa.calculated_price_per_kg * ppa.calculated_weight_kg)
        WHERE pam.alloy_id = NEW.id AND ppa.calculated_weight_kg IS NOT NULL;
        
        -- Step 3: Insert into engine history
        INSERT INTO engine_price_history (product_id, new_price_per_kg, new_total_price, change_percentage, source, base_alloy_price_used)
        SELECT pam.product_id, ppa.calculated_price_per_kg, ppa.calculated_total_price_per_unit, 0, 'mysql_trigger_rules', CAST(NEW.basePrice AS DECIMAL(15,2))
        FROM product_alloy_mapping pam
        JOIN product_pricing_attributes ppa ON pam.product_id = ppa.product_id
        WHERE pam.alloy_id = NEW.id;
        
        -- Step 4: Insert into public price history
        INSERT INTO price_history (product_id, price, unit, is_call_for_price, date_created)
        SELECT pam.product_id, ppa.calculated_price_per_kg, 'کیلوگرم', 0, NOW()
        FROM product_alloy_mapping pam
        JOIN product_pricing_attributes ppa ON pam.product_id = ppa.product_id
        WHERE pam.alloy_id = NEW.id;
        
      END IF;
    END;
  `;
  await conn.query(triggerSQL);

  console.log("5. Saving Baseline and Running Tests...");
  const [baseRows] = await conn.query("SELECT basePrice FROM alloy WHERE id = 1");
  const originalBase = baseRows[0].basePrice;
  
  async function testVariantPrices(basePrice) {
    await conn.query("UPDATE alloy SET basePrice = ? WHERE id = 1", [basePrice]);
    const [variants] = await conn.query(`
      SELECT p.id, p.thickness, p.dimensions, p.finish_surface, p.condition, p.brand_origin, ppa.calculated_price_per_kg 
      FROM products p 
      JOIN product_pricing_attributes ppa ON p.id = ppa.product_id 
      JOIN product_alloy_mapping pam ON p.id = pam.product_id 
      WHERE pam.alloy_id = 1 AND p.thickness = 0.5 AND p.dimensions LIKE '%1500x6000%' AND p.finish_surface = 'مات 2B'
      ORDER BY p.brand_origin, p.condition
    `);
    
    // Also grab one thickness = 1.0 to prove it works globally
    const [t1] = await conn.query(`
      SELECT p.id, p.thickness, p.dimensions, p.finish_surface, p.condition, p.brand_origin, ppa.calculated_price_per_kg 
      FROM products p 
      JOIN product_pricing_attributes ppa ON p.id = ppa.product_id 
      JOIN product_alloy_mapping pam ON p.id = pam.product_id 
      WHERE pam.alloy_id = 1 AND p.thickness = 1 AND p.dimensions LIKE '%1500x6000%' AND p.brand_origin = 'تایوان' AND p.condition = 'شیت'
      LIMIT 1
    `);
    
    console.table([...variants, ...t1].map(v => ({
      Thickness: v.thickness,
      Form: v.condition,
      Brand: v.brand_origin,
      CalculatedPrice: v.calculated_price_per_kg,
      BelowBase: parseFloat(v.calculated_price_per_kg) < basePrice ? 'YES' : 'NO'
    })));
  }

  console.log(`\\n--- PREVIEW: BASE PRICE = 668,000 ---`);
  await testVariantPrices(668000);
  
  console.log(`\\n--- PREVIEW: BASE PRICE = 669,000 ---`);
  await testVariantPrices(669000);

  console.log("\\n6. Restoring original Baseline...");
  await conn.query("UPDATE alloy SET basePrice = ? WHERE id = 1", [originalBase]);
  
  console.log("\\nTesting Completed Successfully.");
  process.exit(0);
}

main().catch(console.error);
