const http = require('http');

http.get('http://localhost:3000/api/category/' + encodeURIComponent('ورق-استیل') + '/' + encodeURIComponent('ورق-استیل-304'), (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const results = {};
      parsed.products.forEach(p => {
        if (p.thickness === 0.5 && p.finish_surface === 'مات 2B') {
          const key = `${p.brand_origin} ${p.condition}`;
          // Get the first matching one
          if (!results[key]) {
            results[key] = p.product_pricing_attributes?.calculated_price_per_kg;
          }
        }
      });
      console.log(results);
    } catch(e) {
      console.log("Error parsing:", e.message);
    }
  });
});
