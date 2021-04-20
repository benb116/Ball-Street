import thunkReq from '../../helpers/thunkReqWrapper';

function accountfunc(body, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/auth/account');
}

function signupfunc({ name, email, password }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', '/app/auth/signup', JSON.stringify({ name, email, password }));
}
function loginfunc({ email, password }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', '/app/auth/login', JSON.stringify({ email, password }));
}
function logoutfunc(body, thunkAPI) {
  return thunkReq(thunkAPI, 'DELETE', '/app/auth/logout');
}

export {
  accountfunc,
  signupfunc,
  loginfunc,
  logoutfunc,
};
