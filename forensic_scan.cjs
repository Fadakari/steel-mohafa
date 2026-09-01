const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.startsWith('phase') && f.endsWith('.cjs'));
let engineCode = {};
let ruleInserts = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('pricing_rules')) {
    const lines = content.split('\n');
    lines.forEach((l, i) => {
      if (l.includes('INSERT INTO pricing_rules') || l.includes('INSERT IGNORE INTO pricing_rules')) {
        ruleInserts.push({ file: f, line: l.trim(), context: lines.slice(Math.max(0, i-2), i+3).join('\n') });
      }
    });
  }
  
  if (content.includes('const newPrice =') || content.includes('let multiplier =') || content.includes('function calculatePrice')) {
    engineCode[f] = true;
  }
});

console.log("=== RULE INSERTS FOUND ===");
console.log(JSON.stringify(ruleInserts, null, 2));

console.log("\n=== FILES CONTAINING ENGINE CALCULATION LOGIC ===");
console.log(Object.keys(engineCode));

// Let's also check phase7 specifically for rule generation logic
if (fs.existsSync('phase7_calibration_engine.cjs')) {
  console.log("\n=== PHASE 7 SNIPPETS ===");
  const p7 = fs.readFileSync('phase7_calibration_engine.cjs', 'utf8');
  console.log(p7.substring(0, 1000));
}
