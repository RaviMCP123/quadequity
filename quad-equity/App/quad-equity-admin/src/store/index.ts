import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { attachReduxStore } from "@utils/agent";
import { apiMiddlewares } from "./servicesMiddlewares";
import rootReducer from "../reducers";
import "@services/pageApi";
import "@services/userApi";
import "@services/cmsCategoryApi";

const persistConfig = {
  key: "quad-equity-admin-root",
  storage,
  whitelist: ["theme", "saveFilter"],
};

const persistedRootReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(...apiMiddlewares),
});

attachReduxStore(store);

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
