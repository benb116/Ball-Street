const signupfunc = async ({ name, email, password }, thunkAPI) => {
  try {
    const response = await fetch('/app/auth/signup', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      credentials: 'same-origin',
      body: JSON.stringify({ name, email, password, }),
    });
    let data = await response.json();

    if (response.status === 200) {
      return { ...data, name: name, email: email };
    } else {
      return thunkAPI.rejectWithValue(data);
    }
  } catch (e) {
    console.log('Error', e.response.data);
    return thunkAPI.rejectWithValue(e.response.data);
  }
};

const loginfunc = async ({ email, password }, thunkAPI) => {
  console.log('loginfunc');
  try {
    const response = await fetch('/app/auth/login', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password, }),
    });
    let data = await response.json();

    if (response.status === 200) {
      return { ...data, email: email };
    } else {
      return thunkAPI.rejectWithValue(data);
    }
  } catch (e) {
    console.log('Error', e.response.data);
    thunkAPI.rejectWithValue(e.response.data);
  }
};

const logoutfunc = async ({ email, password }, thunkAPI) => {
  console.log('logout');
  try {
    const response = await fetch('/app/auth/logout', {
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      credentials: 'same-origin',
    });
    let data = await response.json();

    if (response.status === 200) {
      return data;
    } else {
      return thunkAPI.rejectWithValue(data);
    }
  } catch (e) {
    console.log('Error', e.response.data);
    thunkAPI.rejectWithValue(e.response.data);
  }
};

const accountfunc = async (thunkAPI) => {
  console.log('332');
  try {
    const response = await fetch('/app/auth/account', {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      credentials: 'same-origin',
    });
    console.log(response);
    let data = await response.json();

    if (response.status === 200) {
      return { ...data };
    } else {
      return thunkAPI.rejectWithValue(data);
    }
  } catch (e) {
    console.log('Error', e.response.data);
    return thunkAPI.rejectWithValue(e.response.data);
  }
};

module.exports = {
  signupfunc,
  loginfunc,
  logoutfunc,
  accountfunc,
};