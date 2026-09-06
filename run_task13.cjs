const mysql = require('mysql2/promise');
async function m() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  await c.query('DROP TRIGGER IF EXISTS after_product_pricing_update');
  const triggerSql = `
  CREATE TRIGGER after_product_pricing_update
  AFTER UPDATE ON product_pricing_attributes
  FOR EACH ROW
  BEGIN
      IF (NEW.calculated_total_price_per_unit <> OLD.calculated_total_price_per_unit) OR (OLD.calculated_total_price_per_unit IS NULL AND NEW.calculated_total_price_per_unit IS NOT NULL) THEN
          INSERT INTO price_history (product_id, price, is_call_for_price, date_created)
          VALUES (NEW.product_id, CAST(NEW.calculated_total_price_per_unit AS UNSIGNED), 0, CURRENT_TIMESTAMP);
      END IF;
  END;
  `;
  await c.query(triggerSql);
  console.log('Logging trigger created successfully.');

  const updateSql = `UPDATE category_base_prices SET base_price = 665000 WHERE category_id = 266;`;
  const [updateRes] = await c.query(updateSql);
  console.log('Category base price updated. Rows affected:', updateRes.affectedRows);

  const selectSql = `
    SELECT id, product_id, price, is_call_for_price, date_created 
    FROM price_history 
    ORDER BY date_created DESC, id DESC 
    LIMIT 5;
  `;
  const [selectRes] = await c.query(selectSql);
  console.table(selectRes);
  
  process.exit(0);
}
m().catch(console.error);
