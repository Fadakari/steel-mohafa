const fs = require('fs');
const path = require('path');

const file = path.join('app', 'components', 'PricingTable.vue');
let content = fs.readFileSync(file, 'utf8');

const oldFunc = `const getLiveUnit = (product) => {
  if (product.product_pricing_attributes && product.product_pricing_attributes.unit) {
    return product.product_pricing_attributes.unit
  }
  return 'کیلوگرم'
}`;

const newFunc = `const getLiveUnit = (product) => {
  if (product.product_pricing_attributes) {
    let ppa = product.product_pricing_attributes;
    if (Array.isArray(ppa)) ppa = ppa[0];
    if (ppa && ppa.unit) return ppa.unit;
  }
  return 'کیلوگرم'
}`;

content = content.replace(/const getLiveUnit = \(product\) => \{[\s\S]*?return '[^']*'\s*\}/, newFunc);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed getLiveUnit');
