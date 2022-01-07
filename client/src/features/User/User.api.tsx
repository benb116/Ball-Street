import thunkReq from '../../helpers/thunkReqWrapper';

function accountfunc(_body = {}, thunkAPI) {
  return thunkReq(thunkAPI, 'GET', '/app/auth/account');
}

function signupfunc(input: {
  name: string,
  email: string,
  password: string,
  skipVerification: boolean
}, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', '/app/auth/signup', input);
}

function forgotfunc(input: { email: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', '/app/auth/forgot', input);
}

function resetfunc(input: { token: string, password: string, confirmPassword: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', '/app/auth/resetPasswordToken', input);
}

function loginfunc(input: { email: string, password: string }, thunkAPI) {
  return thunkReq(thunkAPI, 'POST', '/app/auth/login', input);
}
function logoutfunc(_body = {}, thunkAPI) {
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
