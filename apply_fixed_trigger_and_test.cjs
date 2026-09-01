const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  const [ephCol] = await conn.query("SHOW COLUMNS FROM engine_price_history WHERE Field = 'base_alloy_price_used'");
  const ephType = ephCol[0].Type;
  
  await conn.query(`DROP TRIGGER IF EXISTS after_alloy_update;`);
  
  const triggerSQL = `
    CREATE TRIGGER after_alloy_update
    AFTER UPDATE ON alloy
    FOR EACH ROW
    BEGIN
      IF NEW.basePrice <> OLD.basePrice THEN
      
        UPDATE product_pricing_attributes ppa
        JOIN product_alloy_mapping pam ON ppa.product_id = pam.product_id
        SET 
          ppa.calculated_price_per_kg = ROUND(CAST(NEW.basePrice AS DECIMAL(15,2)) * ppa.base_price_ratio),
          ppa.calculated_total_price_per_unit = IF(ppa.calculated_weight_kg IS NOT NULL, ROUND(CAST(NEW.basePrice AS DECIMAL(15,2)) * ppa.base_price_ratio) * ppa.calculated_weight_kg, NULL)
        WHERE pam.alloy_id = NEW.id AND ppa.base_price_ratio IS NOT NULL;
        
        INSERT INTO engine_price_history 
          (product_id, new_price_per_kg, new_total_price, change_percentage, source, base_alloy_price_used)
        SELECT 
          pam.product_id,
          ROUND(CAST(NEW.basePrice AS DECIMAL(15,2)) * ppa.base_price_ratio),
          IF(ppa.calculated_weight_kg IS NOT NULL, ROUND(CAST(NEW.basePrice AS DECIMAL(15,2)) * ppa.base_price_ratio) * ppa.calculated_weight_kg, NULL),
          0,
          'mysql_trigger_auto',
          CAST(NEW.basePrice AS DECIMAL(15,2))
        FROM product_alloy_mapping pam
        JOIN product_pricing_attributes ppa ON pam.product_id = ppa.product_id
        WHERE pam.alloy_id = NEW.id AND ppa.base_price_ratio IS NOT NULL;
        
        INSERT INTO price_history 
          (product_id, price, unit, is_call_for_price, date_created)
        SELECT 
          pam.product_id,
          ROUND(CAST(NEW.basePrice AS DECIMAL(15,2)) * ppa.base_price_ratio),
          'کیلوگرم',
          0,
          NOW()
        FROM product_alloy_mapping pam
        JOIN product_pricing_attributes ppa ON pam.product_id = ppa.product_id
        WHERE pam.alloy_id = NEW.id AND ppa.base_price_ratio IS NOT NULL;
        
      END IF;
    END;
  `;
  
  await conn.query(triggerSQL);
  
  const [alloy1Rows] = await conn.query('SELECT basePrice FROM alloy WHERE id = 1');
  const baselineBasePrice = alloy1Rows[0].basePrice;
  const testBasePrice = baselineBasePrice + 1000;
  
  const [phCount1] = await conn.query('SELECT COUNT(*) as c FROM price_history');
  const [ephCount1] = await conn.query('SELECT COUNT(*) as c FROM engine_price_history');
  
  const [baselineData] = await conn.query(`
    SELECT p.id as product_id, ppa.base_price_ratio, ppa.calculated_price_per_kg
    FROM products p
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    WHERE pam.alloy_id = 1 AND ppa.base_price_ratio IS NOT NULL
  `);
  
  const product27594Before = baselineData.find(p => p.product_id === 27594)?.calculated_price_per_kg;

  await conn.query('UPDATE alloy SET basePrice = ? WHERE id = 1', [testBasePrice]);
  
  const [updatedData] = await conn.query(`
    SELECT p.id as product_id, ppa.base_price_ratio, ppa.calculated_price_per_kg
    FROM products p
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    WHERE pam.alloy_id = 1 AND ppa.base_price_ratio IS NOT NULL
  `);
  
  let matchCount = 0;
  let mismatchCount = 0;
  let ratioChanged = false;
  
  const updated27594 = updatedData.find(p => p.product_id === 27594);
  const val27594After = updated27594?.calculated_price_per_kg;
  
  for (let b of baselineData) {
    let u = updatedData.find(x => x.product_id === b.product_id);
    if (!u) continue;
    if (u.base_price_ratio !== b.base_price_ratio) ratioChanged = true;
    
    const exact = Math.round(testBasePrice * parseFloat(u.base_price_ratio));
    if (parseFloat(u.calculated_price_per_kg) === exact) {
      matchCount++;
    } else {
      mismatchCount++;
    }
  }
  
  const [baselineOtherAlloys] = await conn.query(`
    SELECT p.id as product_id, ppa.calculated_price_per_kg
    FROM products p
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    WHERE pam.alloy_id = 2 AND ppa.base_price_ratio IS NOT NULL
  `);
  
  const [updatedOtherAlloys] = await conn.query(`
    SELECT p.id as product_id, ppa.calculated_price_per_kg
    FROM products p
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    WHERE pam.alloy_id = 2 AND ppa.base_price_ratio IS NOT NULL
  `);
  
  let otherAlloysAffected = false;
  for(let b of baselineOtherAlloys) {
    let u = updatedOtherAlloys.find(x => x.product_id === b.product_id);
    if(u && b.calculated_price_per_kg !== u.calculated_price_per_kg) otherAlloysAffected = true;
  }
  
  const [phCount2] = await conn.query('SELECT COUNT(*) as c FROM price_history');
  const [ephCount2] = await conn.query('SELECT COUNT(*) as c FROM engine_price_history');
  const phNew = phCount2[0].c - phCount1[0].c;
  
  await conn.query('UPDATE alloy SET basePrice = ? WHERE id = 1', [baselineBasePrice]);
  const [restoredAlloy1] = await conn.query('SELECT basePrice FROM alloy WHERE id = 1');
  const isRestored = restoredAlloy1[0].basePrice === baselineBasePrice;
  
  console.log(JSON.stringify({
    triggerUpdated: true,
    ephType,
    product27594Before,
    val27594After,
    expected27594: Math.round(testBasePrice * 0.8995),
    matchCount,
    mismatchCount,
    ratioChanged,
    otherAlloysAffected,
    phNew,
    expectedNewHistories: baselineData.length,
    isRestored
  }, null, 2));

  process.exit(0);
}
main().catch(console.error);
