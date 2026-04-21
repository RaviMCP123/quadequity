import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AssetState {
  request: { id: string; title: string; f_id: string };
}

const initialState: AssetState = {
  request: { id: '', title: '', f_id: '' },
};

const requestSlice = createSlice({
  name: 'requestSlice',
  initialState,
  reducers: {
    setRequestData(state, action: PayloadAction<{ id: string; title: string; f_id: string }>) {
      state.request = action.payload;
    },
  },
});

export const { setRequestData } = requestSlice.actions;
export default requestSlice.reducer;
