const fs = require('fs');
const path = require('path');

const file = path.join('app', 'components', 'PricingTable.vue');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const loadMore = \(\) => \{[\s\S]*?\}/,
  "const emit = defineEmits(['load-more'])\n\nconst loadMore = () => {\n  visibleCount.value += 50\n  emit('load-more')\n}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Added emit load-more to PricingTable.vue');
