const out = {
  playerTeamMap: {}, // PlayerID: TeamID
  teamPlayerMap: {}, // TeamID: [PlayerID]
  statObj: {}, // PlayerID: StatCat: Statline
  timeObj: {}, // TeamID: Timefrac
  preProjObj: {}, // PlayerID: Pregame projection
  injObj: {},
  timeObj: {} as Record<string, number>, // TeamID: Timefrac
};

export default out;
