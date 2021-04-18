const baseurl = 'https://api.lineups.com/nfl/fetch/players?page=';

const https = require('https');

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
      res.results.map((p) => {
        const np = p;
        if (np.position === 'PK') { np.position = 'K'; }
        return np;
      });
      // eslint-disable-next-line no-console
      console.log(res.results);
      if (res.next) { sendreq(pagenum + 1); }
    });
  });
}

sendreq();
