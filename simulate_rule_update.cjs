const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  // Base Prices Map
  const [alloyData] = await conn.query('SELECT id, basePrice FROM alloy');
  const basePrices = {};
  alloyData.forEach(a => basePrices[a.id] = a.basePrice);

  async function getAffected(ruleType, ruleValue, categoryId, newMult) {
     let query = `
      SELECT p.id, p.brand_origin, p.condition, p.category_id, pam.alloy_id, ppa.calculated_price_per_kg as current_price
      FROM products p
      JOIN product_alloy_mapping pam ON p.id = pam.product_id
      JOIN product_pricing_attributes ppa ON p.id = ppa.product_id
      WHERE 1=1
     `;
     
     let params = [];
     if(ruleType === 'brand_origin') {
         query += ` AND p.brand_origin = ?`;
         params.push(ruleValue);
     } else if (ruleType === 'category') {
         query += ` AND p.category_id = ?`;
         params.push(categoryId);
     }
     
     const [affected] = await conn.query(query, params);
     return affected;
  }
  
  // Sim 1: China to 1.0015
  console.log("=== SIMULATION 1: Update Brand 'China' from 1.0010 to 1.0015 ===");
  const chinaProducts = await getAffected('brand_origin', 'چاینا (چین)', null, 1.0015);
  console.log(`Products affected: ${chinaProducts.length}`);
  
  // Show 3 examples before/after
  const sampleChina = chinaProducts.filter(p => p.alloy_id === 1).slice(0,3);
  for(let p of sampleChina) {
      // old mult = 1.0010
      const oldPrice = Math.round(basePrices[p.alloy_id] * 1.0010 * 1.0000 /* sheet */);
      // new mult = 1.0015
      const newPrice = Math.round(basePrices[p.alloy_id] * 1.0015 * 1.0000 /* sheet */);
      console.log(`Product ${p.id} (Alloy ${p.alloy_id}, ${p.brand_origin}, ${p.condition})`);
      console.log(`   Base: ${basePrices[p.alloy_id]} | Before: ${oldPrice} | After: ${newPrice}`);
  }
  
  // Sim 2: Decorative to 1.5000
  console.log("\\n=== SIMULATION 2: Update Category 266 from 1.5320 to 1.5000 ===");
  const decProducts = await getAffected('category', null, 266, 1.5000);
  console.log(`Products affected: ${decProducts.length}`);
  
  const sampleDec = decProducts.filter(p => p.alloy_id === 1).slice(0,3);
  for(let p of sampleDec) {
      const oldPrice = Math.round(basePrices[p.alloy_id] * 1.5320);
      const newPrice = Math.round(basePrices[p.alloy_id] * 1.5000);
      console.log(`Product ${p.id} (Alloy ${p.alloy_id}, Cat ${p.category_id})`);
      console.log(`   Base: ${basePrices[p.alloy_id]} | Before: ${oldPrice} | After: ${newPrice}`);
  }

  process.exit(0);
}

main();
