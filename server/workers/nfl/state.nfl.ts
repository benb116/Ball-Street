import { TeamIDType } from '../../../types/nflinfo';

const out = {
  playerTeamMap: {} as Record<number, TeamIDType>, // PlayerID: TeamID
  teamPlayerMap: {} as Record<TeamIDType, number[]>, // TeamID: [PlayerID]
  statObj: {} as Record<string, Record<string, string>>, // PlayerID: StatCat: Statline
  timeObj: {} as Partial<Record<TeamIDType, number>>, // TeamID: Timefrac
  preProjObj: {} as Record<string, number>, // PlayerID: Pregame projection
  injObj: {} as Record<string, string | null>,
};

export default out;
