/* eslint-disable no-useless-escape */
// Pull player data from an API
const axios = require('axios');
const models = require('../models');

const teammap = {
  ARI: 1,
  ATL: 2,
  BAL: 3,
  BUF: 4,
  CAR: 5,
  CHI: 6,
  CIN: 7,
  CLE: 8,
  DAL: 9,
  DEN: 10,
  DET: 11,
  GB: 12,
  HOU: 13,
  IND: 14,
  JAX: 15,
  KC: 16,
  MIA: 17,
  MIN: 18,
  NE: 19,
  NO: 20,
  NYG: 21,
  NYJ: 22,
  LV: 23,
  PHI: 24,
  PIT: 25,
  LAC: 26,
  SF: 27,
  SEA: 28,
  LAR: 29,
  TB: 30,
  TEN: 31,
  WAS: 32,
};

const nflpos = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 4,
  K: 5,
  DEF: 6,
};

const baseurl = (posget) => `https://football.fantasysports.yahoo.com/f1/316236/players?status=ALL&pos=${posget}&cut_type=9&stat1=S_PW_3&myteam=1&sort=PTS&sdir=1&count=`;
const cookie = 'F=d=p7DRZ.Y9vIVU4OJs8izc65lKL62rvcxnT9BP; Y=v=1&n=89nr4qi2t4spg&l=14d1wrr/o&p=m2v0ii200000000&r=pg&intl=us; cmp=t=1608956043&j=0; A1=d=AQABBMBu_V0CEHRuHPUjNSfG76QClV-Ot-oFEgEABAJf_WDDYdxN0iMA_eMAAAcIBVGjXf4MgrIID6PkDyn17s7wolpPY94ougkBBwoBTQ&S=AQAAAhCl094lkFpfx4afIMa7LOs; A3=d=AQABBMBu_V0CEHRuHPUjNSfG76QClV-Ot-oFEgEABAJf_WDDYdxN0iMA_eMAAAcIBVGjXf4MgrIID6PkDyn17s7wolpPY94ougkBBwoBTQ&S=AQAAAhCl094lkFpfx4afIMa7LOs; GUC=AQEABAJg_V9hw0IfJQRc; ucs=tr=1631756102000&fs=1; OTH=v=1&d=eyJraWQiOiIwMTY0MGY5MDNhMjRlMWMxZjA5N2ViZGEyZDA5YjE5NmM5ZGUzZWQ5IiwiYWxnIjoiUlMyNTYifQ.eyJjdSI6eyJndWlkIjoiUDM0TDRBU0M3Mk9BVVhSQUtUNEdQUE0zSFEiLCJwZXJzaXN0ZW50Ijp0cnVlLCJzaWQiOiJ3NlVDY1QxNGdlcncifX0.dQgQUYUSM99NktPe209nILDRuraegaWPIQ8G7NnxE1m7CfOO2IZY3W6L23hWqCJfMStZriR6zxrFQe2h0KmjnKzTtSMfRZNXluNfN6cwgzodoChuk6Vi7rpr-2hsFGpE8zMjzkXi7pu-YjfwzzJAa3Z1qis6aAtAnrW8NqR6n6Y; T=af=QkNBQkJBJnRzPTE2MzE2Njk3MDImcHM9VkNQeEl6NS5HaDA1cE5BQTBsTGRFQS0t&d=bnMBeWFob28BZwFQMzRMNEFTQzcyT0FVWFJBS1Q0R1BQTTNIUQFhYwFBSmtqQXRONQFhbAFiZW5iNjExAXNjAWRlc2t0b3Bfd2ViAWZzAW9rTWhKWjFkbzFFcAF6egFHM1VRaEJBN0UBYQFRQUUBbGF0AXhScUxoQgFudQEw&sk=DAAF5T2irJdsNm&kt=EAAhyAcxmg7P4EO2AnwOxsM2g--~I&ku=FAAfjNt6EIag8uX0w6V_c54GRikjv3hyXlo04oqBn8CF8VLwhYcBCgi_ffcLrrSRlt8CFYp8Flf2Ec0F0E16VJjBUrnxYuaJpMPPzC1pip_.yY2Wd5fSI_BcC2ri0h7sZ20HfcJ55NF0Cvum7rddXVlVR7.agJ5PdHw4Ip9af7_Nps-~D; PH=l=en-US; B=b50gcvpeq6k85&b=4&d=Ffllbt5tYFrPn8miCffi&s=u4&i=o.QPKfXuzvCiWk9j3ii6; A1S=d=AQABBMBu_V0CEHRuHPUjNSfG76QClV-Ot-oFEgEABAJf_WDDYdxN0iMA_eMAAAcIBVGjXf4MgrIID6PkDyn17s7wolpPY94ougkBBwoBTQ&S=AQAAAhCl094lkFpfx4afIMa7LOs&j=US; SPT=d=PqFOtAis9sQhsqnmk5kEP9wZ9RuSH_7kz.xH4U..y.VyTitXSt2nmHxs8nJkjlDmzCm8kNSZZHb9GXlv.P0dgS.iV8VnecHTM_BSYPXl6YvN.5eVSQh3lZQ-&v=1; SPTB=d=TupQkn7.3MkBjp32cQP_Ltr3DnMQpUSpZXA_igZK6JlPuuGZaWVMUCdqTF9twEQ1RH0lLTL5Hiz2vj4U3vBCxB9.v8jQEM2ar91wb.aQXo8-&v=1; cmp=t=1632256093&j=0';

async function sendreq(price, pagenum = 0, posget = 'O') {
  return axios.get(baseurl(posget) + pagenum * 25, { headers: { cookie } })
    .then((res) => res.data.split('<tbody>')[1])
    .then((res) => res.split('</tbody>')[0])
    .then((res) => res.split('</td></tr>'))
    .then((out) => out.map((playerline) => {
      if (!playerline.length) return null;
      const trimfront = playerline.split('<a class="Nowrap name F-link" href="https://sports.yahoo.com/nfl/players/')[1];
      const [id, idout] = trimfront.split('" target="_blank">');
      const [name, nameout] = idout.split('</a> <span class="Fz-xxs">');
      const [team, teamout] = nameout.split(' - ');
      const [pos, posout] = teamout.split('</span> </div>\n        </div>\n        <div class=\"Grid-bind-end\">');
      const preprice = Math.round(Number(posout.split('span class=\"Fw-b\">')[1].split('</span>')[0]) * 100);
      // return [Number(id), name, teammap[team.toUpperCase()], nflpos[pos], preprice];
      const posid = (nflpos[pos] || nflpos[pos.split(',')[0]] || 0);
      return {
        id: Number(id),
        name,
        NFLTeamId: teammap[team.toUpperCase()],
        NFLPositionId: posid,
        preprice: (price ? 1100 : preprice),
        postprice: (price ? 700 : null),
      };
    }))
    .then((arr) => arr.filter((e) => e !== null))
    .then((objs) => models.NFLPlayer.bulkCreate(objs, {
      ignoreDuplicates: true,
    }))
    // eslint-disable-next-line no-console
    .catch(console.log);
}

async function scrape(price) {
  for (let i = 0; i < 20; i++) {
    // eslint-disable-next-line no-console
    console.log(i);
    // eslint-disable-next-line no-await-in-loop
    await sendreq(price, i);
  }
  await sendreq(price, 0, 'K');
}

module.exports = scrape;
