/* eslint-disable no-useless-escape */
// Pull player data from an API
const axios = require('axios');
const models = require('../models');
const secret = require('../secret');
const { rediskeys, get } = require('./redis');

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

const baseurl = (posget, weeknum) => `https://football.fantasysports.yahoo.com/f1/316236/players?status=ALL&pos=${posget}&cut_type=9&stat1=S_PW_${weeknum}&myteam=1&sort=PTS&sdir=1&count=`;
const cookie = secret.yahooCookie;
let currentweek = 3;

async function sendreq(price, pagenum = 0, posget = 'O') {
  return axios.get(baseurl(posget, currentweek) + pagenum * 25, { headers: { cookie } })
    .then((res) => res.data.split('<tbody>')[1])
    .then((res) => res.split('</tbody>')[0])
    .then((res) => res.split('</td></tr>'))
    .then((out) => out.map((playerline) => {
      if (!playerline.length) return null;
      const term = (posget === 'DEF' ? 'teams' : 'players');
      const trimfront = playerline.split(`<a class="Nowrap name F-link" href="https://sports.yahoo.com/nfl/${term}/`)[1];
      const [id, idout] = trimfront.split('" target="_blank">');
      const [name, nameout] = idout.split('</a> <span class="Fz-xxs">');
      const [team, teamout] = nameout.split(' - ');
      const [pos, posout] = teamout.split('</span> </div>\n        </div>\n        <div class=\"Grid-bind-end\">');
      const posid = (nflpos[pos] || nflpos[pos.split(',')[0]] || 0);
      const preprice = Math.round(Number(posout.split('span class=\"Fw-b\">')[1].split('</span>')[0]) * 100);
      return {
        id: (posget === 'DEF' ? teammap[team.toUpperCase()] : Number(id)),
        name,
        NFLTeamId: teammap[team.toUpperCase()],
        NFLPositionId: posid,
        preprice: (price ? 1100 : preprice),
        postprice: (price ? 700 : 0),
      };
    }))
    .then((arr) => arr.filter((e) => e !== null))
    .then((objs) => models.NFLPlayer.bulkCreate(objs, { updateOnDuplicate: ['preprice', 'postprice', 'NFLTeamId'] }))
    // eslint-disable-next-line no-console
    .catch(console.log);
}

async function scrape(price) {
  currentweek = await get.key(rediskeys.currentWeek());
  for (let i = 0; i < 20; i++) {
    // eslint-disable-next-line no-console
    console.log(i);
    // eslint-disable-next-line no-await-in-loop
    await sendreq(price, i);
  }
  await sendreq(price, 0, 'K');
  await sendreq(price, 0, 'DEF');
  await sendreq(price, 1, 'DEF');
}

module.exports = scrape;
