import { createSlice } from "@reduxjs/toolkit";

interface LoadingState {
  isLoading: boolean;
  isButtonLoading: boolean;
}

const initialState: LoadingState = {
  isLoading: false,
  isButtonLoading: false,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    showLoading: (state) => {
      state.isLoading = true;
    },
    hideLoading: (state) => {
      state.isLoading = false;
    },
    showButtonLoading: (state) => {
      state.isButtonLoading = true;
    },
    hideButtonLoading: (state) => {
      state.isButtonLoading = false;
    },
  },
});

export const {
  showLoading,
  hideLoading,
  showButtonLoading,
  hideButtonLoading,
} = loadingSlice.actions;
export default loadingSlice.reducer;
