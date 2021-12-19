const thunkReq = async function tr(thunkAPI, type, uri, body) {
  try {
    const fetchOpts = {
      method: type,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    };
    if (body) { fetchOpts.body = body; }
    const response = await fetch(uri, fetchOpts);
    const data = await response.json();

    if (response.status === 200) {
      return data;
    }
    return thunkAPI.rejectWithValue((data.error || data || 'Unknown error'));
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response.data || e);
  }
};

export default thunkReq;
