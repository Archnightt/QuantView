const cheerio = require('cheerio');

async function test() {
  const res = await fetch('https://finance.yahoo.com/calendar/economic', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const rows = $('table tbody tr');
  const events = [];
  rows.each((i, el) => {
    if (i > 10) return;
    const tds = $(el).find('td');
    events.push({
      event: $(tds[0]).text().trim(),
      date: $(tds[1]).text().trim(),
      time: $(tds[2]).text().trim(),
      country: $(tds[3]).text().trim(),
      forPeriod: $(tds[4]).text().trim(),
      actual: $(tds[5]).text().trim(),
      expected: $(tds[6]).text().trim(),
      prior: $(tds[7]).text().trim()
    });
  });
  console.log(events);
}
test();
