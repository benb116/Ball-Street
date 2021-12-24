const out = {
  playerTeamMap: {} as Record<string, string>, // PlayerID: TeamID
  teamPlayerMap: {} as Record<string, number[]>, // TeamID: [PlayerID]
  statObj: {} as Record<string, Record<string, string>>, // PlayerID: StatCat: Statline
  timeObj: {} as Record<string, number>, // TeamID: Timefrac
  preProjObj: {} as Record<string, number>, // PlayerID: Pregame projection
  injObj: {} as Record<string, string | null>,
};

export default out;
