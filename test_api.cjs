const http = require('http');

http.get('http://localhost:3000/api/category/' + encodeURIComponent('ورق-استیل') + '/' + encodeURIComponent('ورق-استیل-304'), (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      // Find Taiwan Sheet 304 0.5 2B (ID: 27587)
      const p = parsed.products.find(x => x.id === 27587);
      if (p) {
        console.log("Taiwan Sheet 304 0.5 2B API Response:");
        console.log("- calculated_price_per_kg:", p.product_pricing_attributes?.calculated_price_per_kg);
        console.log("- calculated_total_price_per_unit:", p.product_pricing_attributes?.calculated_total_price_per_unit);
        console.log("- latest price_history price:", p.price_history?.[0]?.price);
      } else {
        console.log("Product 27587 not found in response.");
      }
    } catch(e) {
      console.log("Error parsing:", e.message, "\nRaw:", data.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.log("Request error:", e);
});
