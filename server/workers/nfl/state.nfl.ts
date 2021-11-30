function nflState() {
  this.playerTeamMap = {}; // PlayerID: TeamID
  this.teamPlayerMap = {}; // TeamID: [PlayerID]
  this.statObj = {}; // PlayerID: StatCat: Statline
  this.timeObj = {}; // TeamID: Timefrac
  this.preProjObj = {}; // PlayerID: Pregame projection
  this.injObj = {};
  return this;
}

const out = nflState();

export default out;
