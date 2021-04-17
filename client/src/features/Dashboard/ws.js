import { useSelector, useDispatch } from 'react-redux';
import { playerMapSelector, updatePrice } from './Players/PlayersSlice';
import { removeOffer } from './Offers/OffersSlice';
import { useParams } from 'react-router-dom';
import store from '../../app/store';
import { updateRoster } from './Entry/EntrySlice';

const socket = new WebSocket('ws://localhost:8080');

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({contestID: 3}));
});

// Listen for messages
socket.addEventListener('message', function (event) {
    // console.log('Message from server ', event.data);
    const msg = JSON.parse(event.data);
    if (Array.isArray(msg)) {
        msg.filter(u => u).forEach(markPrice);
    } else {
        switch (msg.event) {
            case 'offerFilled':
                fillOffer(msg.offerID);
                upRost();
                break;
            case 'protectedMatch':
                break;
            case 'priceUpdate':
                const msgs = Object.values(msg.pricedata);
                msgs.forEach(markPrice);
                break;
            default:
                break;
        }

    }
});

function markPrice(obj) {
    store.dispatch(updatePrice(obj));
}

function fillOffer(oid) {
    store.dispatch(removeOffer(oid));
}

function upRost() {
    store.dispatch(updateRoster());
}