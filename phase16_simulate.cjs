const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const conn = await mysql.createConnection('mysql://root:@localhost:3306/steel_mahfa');
  
  // 1. Backup current rules
  const [rules] = await conn.query('SELECT * FROM pricing_rules');
  fs.writeFileSync('pricing_rules_backup.json', JSON.stringify(rules, null, 2));
  console.log('Backup saved to pricing_rules_backup.json');

  // Exact finishes from DB
  const finishMultipliers = {
    'براق BA': 1.0400,
    'خشدار No.4': 1.0630,
    'نقرهای میرور': 1.2720,    // 'نقرهای میرور' in DB (without space)
    'نقره ای میرور': 1.2720,  // 'نقره ای میرور' with space (just in case)
    'طلایی میرور': 1.5720,
    'مشکی میرور': 1.6460,
    'برنز': 1.6460,
    'طلایی خشدار': 1.4970,
    'نقره ای خشدار': 1.2720,   // Assuming similar to silver mirror
    'دودی (Black)': 1.6460     // Similar to black mirror
  };

  const thicknessMultipliers = {
    '0.5': 1.0800,
    '0.6': 1.0500
  };

  const basePrice = 668001;
  const brandMult = 1.0030; // Posco max
  const formMult = 1.0005;  // Roll max

  console.log('\n--- COMBINATION SIMULATION (Max Brand/Form = 1.0035) ---');
  for (const finish of Object.keys(finishMultipliers)) {
    for (const thick of ['0.5', '1']) { // test a thin and standard thickness
      const tMult = thicknessMultipliers[thick] || 1.0;
      const fMult = finishMultipliers[finish];
      
      const finalPrice = Math.round(basePrice * brandMult * formMult * fMult * tMult);
      console.log(`Finish: ${finish.padEnd(15)} | Thick: ${thick} | Total Mult: ${(brandMult*formMult*fMult*tMult).toFixed(4)} | Price: ${finalPrice.toLocaleString('en-US')}`);
    }
  }

  process.exit(0);
}

main();
