import { useSelector, useDispatch } from 'react-redux';
import { playerMapSelector, updatePrice } from './Players/PlayersSlice';
import { useParams } from 'react-router-dom';
import store from '../../app/store';

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
        const msgs = Object.values(msg);
        msgs.forEach(markPrice);
    }
});

function markPrice(obj) {
    store.dispatch(updatePrice(obj));
}