import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UploadProgressState {
  percent: number;
}

const initialState: UploadProgressState = {
  percent: 0,
};

const uploadProgressSlice = createSlice({
  name: "uploadProgress",
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.percent = action.payload;
    },
    resetUploadProgress: (state) => {
      state.percent = 0;
    },
  },
});

export const { setUploadProgress, resetUploadProgress } =
  uploadProgressSlice.actions;

export default uploadProgressSlice.reducer;
