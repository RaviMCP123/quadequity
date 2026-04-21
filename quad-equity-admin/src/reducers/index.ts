import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import themeReducer from "./theme/themeSlice";
import loadingReducer from "./loading/loadingSlice";
import userReducer from "./user/userSlice";
import filterReducer from "./filter/filterSlice";
import progressReducer from "./progress/progressSlice";
import { baseApi } from "@services/baseApi";

const rootReducer = combineReducers({
  theme: themeReducer,
  authReducer: authReducer,
  loading: loadingReducer,
  user: userReducer,
  saveFilter: filterReducer,
  progress: progressReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export default rootReducer;
