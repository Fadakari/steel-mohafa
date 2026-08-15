import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate dates for the last 5 days
const getDates = () => {
  const dates = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates; // [4 days ago, 3 days ago, ..., today]
};

const dates = getDates();

async function main() {
  console.log('🌱 Starting comprehensive rule-based permutation data seed...');

  // 1. Safely clear existing data in STRICT hierarchical order
  console.log('🧹 Clearing existing data (handling foreign keys)...');
  await prisma.price_history.deleteMany();
  await prisma.products.deleteMany();
  await prisma.categories.deleteMany({ where: { parent_id: { not: null } } }); // Delete children first
  await prisma.categories.deleteMany({ where: { parent_id: null } }); // Delete parents last

  // 2. Create Parent Categories
  console.log('📂 Creating Parent Categories...');
  const catSheet = await prisma.categories.create({ data: { title: 'ورق استیل (Sheets)', slug: 'ورق-استیل' } });
  const catProfile = await prisma.categories.create({ data: { title: 'پروفیل استیل (Profiles)', slug: 'پروفیل-استیل' } });
  const catPipe = await prisma.categories.create({ data: { title: 'لوله استیل (Pipes)', slug: 'لوله-استیل' } });
  const catRoundBar = await prisma.categories.create({ data: { title: 'میلگرد استیل (Round Bars)', slug: 'میلگرد-استیل' } });
  const catFittings = await prisma.categories.create({ data: { title: 'اتصالات استیل (Fittings)', slug: 'اتصالات-استیل' } });
  const catBaseSections = await prisma.categories.create({ data: { title: 'مقاطع پایه استیل (Base Sections)', slug: 'مقاطع-پایه' } });
  const catValves = await prisma.categories.create({ data: { title: 'شیرآلات استیل (Valves)', slug: 'شیرآلات-استیل' } });
  const catWire = await prisma.categories.create({ data: { title: 'مفتول و سیم جوش استیل (Wire & Welding)', slug: 'مفتول-استیل' } });

  // 3. Create Child Categories
  console.log('📁 Creating Child Categories...');
  
  // Sheet Children
  const sheet304 = await prisma.categories.create({ data: { title: 'ورق استیل 304 / 304L', slug: 'ورق-استیل-304', parent_id: catSheet.id } });
  const sheet316 = await prisma.categories.create({ data: { title: 'ورق استیل 316 / 316L', slug: 'ورق-استیل-316', parent_id: catSheet.id } });
  const sheet321 = await prisma.categories.create({ data: { title: 'ورق استیل 321 (ضد سایش و نسوز)', slug: 'ورق-استیل-321', parent_id: catSheet.id } });
  const sheet310 = await prisma.categories.create({ data: { title: 'ورق استیل 310 / 310S (نسوز)', slug: 'ورق-استیل-310', parent_id: catSheet.id } });
  const sheet309 = await prisma.categories.create({ data: { title: 'ورق استیل 309 / 309S (نسوز)', slug: 'ورق-استیل-309', parent_id: catSheet.id } });
  const sheet430 = await prisma.categories.create({ data: { title: 'ورق استیل 430 (بگیر)', slug: 'ورق-استیل-430', parent_id: catSheet.id } });
  const sheet420 = await prisma.categories.create({ data: { title: 'ورق استیل 420 (برشی / مارتنزیتی)', slug: 'ورق-استیل-420', parent_id: catSheet.id } });
  const sheet410 = await prisma.categories.create({ data: { title: 'ورق استیل 410', slug: 'ورق-استیل-410', parent_id: catSheet.id } });
  const sheet201 = await prisma.categories.create({ data: { title: 'ورق استیل 201', slug: 'ورق-استیل-201', parent_id: catSheet.id } });
  const sheetDecorative = await prisma.categories.create({ data: { title: 'ورق استیل دکوراتیو', slug: 'ورق-استیل-دکوراتیو', parent_id: catSheet.id } });
  
  // Profile Children
  const profile201 = await prisma.categories.create({ data: { title: 'پروفیل استیل 201 (بیشترین مصرف دکوراتیو)', slug: 'پروفیل-استیل-201', parent_id: catProfile.id } });
  const profile304 = await prisma.categories.create({ data: { title: 'پروفیل استیل 304 (دکوراتیو و صنعتی)', slug: 'پروفیل-استیل-304', parent_id: catProfile.id } });
  const profile316 = await prisma.categories.create({ data: { title: 'پروفیل استیل 316 (صنعتی و ضد اسید)', slug: 'پروفیل-استیل-316', parent_id: catProfile.id } });
  const profileDecorative = await prisma.categories.create({ data: { title: 'پروفیل استیل دکوراتیو (ظاهری)', slug: 'پروفیل-استیل-دکوراتیو', parent_id: catProfile.id } });
  
  // Pipe Children
  const pipe201 = await prisma.categories.create({ data: { title: 'لوله استیل 201', slug: 'لوله-استیل-201', parent_id: catPipe.id } });
  const pipe304 = await prisma.categories.create({ data: { title: 'لوله استیل 304', slug: 'لوله-استیل-304', parent_id: catPipe.id } });
  const pipe316 = await prisma.categories.create({ data: { title: 'لوله استیل 316', slug: 'لوله-استیل-316', parent_id: catPipe.id } });
  const pipe321 = await prisma.categories.create({ data: { title: 'لوله استیل 321', slug: 'لوله-استیل-321', parent_id: catPipe.id } });
  const pipe310 = await prisma.categories.create({ data: { title: 'لوله استیل 310', slug: 'لوله-استیل-310', parent_id: catPipe.id } });
  const pipeFoodGrade = await prisma.categories.create({ data: { title: 'لوله صنایع غذایی (Food Grade)', slug: 'لوله-صنایع-غذایی', parent_id: catPipe.id } });

  // Round Bar Children
  const roundBar304 = await prisma.categories.create({ data: { title: 'میلگرد استیل 304', slug: 'میلگرد-استیل-304', parent_id: catRoundBar.id } });
  const roundBar316 = await prisma.categories.create({ data: { title: 'میلگرد استیل 316', slug: 'میلگرد-استیل-316', parent_id: catRoundBar.id } });
  const roundBar321 = await prisma.categories.create({ data: { title: 'میلگرد استیل 321', slug: 'میلگرد-استیل-321', parent_id: catRoundBar.id } });
  const roundBar310 = await prisma.categories.create({ data: { title: 'میلگرد استیل 310', slug: 'میلگرد-استیل-310', parent_id: catRoundBar.id } });
  const roundBar420 = await prisma.categories.create({ data: { title: 'میلگرد استیل 420', slug: 'میلگرد-استیل-420', parent_id: catRoundBar.id } });
  const roundBar430 = await prisma.categories.create({ data: { title: 'میلگرد استیل 430', slug: 'میلگرد-استیل-430', parent_id: catRoundBar.id } });
  const roundBar410 = await prisma.categories.create({ data: { title: 'میلگرد استیل 410', slug: 'میلگرد-استیل-410', parent_id: catRoundBar.id } });

  // Base Section Children
  const flatBar304 = await prisma.categories.create({ data: { title: 'تسمه استیل 304', slug: 'تسمه-استیل-304', parent_id: catBaseSections.id } });
  const flatBar316 = await prisma.categories.create({ data: { title: 'تسمه استیل 316', slug: 'تسمه-استیل-316', parent_id: catBaseSections.id } });
  const angleBar304 = await prisma.categories.create({ data: { title: 'نبشی استیل 304', slug: 'نبشی-استیل-304', parent_id: catBaseSections.id } });
  const angleBar316 = await prisma.categories.create({ data: { title: 'نبشی استیل 316', slug: 'نبشی-استیل-316', parent_id: catBaseSections.id } });
  const channel304 = await prisma.categories.create({ data: { title: 'ناودانی استیل 304', slug: 'ناودانی-استیل-304', parent_id: catBaseSections.id } });
  const channel316 = await prisma.categories.create({ data: { title: 'ناودانی استیل 316', slug: 'ناودانی-استیل-316', parent_id: catBaseSections.id } });
  const squareHexBar = await prisma.categories.create({ data: { title: 'چهارپهلو و ششپهلو', slug: 'چهارپهلو-ششپهلو', parent_id: catBaseSections.id } });

  // Fittings Children
  const fitWelded = await prisma.categories.create({ data: { title: 'اتصالات جوشی (Welded)', slug: 'اتصالات-جوشی', parent_id: catFittings.id } });
  const fitThreaded = await prisma.categories.create({ data: { title: 'اتصالات دنده ای (Threaded)', slug: 'اتصالات-دنده-ای', parent_id: catFittings.id } });
  const fitFood = await prisma.categories.create({ data: { title: 'اتصالات صنایع غذایی (Food Grade)', slug: 'اتصالات-صنایع-غذایی', parent_id: catFittings.id } });
  const fitFlanges = await prisma.categories.create({ data: { title: 'فلنج استیل (Flanges)', slug: 'فلنج-استیل', parent_id: catFittings.id } });

  // Valves Children
  const valveIndustrial = await prisma.categories.create({ data: { title: 'شیرآلات صنعتی', slug: 'شیرآلات-صنعتی', parent_id: catValves.id } });
  const valveFood = await prisma.categories.create({ data: { title: 'شیرآلات صنایع غذایی', slug: 'شیرآلات-صنایع-غذایی', parent_id: catValves.id } });

  // Wire & Welding Children
  const wire201 = await prisma.categories.create({ data: { title: 'مفتول استیل 201', slug: 'مفتول-استیل-201', parent_id: catWire.id } });
  const wire304 = await prisma.categories.create({ data: { title: 'مفتول استیل 304', slug: 'مفتول-استیل-304', parent_id: catWire.id } });
  const wire316 = await prisma.categories.create({ data: { title: 'مفتول استیل 316', slug: 'مفتول-استیل-316', parent_id: catWire.id } });
  const weldingWire = await prisma.categories.create({ data: { title: 'سیم جوش و الکترود', slug: 'سیم-جوش-الکترود', parent_id: catWire.id } });

  console.log('📦 Generating Products via Rule-Based Matrix Permutations...');

  let productCount = 0;
  let priceCount = 0;

  // Helper to generate and insert product + price history
  const createProductWithHistory = async (productData, basePrice, unit) => {
    const product = await prisma.products.create({ data: productData });
    productCount++;

    const historyData = dates.map((date, index) => {
      // Fluctuations: -3% to +3%
      const fluctuation = 1 + (Math.random() * 0.06 - 0.03);
      let finalPrice = Math.round((basePrice * fluctuation) / 1000) * 1000;
      let isCallForPrice = false;

      // Randomly make some records "Call for Price" (approx 5% chance)
      if (Math.random() < 0.05) {
        finalPrice = 0;
        isCallForPrice = true;
      }

      priceCount++;
      return {
        product_id: product.id,
        price: finalPrice,
        unit: unit,
        is_call_for_price: isCallForPrice,
        date_created: date,
      };
    });

    await prisma.price_history.createMany({ data: historyData });
  };

  // --- EXISTING LOGIC: RULE 1 & RULE 2 & RULE 3 & RULE 4 & RULE 5 ---
  
  // --- RULE 1: Comprehensive Sheets Generation ---
  console.log('✨ Generating RULE 1: Comprehensive Sheets...');
  const allSheetThicknesses = [0.5, 0.6, 0.8, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0];
  const allSheetDimensions = ['1000x2000 mm', '1250x2500 mm', '1500x6000 mm'];
  const allSheetConditions = ['شیت', 'رول'];
  const allSheetOrigins = ['تایوان', 'چاینا (چین)', 'جندال هند', 'پوسکو کره'];

  const standardFinishes = ['مات 2B', 'خشدار No.4', 'براق BA'];
  const industrialFinishes = ['مات صنعتی No.1', 'سطح اسیدشویی'];
  const decorativeFinishes = ['طلایی میرور', 'نقره ای خشدار', 'مشکی میرور', 'برنز'];

  const sheetConfigs = [
    { cat: sheet304, basePrice: 195000, finishes: standardFinishes },
    { cat: sheet316, basePrice: 285000, finishes: standardFinishes },
    { cat: sheet201, basePrice: 135000, finishes: standardFinishes },
    { cat: sheet430, basePrice: 155000, finishes: standardFinishes },
    
    { cat: sheet321, basePrice: 295000, finishes: industrialFinishes },
    { cat: sheet310, basePrice: 385000, finishes: industrialFinishes },
    { cat: sheet309, basePrice: 365000, finishes: industrialFinishes },
    { cat: sheet420, basePrice: 165000, finishes: industrialFinishes },
    { cat: sheet410, basePrice: 160000, finishes: industrialFinishes },
    
    { cat: sheetDecorative, basePrice: 320000, finishes: decorativeFinishes }
  ];

  for (const config of sheetConfigs) {
    for (const thickness of allSheetThicknesses) {
      for (const dim of allSheetDimensions) {
        for (const finish of config.finishes) {
          for (const condition of allSheetConditions) {
            for (const origin of allSheetOrigins) {
              await createProductWithHistory({
                category_id: config.cat.id,
                thickness: thickness,
                dimensions: dim,
                finish_surface: finish,
                condition: condition,
                brand_origin: origin,
                is_active: true
              }, config.basePrice, 'کیلوگرم');
            }
          }
        }
      }
    }
  }

  // --- RULE 2: Comprehensive Profiles Generation ---
  console.log('✨ Generating RULE 2: Comprehensive Profiles...');
  const allProfileDimensions = ['10x10 mm', '20x20 mm', '30x30 mm', '40x40 mm', '40x80 mm', '50x50 mm', '60x60 mm'];
  const allProfileThicknesses = [0.6, 0.8, 1.0, 1.25, 1.5, 2.0];
  const allProfileOrigins = ['ساموین تایوان', 'سومار', 'چاینا (چین)'];
  
  const profileIndustrialFinishes = ['براق', 'مات صنعتی'];
  const profileDecorativeFinishes = ['طلایی میرور', 'نقرهای میرور', 'طلایی خشدار', 'دودی (Black)'];

  const profileConfigs = [
    { cat: profile304, basePrice: 195000, finishes: profileIndustrialFinishes },
    { cat: profile316, basePrice: 285000, finishes: profileIndustrialFinishes },
    { cat: profile201, basePrice: 135000, finishes: profileDecorativeFinishes },
    { cat: profileDecorative, basePrice: 320000, finishes: profileDecorativeFinishes }
  ];

  for (const config of profileConfigs) {
    for (const dim of allProfileDimensions) {
      for (const thickness of allProfileThicknesses) {
        for (const finish of config.finishes) {
          for (const origin of allProfileOrigins) {
            await createProductWithHistory({
              category_id: config.cat.id,
              dimensions: dim,
              thickness: thickness,
              finish_surface: finish,
              condition: 'شاخه ۶ متری',
              brand_origin: origin,
              is_active: true
            }, config.basePrice, 'شاخه');
          }
        }
      }
    }
  }

  // --- RULE 3: Comprehensive Pipes Generation ---
  console.log('✨ Generating RULE 3: Comprehensive Pipes...');
  const allPipeODs = ['16 mm', '25 mm', '38 mm', '51 mm', '76 mm', '102 mm'];
  const allPipeThicknesses = [1.0, 1.25, 1.5, 2.0, 3.0];
  const allPipeFinishes = ['مات صنعتی', 'پولیش 600 براق'];
  const allPipeOrigins = ['سومار', 'چاینا', 'تایوان'];

  const pipeIndustrialSchedules = ['درزدار', 'مانیسمان رده 10', 'مانیسمان رده 40'];
  const pipeFoodSchedules = ['صنایع غذایی (پولیش داخل و بیرون)'];
  const pipe201Schedules = ['درزدار دکوراتیو'];

  const pipeConfigs = [
    { cat: pipe304, basePrice: 205000, schedules: pipeIndustrialSchedules },
    { cat: pipe316, basePrice: 295000, schedules: pipeIndustrialSchedules },
    { cat: pipe321, basePrice: 305000, schedules: pipeIndustrialSchedules },
    { cat: pipe310, basePrice: 405000, schedules: pipeIndustrialSchedules },
    { cat: pipeFoodGrade, basePrice: 265000, schedules: pipeFoodSchedules },
    { cat: pipe201, basePrice: 145000, schedules: pipe201Schedules }
  ];

  for (const config of pipeConfigs) {
    for (const od of allPipeODs) {
      for (const thickness of allPipeThicknesses) {
        for (const schedule of config.schedules) {
          for (const finish of allPipeFinishes) {
            for (const origin of allPipeOrigins) {
              await createProductWithHistory({
                category_id: config.cat.id,
                outer_diameter: od,
                thickness: thickness,
                schedule_standard: schedule,
                finish_surface: finish,
                brand_origin: origin,
                condition: 'شاخه ۶ متری',
                is_active: true
              }, config.basePrice, 'شاخه');
            }
          }
        }
      }
    }
  }

  // --- RULE 4: Comprehensive Round Bars Generation ---
  console.log('✨ Generating RULE 4: Comprehensive Round Bars...');
  const allBarODs = ['8 mm', '10 mm', '12 mm', '16 mm', '20 mm', '30 mm', '50 mm', '80 mm', '100 mm'];
  const allBarFinishes = ['پوسته دار (سیاه)', 'پولیش خورده (روشن)'];
  const allBarConditions = ['شاخه ۶ متری', 'شاخه ۳ متری'];
  const allBarOrigins = ['هند (ویرجین)', 'ایران (یزد)', 'اسپانیا'];

  const barConfigs = [
    { cat: roundBar304, basePrice: 185000 },
    { cat: roundBar316, basePrice: 275000 },
    { cat: roundBar321, basePrice: 285000 },
    { cat: roundBar310, basePrice: 385000 },
    { cat: roundBar420, basePrice: 155000 },
    { cat: roundBar430, basePrice: 145000 },
    { cat: roundBar410, basePrice: 140000 }
  ];

  for (const config of barConfigs) {
    for (const od of allBarODs) {
      for (const finish of allBarFinishes) {
        for (const condition of allBarConditions) {
          for (const origin of allBarOrigins) {
            await createProductWithHistory({
              category_id: config.cat.id,
              outer_diameter: od,
              thickness: null, // Critical constraint: omitted for Round Bars
              finish_surface: finish,
              condition: condition,
              brand_origin: origin,
              is_active: true
            }, config.basePrice, 'کیلوگرم');
          }
        }
      }
    }
  }

  // --- RULE 5: Comprehensive Base Sections ---
  console.log('✨ Generating RULE 5: Comprehensive Base Sections...');
  const baseDim = ['20x3 mm', '30x3 mm', '40x4 mm', '50x5 mm'];
  const baseThickness = [3.0, 4.0, 5.0];
  const baseOrigin = ['ایران', 'هند'];
  const baseCategories = [
    { cat: flatBar304, basePrice: 175000 }, { cat: flatBar316, basePrice: 265000 },
    { cat: angleBar304, basePrice: 185000 }, { cat: angleBar316, basePrice: 275000 },
    { cat: channel304, basePrice: 195000 }, { cat: channel316, basePrice: 285000 },
    { cat: squareHexBar, basePrice: 200000 }
  ];

  for (const c of baseCategories) {
    for (const d of baseDim) {
      for (const t of baseThickness) {
        for (const o of baseOrigin) {
          await createProductWithHistory({
            category_id: c.cat.id,
            dimensions: d,
            thickness: t,
            condition: 'شاخه ۶ متری',
            brand_origin: o,
            is_active: true
          }, c.basePrice, 'کیلوگرم');
        }
      }
    }
  }

  // --- RULE 6: Comprehensive Fittings & Flanges ---
  console.log('✨ Generating RULE 6: Comprehensive Fittings & Flanges...');
  const fitDims = ['1/2 inch', '3/4 inch', '1 inch', '2 inch', '4 inch'];
  const fitOrigins = ['تایوان (بنکن)', 'چاینا'];
  const fitConfigs = [
    { cat: fitWelded, schedules: ['Sch 10', 'Sch 40'], basePrice: 120000 },
    { cat: fitFlanges, schedules: ['Sch 10', 'Sch 40'], basePrice: 350000 },
    { cat: fitThreaded, schedules: ['Class 150'], basePrice: 180000 },
    { cat: fitFood, schedules: ['صنایع غذایی'], basePrice: 220000 }
  ];

  for (const c of fitConfigs) {
    for (const d of fitDims) {
      for (const sch of c.schedules) {
        for (const o of fitOrigins) {
          await createProductWithHistory({
            category_id: c.cat.id,
            dimensions: d,
            thickness: null,
            schedule_standard: sch,
            brand_origin: o,
            is_active: true
          }, c.basePrice, 'عدد');
        }
      }
    }
  }

  // --- RULE 7: Comprehensive Valves ---
  console.log('✨ Generating RULE 7: Comprehensive Valves...');
  const valveDims = ['1/2 inch', '1 inch', '2 inch'];
  const valveConditions = ['شیر گازی دوتکه', 'شیر پروانهای', 'شیر خودکار'];
  const valveOrigins = ['نیپون', 'تایوان'];
  const valveCategories = [
    { cat: valveIndustrial, basePrice: 450000 },
    { cat: valveFood, basePrice: 550000 }
  ];

  for (const c of valveCategories) {
    for (const d of valveDims) {
      for (const cond of valveConditions) {
        for (const o of valveOrigins) {
          await createProductWithHistory({
            category_id: c.cat.id,
            dimensions: d,
            thickness: null,
            condition: cond,
            brand_origin: o,
            is_active: true
          }, c.basePrice, 'عدد');
        }
      }
    }
  }

  // --- RULE 8: Comprehensive Wire & Welding ---
  console.log('✨ Generating RULE 8: Comprehensive Wire & Welding...');
  const wireODs = ['0.8 mm', '1.0 mm', '1.2 mm', '1.6 mm', '2.4 mm'];
  const wireConditions = ['کلاف (قرقره)', 'شاخه (فیلر)'];
  const wireOrigins = ['کره (Kiswa)', 'چین'];
  const wireCategories = [
    { cat: wire201, basePrice: 120000 },
    { cat: wire304, basePrice: 190000 },
    { cat: wire316, basePrice: 280000 },
    { cat: weldingWire, basePrice: 320000 }
  ];

  for (const c of wireCategories) {
    for (const od of wireODs) {
      for (const cond of wireConditions) {
        for (const o of wireOrigins) {
          await createProductWithHistory({
            category_id: c.cat.id,
            outer_diameter: od,
            thickness: null,
            condition: cond,
            brand_origin: o,
            is_active: true
          }, c.basePrice, 'کیلوگرم');
        }
      }
    }
  }

  console.log(`✅ Success! Created ${productCount} products and ${priceCount} price history records.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
