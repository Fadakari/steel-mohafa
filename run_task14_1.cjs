const fs = require('fs');
const path = require('path');

const file = path.join('app', 'components', 'PricingTable.vue');
let content = fs.readFileSync(file, 'utf8');

// Add chartDataset computed property
const newComputed = `const chartDataset = computed(() => {
  return extendedHistory.value.map(h => ({
    ...h,
    price: showVat.value ? Math.round(h.price * 1.1) : h.price,
    old_price: h.old_price ? (showVat.value ? Math.round(h.old_price * 1.1) : h.old_price) : null
  }))
})
`;

// Insert after extendedHistory
content = content.replace('const extendedHistory = ref([])', 'const extendedHistory = ref([])\n' + newComputed);

// Replace extendedHistory usages in the chart template with chartDataset
// 1. Array inside polyline points
content = content.replace(/const history = \[\.\.\.extendedHistory\]/g, 'const history = [...chartDataset.value]');
// 2. prices mapping for dots
content = content.replace(/const prices = extendedHistory\.map/g, 'const prices = chartDataset.value.map');
// 3. v-for point
content = content.replace(/v-for="\(point, idx\) in \[\.\.\.extendedHistory\]/g, 'v-for="(point, idx) in [...chartDataset.value]');
// 4. len = extendedHistory.length
content = content.replace(/len = extendedHistory\.value\.length/g, 'len = chartDataset.value.length');
content = content.replace(/len = extendedHistory\.length/g, 'len = chartDataset.value.length');

fs.writeFileSync(file, content, 'utf8');
console.log('Chart logic updated in PricingTable.vue');
