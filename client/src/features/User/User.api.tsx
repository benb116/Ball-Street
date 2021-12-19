import thunkReq from '../../helpers/thunkReqWrapper';

function accountfunc(body, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/auth/account');
}

function signupfunc({
  name, email, password, skipVerification,
}, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', '/app/auth/signup', JSON.stringify({
    name, email, password, skipVerification,
  }));
}

function forgotfunc({ email }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', '/app/auth/forgot', JSON.stringify({ email }));
}

function resetfunc({ token, password, confirmPassword }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', '/app/auth/resetPasswordToken', JSON.stringify({ token, password, confirmPassword }));
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
  forgotfunc,
  resetfunc,
  loginfunc,
  logoutfunc,
};
