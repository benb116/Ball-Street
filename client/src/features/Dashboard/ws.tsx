import { store } from '../../app/store';

import type MessageType from '../../../../types/messages';

import { setPhase, updatePrices, setInjury } from './Players/Players.slice';
import { removeOffer, alertProtMatch } from './Offers/Offers.slice';
import { offerFilled } from './Entry/Entry.slice';
import { updateLeaders } from './Leaderboard/Leaderboard.slice';
import API from '../../helpers/api';

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
    const msg = JSON.parse(event.data) as MessageType;
    if (msg.event === 'offerFilled') {
      store.dispatch(removeOffer(msg.offerID));
      store.dispatch(offerFilled());
      store.dispatch(API.util.invalidateTags(['Roster', 'Trades']));
    }
    if (msg.event === 'offerCancelled') store.dispatch(removeOffer(msg.offerID));
    if (msg.event === 'protectedMatch') store.dispatch(alertProtMatch(msg));
    if (msg.event === 'leaderboard') store.dispatch(updateLeaders(msg.leaderboard));
    if (msg.event === 'phaseChange') {
      store.dispatch(setPhase(msg.phase));
      if (msg.phase.gamePhase === 'post') {
        store.dispatch(API.util.invalidateTags(['Roster', 'Trades']));
      }
    }
    if (msg.event === 'priceUpdate') store.dispatch(updatePrices(Object.values(msg.pricedata)));
    if (msg.event === 'statUpdate') store.dispatch(updatePrices(Object.values(msg.pricedata)));
    if (msg.event === 'injuryUpdate') store.dispatch(setInjury(msg.update));
  });

  socket.addEventListener('close', () => {
    setTimeout(() => {
      initWS(contestID);
    }, 2000);
  });

  socket.addEventListener('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Socket encountered error: ', err, 'Closing socket');
    socket.close();
  });
};

export default initWS;
