const http = require('http');

const data = JSON.stringify({
  collection: 'alloy',
  event: 'alloy.items.update',
  keys: [1],
  payload: { basePrice: '210000' }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/webhooks/directus/alloy',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
