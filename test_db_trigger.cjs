const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  console.log("Setting Alloy 1 basePrice to 210001...");
  await conn.query(`UPDATE alloy SET basePrice = 210001 WHERE id = 1;`);
  
  console.log("Checking updated variants for Alloy 1 (Thick: 0.5, 1000x2000, 2B)...");
  const [rows] = await conn.query(`
    SELECT p.brand_origin as brand, p.condition as form, ppa.calculated_price_per_kg as new_price, ppa.base_price_ratio
    FROM products p
    JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
    JOIN product_alloy_mapping pam ON p.id = pam.product_id
    WHERE pam.alloy_id = 1 AND p.thickness = 0.5 AND p.finish_surface = 'مات 2B' AND p.dimensions LIKE '%1000%'
  `);
  
  const targetVars = [
    {b: 'تایوان', f: 'شیت'}, {b: 'چاینا (چین)', f: 'شیت'}, {b: 'جندال هند', f: 'شیت'}, {b: 'پوسکو کره', f: 'شیت'},
    {b: 'تایوان', f: 'رول'}, {b: 'چاینا (چین)', f: 'رول'}, {b: 'جندال هند', f: 'رول'}, {b: 'پوسکو کره', f: 'رول'}
  ];
  
  console.table(targetVars.map(v => {
    const r = rows.find(x => x.brand === v.b && x.form === v.f);
    return {
      Brand: v.b,
      Form: v.f,
      Ratio: r?.base_price_ratio,
      NewPrice: r?.new_price,
      Expected: r ? Math.round(210001 * parseFloat(r.base_price_ratio)) : 'N/A'
    };
  }));

  process.exit(0);
}
main().catch(console.error);
