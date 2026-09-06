const fs = require('fs');
const path = require('path');

const file = path.join('app', 'components', 'PricingTable.vue');
let content = fs.readFileSync(file, 'utf8');

// Replace chartDataset.value with chartDataset in the template
// But we must NOT replace it in the <script setup> section!
// Let's replace ONLY inside the <template> part. Or just replace chartDataset.value with chartDataset inside the template specifically.
// Let's do a smart regex replacement for `<template>...` block if possible, or just look for the specific strings.

// In the SVG polyline:
content = content.replace(/const history = \[\.\.\.chartDataset\.value\]/g, 'const history = [...chartDataset]');

// In the v-for:
content = content.replace(/v-for="\(point, idx\) in \[\.\.\.chartDataset\.value\]/g, 'v-for="(point, idx) in [...chartDataset]');

// In the left position calculation:
content = content.replace(/const len = chartDataset\.value\.length/g, 'const len = chartDataset.length');

// In the top position calculation:
content = content.replace(/const prices = chartDataset\.value\.map/g, 'const prices = chartDataset.map');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed chartDataset.value unwrapping issue in template');
