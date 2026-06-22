const https = require('https');

https.get('https://finance.yahoo.com/calendar/economic', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.length);
    console.log(data.slice(0, 500));
  });
});
