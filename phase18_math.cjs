const marketData = [
  { finish: "میرور نقره ای", thickness: 0.4, sheet: 9249690 },
  { finish: "خش دار نقره ای", thickness: 0.4, sheet: 7066490 },
  { finish: "میرور طلایی", thickness: 0.4, sheet: 9535950 },
  { finish: "خش دار نقره ای", thickness: 0.5, sheet: 9242050 },
  { finish: "میرور نقره ای", thickness: 0.5, sheet: 9929070 },
  { finish: "میرور طلایی", thickness: 0.5, sheet: 10215330 },
  { finish: "میرور نقره ای", thickness: 0.6, sheet: 11932880 },
  { finish: "خش دار نقره ای", thickness: 0.6, sheet: 11074100 },
  { finish: "میرور طلایی", thickness: 0.6, sheet: 12505390 },
  { finish: "میرور نقره ای", thickness: 0.7, sheet: 14222940 },
  { finish: "خش دار نقره ای", thickness: 0.7, sheet: 13364170 },
  { finish: "میرور طلایی", thickness: 0.7, sheet: 14795460 },
  { finish: "خش دار نقره ای", thickness: 0.8, sheet: 13997400 },
  { finish: "میرور نقره ای", thickness: 0.8, sheet: 15142440 },
  { finish: "میرور طلایی", thickness: 0.8, sheet: 16799260 },
  { finish: "میرور نقره ای", thickness: 1.0, sheet: 21193540 },
  { finish: "خش دار طلایی", thickness: 1.0, sheet: 20164920 },
  { finish: "میرور طلایی", thickness: 1.0, sheet: 21515420 },
  { finish: "میرور نقره ای", thickness: 1.25, sheet: 22623550 },
  { finish: "میرور طلایی", thickness: 1.25, sheet: 23750770 },
  { finish: "خش دار نقره ای", thickness: 1.5, sheet: 23356360 },
  { finish: "میرور نقره ای", thickness: 1.5, sheet: 24537020 },
  { finish: "میرور طلایی", thickness: 1.5, sheet: 24876710 }
];

const DENSITY = 7.93;
const AREA = 1.22 * 2.44;
const BASE = 668001; // Industrial Base

const results = marketData.map(d => {
  const weight = AREA * d.thickness * DENSITY;
  const marketPerKg = Math.round(d.sheet / weight);
  
  // Model C fit: Cost of Finish per m2 = (MarketPrice - BaseSteelPrice) / Area
  // Actually, Base Steel Cost for sheet = Base * weight
  const finishPremiumPerKg = marketPerKg - BASE;
  const finishCostPerM2 = Math.round((finishPremiumPerKg * weight) / AREA);

  return {
    finish: d.finish,
    thickness: d.thickness,
    weight: weight.toFixed(2),
    marketPerKg,
    premiumPerKg: finishPremiumPerKg,
    impliedFinishCostPerM2: finishCostPerM2
  };
});

console.table(results);
