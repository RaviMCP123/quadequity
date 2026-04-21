import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState, User } from "interface/user";

const initialState: UserState = {
  user: null,
};
const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    setUserProfile(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export const { setUserProfile, logout } = userSlice.actions;
export default userSlice.reducer;
