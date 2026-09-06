const fs = require('fs');
const path = require('path');

const file = path.join('app', 'components', 'PricingTable.vue');
let content = fs.readFileSync(file, 'utf8');

// I need to add an extra </div> before `<div v-else class="text-center py-10 text-zinc-500">`
const search = `              </div>
              
              <div class="flex justify-between mt-2 text-[10px] text-zinc-500 px-1">
                <span>U,O_UOU.UO?OOO</span>
                <span>OO_UOO_OOUOU+</span>
              </div>
            </div>
            
            <div v-else class="text-center py-10 text-zinc-500">`;

const replace = `              </div>
              
              <div class="flex justify-between mt-2 text-[10px] text-zinc-500 px-1">
                <span>U,O_UOU.UO?OOO</span>
                <span>OO_UOO_OOUOU+</span>
              </div>
            </div>
            </div>
            
            <div v-else class="text-center py-10 text-zinc-500">`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed div closure');
} else {
    console.log('Could not find the target string');
}
