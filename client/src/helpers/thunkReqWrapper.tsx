const thunkReq = async function tr(thunkAPI, type: string, uri: string, body: Record<string, any> | null = null) {
  try {
    const response = await fetch(uri, {
      method: type,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    });
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
