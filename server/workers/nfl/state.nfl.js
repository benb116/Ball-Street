function nflState() {
  this.playerIDMap = {}; // YahooID: PlayerName
  this.IDPlayerMap = {}; // PlayerName: BallStreetID
  this.playerTeamMap = {}; // YahooID: YahooTeamID
  this.statObj = {}; // BallStreetID: StatCat: Statline
  this.timeObj = {}; // BallStreetID: Timefrac
  this.preProjObj = {}; // BallStreetID: Pregame projection
  return this;
}

const out = nflState();

module.exports = out;
