module.exports = async function(thunkAPI, type, uri, body) {
  console.log(type, uri, body);
  try {
    const fetchOpts = {
      method: type,
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      credentials: 'same-origin',
    };
    if (body) { fetchOpts.body = body; }
    const response = await fetch(uri, fetchOpts);

    if (response.status === 200) {
      let data = await response.json();
      return data;
    } else {
      console.log(response);
      return thunkAPI.rejectWithValue(response);
    }
  } catch (e) {
    console.log('Error', e);
    return thunkAPI.rejectWithValue(e.response.data);
  }
};