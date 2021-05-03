import store from '../../app/store';
import { updatePrice } from './Players/PlayersSlice';
import { removeOffer, alertProtMatch } from './Offers/OffersSlice';
import { updateRoster } from './Entry/EntrySlice';
import { updateLeaders } from './Leaderboard/LeaderboardSlice';

const initWS = (contestID) => {
  const { host } = window.location;
  let url = `ws://localhost:8080/contest/${contestID}`;
  if (!host.includes('localhost')) {
    url = `wss://${host}/ballstreetlive/contest/${contestID}`;
  }
  const socket = new WebSocket(url);

  // Connection opened
  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ contestID }));
  });

  // Listen for messages
  socket.addEventListener('message', (event) => {
    // console.log('Message from server ', event.data);
    const msg = JSON.parse(event.data);
    // let msgs;
    if (Array.isArray(msg)) {
      msg.filter((u) => u).forEach(markPrice);
    } else {
      switch (msg.event) {
        case 'offerFilled':
          fillOffer(msg.offerID);
          upRost();
          break;
        case 'protectedMatch':
          protMatch(msg);
          break;
        case 'leaderboard':
          upLead(msg.leaderboard);
          break;
        case 'priceUpdate':
        //   msgs = Object.values(msg.pricedata);
          Object.values(msg.pricedata).forEach(markPrice);
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

function markPrice(obj) {
  store.dispatch(updatePrice(obj));
}

function fillOffer(oid) {
  store.dispatch(removeOffer(oid));
}

function upRost() {
  store.dispatch(updateRoster());
}

function protMatch({ offerID, expire }) {
  store.dispatch(alertProtMatch({ offerID, expire }));
}

function upLead(board) {
  store.dispatch(updateLeaders(board));
}

export default initWS;
