const thunkReq = async function tr(thunkAPI, type: string, uri: string, body: Record<string, any> | null = null) {
  try {
    const fetchopts: RequestInit = {
      method: type,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    };
    if (body) fetchopts.body = JSON.stringify(body);
    const response = await fetch(uri, fetchopts);
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
