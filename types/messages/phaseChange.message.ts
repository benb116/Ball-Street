type PhaseType = 'pre' | 'mid' | 'post';

interface PhaseChangeMessage {
  event: 'phaseChange',
  phase: {
    nflTeamID: number,
    gamePhase: PhaseType,
  },
}

export default PhaseChangeMessage;
