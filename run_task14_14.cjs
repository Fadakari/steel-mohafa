const fs = require('fs');
const path = require('path');

const file = path.join('app', 'components', 'PricingTable.vue');
let content = fs.readFileSync(file, 'utf8');

// The one in the template is inside the `:style="{ left: (() => { const len = chartDataset.value.length - 1 || 1; return (idx / len) * 100 + '%'; })(), ...`

content = content.replace(
  /left: \(\(\) => \{\s*const len = chartDataset\.value\.length - 1 \|\| 1;/g,
  "left: (() => {\n                      const len = chartDataset.length - 1 || 1;"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed chartDataset.value.length in template');
