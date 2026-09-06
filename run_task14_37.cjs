const fs = require('fs');
const path = require('path');

const file = path.join('app', 'components', 'PricingTable.vue');
let content = fs.readFileSync(file, 'utf8');

const oldFunc = `const getLivePrice = (product) => {
    if (product.product_pricing_attributes && product.product_pricing_attributes.calculated_price_per_kg) {
      return parseFloat(product.product_pricing_attributes.calculated_price_per_kg)
    }
    return null
  }`;

const newFunc = `const getLivePrice = (product) => {
    if (product.product_pricing_attributes) {
      const ppa = product.product_pricing_attributes
      if (ppa.unit === 'عدد' || ppa.unit === 'شاخه') {
         return parseFloat(ppa.calculated_total_price_per_unit || ppa.calculated_price_per_kg)
      }
      return parseFloat(ppa.calculated_price_per_kg)
    }
    return null
  }`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed PricingTable.vue getLivePrice');
