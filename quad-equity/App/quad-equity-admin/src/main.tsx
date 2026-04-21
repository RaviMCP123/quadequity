/** Side-effect import must stay first so license runs before any Syncfusion UI loads. */
import "./syncfusion-register";

import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import "flatpickr/dist/flatpickr.css";
import "./i18n/config";
import App from "./App.tsx";
import { AppWrapper } from "@components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { store, persistor } from "./store";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider>
        <AppWrapper>
          <App />
          <ToastContainer style={{ zIndex: 999999 }} />
        </AppWrapper>
      </ThemeProvider>
    </PersistGate>
  </Provider>
);
