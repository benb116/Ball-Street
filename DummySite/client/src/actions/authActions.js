import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

import { GET_ERRORS, SET_CURRENT_USER, USER_LOADING, SET_USER_INFO, CLEAR_USER_INFO } from "./types";

// Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(res => history.push("/login"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// Login - get user token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      // Save to localStorage

      // Set token to localStorage
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .then(function() {
      return axios.get('/api/account');
    })
    .then((res) => {
      const userInfo = res.data;
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
      dispatch(setUserInfo(userInfo));
    })
    // .then(console.log)
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

export const pullUserInfo = () => dispatch => {
  axios.get('/api/account').then((res) => {
    const userInfo = res.data;
    console.log(userInfo);
    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
    dispatch(setUserInfo(userInfo));
  });
};

// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

export const setUserInfo = ui => {
  return {
    type: SET_USER_INFO,
    payload: ui,
  };
};

export const clearUserInfo = () => {
  return {
    type: CLEAR_USER_INFO
  };
};

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  };
};

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  sessionStorage.removeItem('userInfo');
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
  dispatch(clearUserInfo());

};
