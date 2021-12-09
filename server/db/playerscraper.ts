/* eslint-disable no-console */
/* eslint-disable no-useless-escape */

// Pull player data from an API
import axios from 'axios';
import { RosterPosTypes } from '../config';
import { NFLPlayer } from '../models';
import teams from '../nflinfo';
import secret from '../secret';

const baseurl = (posget: string, weeknum: number) => `https://football.fantasysports.yahoo.com/f1/316236/players?status=ALL&pos=${posget}&cut_type=9&stat1=S_PW_${weeknum}&myteam=1&sort=PTS&sdir=1&count=`;
const cookie = secret.yahooCookie;
let currentweek = 3;

// Pull player info
// If price, include constant pre- and post-prices
async function scrape(price = false) {
  currentweek = Number(process.env.WEEK);
  // Set all existing player records to inactive, will update if duplicated
  await NFLPlayer.update({ active: false }, { where: { active: true } });

  for (let i = 0; i < 20; i++) {
    console.log(i);
    // Don't overload yahoo
    // Gets all offensive players
    // i = page number
    // eslint-disable-next-line no-await-in-loop
    await sendreq(price, i);
  }
  // Get kickers and defensive players
  await sendreq(price, 0, 'K');
  await sendreq(price, 1, 'K');
  await sendreq(price, 0, 'DEF');
  await sendreq(price, 1, 'DEF');
  console.log('done');
}

// Pull one page of players
async function sendreq(price: boolean, pagenum = 0, posget = 'O') {
  // Send request
  return axios.get(baseurl(posget, currentweek) + pagenum * 25, { headers: { cookie } })
  // Clean up HTML response
    .then((res) => res.data.split('<tbody>')[1])
    .then((res) => res.split('</tbody>')[0])
    .then((res) => res.split('</td></tr>'))
    .then((out) => out.filter((o: string) => o.length))
    .then((out) => out.map((playerline: string) => {
      // Pull out info
      const term = (posget === 'DEF' ? 'teams' : 'players');
      const trimfront = playerline.split(`<a class="Nowrap name F-link" href="https://sports.yahoo.com/nfl/${term}/`)[1];
      const [id, idout] = trimfront.split('" target="_blank">');
      const [name, nameout] = idout.split('</a> <span class="Fz-xxs">');
      const [team, teamout] = nameout.split(' - ');
      const [pos, posout] = teamout.split('</span> </div>\n        </div>\n        <div class=\"Grid-bind-end\">');
      const posid = (RosterPosTypes[pos]?.id || RosterPosTypes[pos.split(',')[0]].id || 0); // Could be WR,RB
      const preprice = Math.round(Number(posout.split('span class=\"Fw-b\">')[1].split('</span>')[0]) * 100);
      const injout = posout.split('abbr class="F-injury"');
      let injuryStatus = null;
      if (injout.length === 2) {
        // eslint-disable-next-line prefer-destructuring
        injuryStatus = injout[1].split('>')[1].split('<')[0];
        if (['P', 'Q', 'D'].indexOf(injuryStatus) === -1) injuryStatus = 'O';
      }
      // Player object that will be added to DB
      return {
        id: (posget === 'DEF' ? teams[team.toUpperCase()].id : Number(id)),
        name,
        NFLTeamId: teams[team.toUpperCase()].id,
        NFLPositionId: posid,
        preprice: (price ? 1100 : preprice),
        postprice: (price ? 700 : 0),
        active: true,
        injuryStatus,
      };
    }))
    // If player exists in DB, overwrite certain properties
    .then((objs) => NFLPlayer.bulkCreate(objs, { updateOnDuplicate: ['preprice', 'postprice', 'NFLTeamId', 'active', 'injuryStatus'] }));
}

export default scrape;
