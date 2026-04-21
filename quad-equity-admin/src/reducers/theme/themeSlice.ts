import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ThemeState } from "../../interface/common";

const initialState: ThemeState = {
  theme: "dark",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<string>) {
      state.theme = action.payload;
    },
  },
});

export const { setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
