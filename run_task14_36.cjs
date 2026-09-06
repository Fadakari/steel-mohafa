const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  // 1. Fix units for Fittings, Flanges, Valves
  await c.query(`
    UPDATE product_pricing_attributes ppa
    JOIN products p ON p.id = ppa.product_id
    JOIN categories cat ON cat.id = p.category_id
    SET ppa.unit = 'عدد'
    WHERE cat.title LIKE '%اتصالات%' OR cat.title LIKE '%فلنج%' OR cat.title LIKE '%شیرآلات%'
  `);
  console.log('Fixed units for group 2');

  // 2. Drop and recreate trigger with correct final_price logic
  await c.query('DROP TRIGGER IF EXISTS after_product_pricing_update');
  await c.query(`
    CREATE TRIGGER after_product_pricing_update
    AFTER UPDATE ON product_pricing_attributes
    FOR EACH ROW
    BEGIN
        DECLARE final_price DECIMAL(18,2);
        IF NEW.unit = 'عدد' OR NEW.unit = 'شاخه' THEN
            SET final_price = NEW.calculated_total_price_per_unit;
        ELSE
            SET final_price = NEW.calculated_price_per_kg;
        END IF;

        IF (NEW.calculated_total_price_per_unit <> OLD.calculated_total_price_per_unit) OR (OLD.calculated_total_price_per_unit IS NULL AND NEW.calculated_total_price_per_unit IS NOT NULL) THEN
            INSERT INTO price_history (product_id, price, unit, is_call_for_price, date_created)
            VALUES (NEW.product_id, CAST(final_price AS UNSIGNED), NEW.unit, 0, CURRENT_TIMESTAMP);
        END IF;
    END;
  `);
  console.log('Recreated trigger');

  // 3. Fix the incorrect 5,502,000 records inserted today (Sep 6) for Sheets
  await c.query(`
    UPDATE price_history ph
    JOIN product_pricing_attributes ppa ON ppa.product_id = ph.product_id
    SET ph.price = ppa.calculated_price_per_kg
    WHERE ph.date_created >= '2026-09-06' AND ppa.unit = 'کیلوگرم'
  `);
  console.log('Fixed today\'s wrong history records');

  // 4. Backfill missing history for all products that were updated in Task 11 but missed the trigger
  await c.query(`
    INSERT INTO price_history (product_id, price, unit, is_call_for_price, date_created)
    SELECT 
        ppa.product_id, 
        CAST(IF(ppa.unit = 'عدد' OR ppa.unit = 'شاخه', ppa.calculated_total_price_per_unit, ppa.calculated_price_per_kg) AS UNSIGNED),
        ppa.unit,
        0,
        CURRENT_TIMESTAMP
    FROM product_pricing_attributes ppa
    LEFT JOIN price_history ph ON ph.product_id = ppa.product_id AND ph.date_created >= '2026-09-06'
    WHERE ph.id IS NULL AND ppa.calculated_price_per_kg IS NOT NULL
  `);
  console.log('Backfilled missing history for all products');

  process.exit(0);
}
m().catch(console.error);
