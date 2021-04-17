import thunkReq from "../../helpers/thunkReqWrapper";

const signupfunc = async({ name, email, password }, thunkAPI) => {
  return thunkReq(thunkAPI, 'POST', '/app/auth/signup', JSON.stringify({ name, email, password }));
};

const loginfunc = async({ email, password }, thunkAPI) => {
  return thunkReq(thunkAPI, 'POST', '/app/auth/login', JSON.stringify({ email, password }));
};

const logoutfunc = async(body, thunkAPI) => thunkReq(thunkAPI, 'DELETE', '/app/auth/logout');

const accountfunc = async(body, thunkAPI) => thunkReq(thunkAPI, 'GET', '/app/auth/account');

export {
  signupfunc,
  loginfunc,
  logoutfunc,
  accountfunc,
};