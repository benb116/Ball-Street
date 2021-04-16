const thunkReq = async function(thunkAPI, type, uri, body) {
  console.log(type, uri, body);
  try {
    const fetchOpts = {
      method: type,
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      credentials: 'same-origin',
    };
    if (body) { fetchOpts.body = body; }
    const response = await fetch(uri, fetchOpts);
    const data = await response.json();

    if (response.status === 200) {
      return data;
    } else {
      return thunkAPI.rejectWithValue((data.error || data));
    }
  } catch (e) {
    console.log('Error', e);
    return thunkAPI.rejectWithValue(e.response.data);
  }
};

export default thunkReq;
