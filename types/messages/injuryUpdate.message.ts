type InjuryUpdateType = Record<number, string | null>

interface InjuryUpdateMessage {
  event: 'injuryUpdate',
  update: InjuryUpdateType,
}

export default InjuryUpdateMessage;
