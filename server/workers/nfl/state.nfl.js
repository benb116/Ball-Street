function nflState() {
  this.playerIDMap = {}; // YahooID: PlayerName
  this.IDPlayerMap = {}; // PlayerName: BallStreetID
  this.playerTeamMap = {}; // YahooID: YahooTeamID
  this.statObj = {}; // YahooID: StatCat: Statline
  this.timeObj = {}; // YahooTeamID: Timefrac
  this.preProjObj = {}; // BallStreetID: Pregame projection
  return this;
}

const out = nflState();

module.exports = out;
