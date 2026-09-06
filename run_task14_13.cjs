const fs = require('fs');
const path = require('path');

const file = path.join('app', 'components', 'PricingTable.vue');
let content = fs.readFileSync(file, 'utf8');

// The block ends with:
//               <div class="flex justify-between mt-2 text-[10px] text-zinc-500 px-1">
//                 <span>...</span>
//                 <span>...</span>
//               </div>
//             </div>
//             <div v-else class="text-center py-10 text-zinc-500">

content = content.replace(
  /<\/div>\s*<\/div>\s*<div v-else class="text-center py-10 text-zinc-500">/,
  "</div>\n            </div>\n            </div>\n            <div v-else class=\"text-center py-10 text-zinc-500\">"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed div closure with regex');
