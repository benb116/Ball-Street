import { store } from '../../app/store';
import { setPhase, updatePrices, setInjury } from './Players/PlayersSlice';
import { removeOffer, alertProtMatch } from './Offers/OffersSlice';
import { offerFilled, updateRoster } from './Entry/EntrySlice';
import { updateLeaders } from './Leaderboard/LeaderboardSlice';
import { updateTrades } from './Trades/TradesSlice';
import { LeaderItemType } from '../types';

// Init WS connection and dispatch actions based on events
const initWS = (contestID: string) => {
  const { host } = window.location;
  let url = `ws://localhost/ballstreetlive/contest/${contestID}`;
  if (!host.includes('localhost')) {
    url = `wss://${host}/ballstreetlive/contest/${contestID}`;
  }
  const socket = new WebSocket(url);

  // Listen for messages
  socket.addEventListener('message', (event) => {
    // console.log('Message from server ', event.data);
    const msg = JSON.parse(event.data);
    if (Array.isArray(msg)) {
      msg.filter((u) => u).forEach(markPrice);
    } else {
      switch (msg.event) {
        case 'offerFilled':
          delOffer(msg.offerID);
          fillOffer();
          upRost();
          break;
        case 'offerCancelled':
          delOffer(msg.offerID);
          break;
        case 'protectedMatch':
          protMatch(msg);
          break;
        case 'leaderboard':
          upLead(msg.leaderboard);
          break;
        case 'phaseChange':
          newPhase(msg.phase);
          if (msg.phase.gamePhase === 'post') {
            upRost();
          }
          break;
        case 'priceUpdate':
          markPrice(Object.values(msg.pricedata));
          break;
        case 'statUpdate':
          markPrice(Object.values(msg.pricedata));
          break;
        case 'injuryUpdate':
          markInjury(msg.update);
          break;
        default:
          break;
      }
    }
  });

  socket.addEventListener('close', () => {
    setTimeout(() => {
      initWS(contestID);
    }, 2000);
  });

  socket.addEventListener('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    socket.close();
  });
};

function markPrice(arr) {
  store.dispatch(updatePrices(arr));
}

function markInjury(info: Record<number, string | null>) {
  store.dispatch(setInjury(info));
}

function delOffer(oid: string) {
  store.dispatch(removeOffer(oid));
}

function fillOffer() {
  store.dispatch(offerFilled());
}

function upRost() {
  store.dispatch(updateRoster());
  store.dispatch(updateTrades());
}

function protMatch({ offerID, expire }: { offerID: string, expire: number }) {
  store.dispatch(alertProtMatch({ offerID, expire }));
}

function upLead(board: LeaderItemType[]) {
  store.dispatch(updateLeaders(board));
}

function newPhase(nphase: { nflTeamID: number, gamePhase: string, }) {
  store.dispatch(setPhase(nphase));
}

export default initWS;