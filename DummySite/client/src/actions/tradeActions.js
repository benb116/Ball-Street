import axios from "axios";
import { UPDATE_USER_INFO, UPDATE_USER_OFFERS } from "../actions/types";

export const submitOffer = (contractID, buy, yes, price, quantity) => dispatch => {
    console.log('11');
    return axios.post('/api/trade/', {
      contractID: contractID,
      buy: buy,
      yes: yes,
      price: price,
      quantity: quantity,
    })
    .then(res => {
        dispatch(updateUserInfo(res.data));
    });
    // dispatch a state update
    // actions for new shares, new offers, new balance
    // reducer for all
};

export const cancelOffer = (offerID) => dispatch => {
    console.log('1122');
    return axios.delete('/api/offers/cancel/'+offerID,)
    .then(res => {
        dispatch(updateOffers(res.data));
    });
    // dispatch a state update
    // actions for new shares, new offers, new balance
    // reducer for all
};



// Set logged in user
export const updateUserInfo = traderesp => {
  return {
    type: UPDATE_USER_INFO,
    payload: traderesp
  };
};

export const updateOffers = offerCancel => {
  return {
    type: UPDATE_USER_OFFERS,
    payload: offerCancel
  };
};