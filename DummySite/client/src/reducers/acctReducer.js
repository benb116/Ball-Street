import { SET_USER_INFO, CLEAR_USER_INFO, UPDATE_USER_INFO, UPDATE_USER_OFFERS } from "../actions/types";
const isEmpty = require("is-empty");

const initialState = {
  balance: 0,
  yesShares: [],
  noShares: [],
  offers: [],
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_USER_INFO:
      return {
        ...state,
        ...action.payload
      };
    case CLEAR_USER_INFO:
      return initialState;
    case UPDATE_USER_INFO:
      console.log('obj');
      let out = {...state};
      if (action.payload.balance !== null) { out.balance = action.payload.balance; }
      if (action.payload.filled.length) { 
        const newY = action.payload.filled.filter(f => f.yes).map(f => {
          if (!f.buy) { f.quantity = f.quantity * -1; }
          return f;
        });
        const newN = action.payload.filled.filter(f => !f.yes).map(f => {
          if (!f.buy) { f.quantity = f.quantity * -1; }
          return f;
        });
        const allY = state.yesShares.concat(newY);
        const allN = state.noShares.concat(newN);
        out.yesShares = expandShares(collapseShares(allY));
        out.noShares = expandShares(collapseShares(allN));
      }
      if (!isEmpty(action.payload.created)) { out.offers.push(action.payload.created); }  

      return out;
    case UPDATE_USER_OFFERS:
      out = {...state};
      if (action.payload.cancelled) {
        out.offers = out.offers.filter(o => o.offerID !== action.payload.offerID);
      }
      return out;
    default:
      return state;
  }
}

const collapseShares = function(sharesArray) {
    return sharesArray.reduce((acc, cur, i) => {
        const cID = cur.contractID;
        acc[cID] = (acc[cID] + cur.quantity) || cur.quantity;
        return acc;
    }, {});
};

const expandShares = function(sharesObj) {
    return Object.keys(sharesObj).map((cID) => {
        return {
            contractID: cID,
            quantity: sharesObj[cID]
        };
    });
};