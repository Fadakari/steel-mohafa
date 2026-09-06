const fs = require('fs');
const path = require('path');

const file = path.join('app', 'components', 'PricingTable.vue');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix handlePointerMove
content = content.replace(
  /const len = chartDataset\.length - 1 \|\| 1/g,
  "const len = chartDataset.value.length - 1 || 1"
);

// 2. Enhance the chart UI to add X and Y axis markings
const oldChartMarkup = `<div v-else-if="extendedHistory.length > 1" class="relative w-full h-[200px] bg-zinc-900/30 rounded-xl border border-zinc-800 p-4 pt-10">`;

const newChartMarkup = `<div v-else-if="extendedHistory.length > 1" class="relative w-full bg-zinc-900/30 rounded-xl border border-zinc-800 p-4 pb-8 pl-4 pr-14 mt-4">
              <!-- Y-Axis (Prices) -->
              <div class="absolute right-2 top-4 bottom-8 flex flex-col justify-between text-[10px] text-zinc-500 font-mono text-right pointer-events-none">
                <span>{{ (() => { const p = chartDataset.map(h => h.price); return new Intl.NumberFormat('fa-IR').format(Math.max(...p)); })() }}</span>
                <span>{{ (() => { const p = chartDataset.map(h => h.price); return new Intl.NumberFormat('fa-IR').format(Math.round((Math.max(...p) + Math.min(...p))/2)); })() }}</span>
                <span>{{ (() => { const p = chartDataset.map(h => h.price); return new Intl.NumberFormat('fa-IR').format(Math.min(...p)); })() }}</span>
              </div>
              
              <!-- X-Axis (Dates) -->
              <div class="absolute bottom-2 left-4 right-14 flex justify-between text-[10px] text-zinc-500 font-mono pointer-events-none" dir="ltr">
                <span>{{ chartDataset.length > 0 ? chartDataset[chartDataset.length - 1].jalaliDate.split(' ')[0] + ' ' + chartDataset[chartDataset.length - 1].jalaliDate.split(' ')[1] : '' }}</span>
                <span v-if="chartDataset.length > 2">{{ chartDataset[Math.floor(chartDataset.length / 2)].jalaliDate.split(' ')[0] + ' ' + chartDataset[Math.floor(chartDataset.length / 2)].jalaliDate.split(' ')[1] }}</span>
                <span>{{ chartDataset.length > 0 ? chartDataset[0].jalaliDate.split(' ')[0] + ' ' + chartDataset[0].jalaliDate.split(' ')[1] : '' }}</span>
              </div>
              
              <div class="w-full h-[180px] relative">`;

content = content.replace(oldChartMarkup, newChartMarkup);

// We need to close the extra div we added: `<div class="w-full h-[180px] relative">`
// Where does the original container end?
// The container ends after the HTML tooltips: `</div>\n            <div v-else class="text-center py-10">`
const searchCloseDiv = `                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-10 text-zinc-500 text-sm">`;

const replaceCloseDiv = `                  </div>
                </div>
              </div>
              </div>
            </div>
            <div v-else class="text-center py-10 text-zinc-500 text-sm">`;

content = content.replace(searchCloseDiv, replaceCloseDiv);

fs.writeFileSync(file, content, 'utf8');
console.log('Chart enhanced with Y and X axes and pointer bug fixed');
