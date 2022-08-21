import InjuryUpdateMessage from './injuryUpdate.message';
import LeaderUpdateMessage from './leaderUpdate.message';
import OfferCancelledMessage from './offerCancelled.message';
import PhaseChangeMessage from './phaseChange.message';
import PriceUpdateMessage from './priceUpdate.message';
import StatUpdateMessage from './statUpdate.message';
import ProtectedMatchMessage from './protectedMatch.message';
import OfferFilledMessage from './offerFilled.message';

type MessageType =
  InjuryUpdateMessage |
  LeaderUpdateMessage |
  OfferCancelledMessage |
  PhaseChangeMessage |
  PriceUpdateMessage |
  ProtectedMatchMessage |
  StatUpdateMessage | 
  OfferFilledMessage;

export default MessageType;
