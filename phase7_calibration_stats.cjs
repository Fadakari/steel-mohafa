const mysql = require('mysql2/promise');

async function runCalibrationStats() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'ai_agent',
    password: 'StrongPassword123!',
    database: 'steel_mahfa'
  });

  try {
    console.log('--- PHASE 7: DETAILED CALIBRATION STATS ---\\n');

    // Fetch all calibration data
    const [data] = await conn.execute(`
        SELECT r.*, 
               a.name as alloy_name, 
               c.title as category_name
        FROM pricing_calibration_report r
        LEFT JOIN alloy a ON r.alloy_id = a.id
        LEFT JOIN categories c ON r.category_id = c.id
    `);

    // Helper functions for stats
    const calculateStats = (groupData, name) => {
        const N = groupData.length;
        if (N === 0) return null;

        const diffs = groupData.map(d => parseFloat(d.difference_amount));
        diffs.sort((a, b) => a - b);

        const sum = diffs.reduce((a, b) => a + b, 0);
        const mean = sum / N;

        const min = diffs[0];
        const max = diffs[N - 1];

        const mid = Math.floor(N / 2);
        const median = N % 2 !== 0 ? diffs[mid] : (diffs[mid - 1] + diffs[mid]) / 2;

        const variance = diffs.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / N;
        const stdDev = Math.sqrt(variance);

        const targetCount = diffs.filter(d => d >= -20000 && d <= -10000).length;
        const targetPercent = (targetCount / N) * 100;

        // Confidence Logic
        let confidence = 'LOW';
        if (N >= 50 && stdDev <= 15000) confidence = 'HIGH (90%+)';
        else if (N >= 50 && stdDev <= 30000) confidence = 'MEDIUM (70%)';
        else if (N >= 20 && stdDev <= 25000) confidence = 'MEDIUM (75%)';
        else if (N >= 100) confidence = 'MEDIUM (65%)'; // High sample, high variance
        
        // Needed Rule
        const neededRule = -15000 - mean;

        return {
            'Name': name || 'Unknown',
            'Samples': N,
            'Avg Diff': Math.round(mean),
            'Median Diff': Math.round(median),
            'Min': Math.round(min),
            'Max': Math.round(max),
            'Std Dev': Math.round(stdDev),
            'In Target %': targetPercent.toFixed(1) + '%',
            'Needed Rule': Math.round(neededRule),
            'Confidence': confidence
        };
    };

    // Grouping Dictionaries
    const alloys = {};
    const types = {};
    const categories = {};

    data.forEach(d => {
        if (d.alloy_name) {
            if (!alloys[d.alloy_name]) alloys[d.alloy_name] = [];
            alloys[d.alloy_name].push(d);
        }
        if (d.product_type) {
            if (!types[d.product_type]) types[d.product_type] = [];
            types[d.product_type].push(d);
        }
        if (d.category_name) {
            if (!categories[d.category_name]) categories[d.category_name] = [];
            categories[d.category_name].push(d);
        }
    });

    // Generate Reports
    const reportAlloys = Object.keys(alloys).map(k => calculateStats(alloys[k], k)).filter(Boolean);
    const reportTypes = Object.keys(types).map(k => calculateStats(types[k], k)).filter(Boolean);
    
    // Sort categories by Sample size and ignore very small groups
    let reportCategories = Object.keys(categories)
        .map(k => calculateStats(categories[k], k))
        .filter(s => s && s.Samples >= 10)
        .sort((a, b) => b.Samples - a.Samples);

    console.log('=== ALLOY CALIBRATION STATS ===');
    console.table(reportAlloys);

    console.log('\\n=== PRODUCT TYPE CALIBRATION STATS ===');
    console.table(reportTypes);

    console.log('\\n=== TOP CATEGORY CALIBRATION STATS ===');
    console.table(reportCategories.slice(0, 25)); // Top 25 largest categories

    console.log('\\n[!] NO ACTUAL UPDATES WERE MADE TO `pricing_rules`. THIS IS A READ-ONLY STATISTICAL REPORT.');

  } catch (e) {
    console.error('Stats failed:', e);
  } finally {
    await conn.end();
  }
}

runCalibrationStats();
