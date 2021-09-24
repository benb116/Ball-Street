function nflState() {
  this.playerTeamMap = {}; // PlayerID: TeamID
  this.teamPlayerMap = {}; // TeamID: [PlayerID]
  this.statObj = {}; // PlayerID: StatCat: Statline
  this.timeObj = {}; // TeamID: Timefrac
  this.preProjObj = {}; // PlayerID: Pregame projection
  return this;
}

const out = nflState();

module.exports = out;
