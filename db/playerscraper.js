const baseurl = 'https://api.lineups.com/nfl/fetch/players?page=';

const https = require('https');

const players = [];

function sendreq(pagenum = 1) {
  https.get(baseurl + pagenum, (resp) => {
    let data = '';
    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      const res = JSON.parse(data);
      res.results.map(p => {
        if (p.position === 'PK') {p.position = 'K'}
          return p;
      })
      console.log(res.results);
      if (res.next) { sendreq(pagenum + 1); } else { console.log(players); }
    });
  });
}

sendreq();
