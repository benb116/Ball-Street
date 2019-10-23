import { combineReducers } from "redux";
import authReducer from "./authReducer";
import acctReducer from "./acctReducer";
import errorReducer from "./errorReducer";
// import tradeReducer from "./tradeReducer";

export default combineReducers({
  auth: authReducer,
  userInfo: acctReducer,
  errors: errorReducer,
});

