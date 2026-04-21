import axios from "axios";
import type { Store } from "@reduxjs/toolkit";
import showToast from "@utils/toast";
import CryptoJS from "crypto-js";
import { showLoading, hideLoading } from "@reducers/loading/loadingSlice";

/** Avoid importing `store` here — `baseApi` → `agent` → `store` creates a circular dependency at init. */
let appStore: Store | undefined;

export function attachReduxStore(store: Store): void {
  appStore = store;
}

const dispatch = (...args: Parameters<Store["dispatch"]>) => {
  appStore?.dispatch(...args);
};
const apiUrl = import.meta.env.VITE_API_URL;
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (error: Error) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

async function refreshAuthToken() {
  try {
    const { data } = await agent.post<{
      data: { accessToken: string; refreshToken: string };
    }>("/auth/refresh", {
      refreshToken: localStorage.getItem("refreshToken"),
    });
    const newToken = data.data.accessToken;
    localStorage.setItem("authToken", data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
    return newToken;
  } catch {
    setTimeout(function () {
      localStorage.removeItem("persist:quad-equity-admin-root");
      window.location.href = "/signin";
    }, 2000);
  }
}

const agent = axios.create({
  baseURL: `${apiUrl}/api/`,
  headers: {
    "Content-Type": "application/json",
    "access-control-allow-origin": "*",
    "Accept-Language": "en",
    deviceType: "web",
    Accept: "application/json",
  },
});

agent.interceptors.request.use(
  (config) => {
    const secret = import.meta.env.VITE_CRYPTO_TOKEN;
    if (!secret) {
      console.error("Missing VITE_CRYPTO_TOKEN");
      return config;
    }
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = CryptoJS.HmacSHA256(
      timestamp,
      secret
    ).toString(CryptoJS.enc.Base64);
    const xAccessToken = `${timestamp}.${signature}`;
    config.headers = config.headers || {};
    config.headers["x-access-token"] = xAccessToken;
    config.headers["deviceType"] = "web";
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }
    // Let axios set Content-Type with boundary when sending FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    dispatch(showLoading());
    return config;
  },
  (error) => {
    dispatch(hideLoading());
    return Promise.reject(error);
  }
);



agent.interceptors.response.use(
  (response) => {
    if (response.config.method !== "get") {
      const data = response?.data as { message?: string };
      const message = data?.message ?? "Something went wrong!";
      showToast(`${message}`, "success");
    }
    dispatch(hideLoading());
    return response;
  },
  async (error) => {
    dispatch(hideLoading());
    const originalRequest = error.config;
    if (error.isAxiosError && error.response?.status === 422) {
      const validationError = error.response.data;
      const errorMessage = validationError.message || "Validation failed";
      showToast(`${errorMessage}`, "error");
      return Promise.reject(errorMessage);
    }
    if (error.isAxiosError && error.response?.status === 404) {
      const validationError = error.response.data;
      const errorMessage = validationError.message || "Validation failed";
      showToast(`${errorMessage}`, "error");
      return Promise.reject(errorMessage);
    }
    if (error.isAxiosError && error.response?.status === 500) {
      const validationError = error.response.data;
      const errorMessage = validationError.message || "Validation failed";
      showToast(`${errorMessage}`, "error");
      return Promise.reject(errorMessage);
    }
    if (error.isAxiosError && error.response?.status === 403) {
      const validationError = error.response.data;
      const errorMessage = validationError.message || "Validation failed";
      showToast(`${errorMessage}`, "error");
      setTimeout(function () {
        localStorage.removeItem("persist:quad-equity-admin-root");
        window.location.href = "/signin";
      }, 3000);
      return Promise.reject(errorMessage);
    }
    if (error.isAxiosError && error.response?.status === 401) {
      if (isRefreshing && originalRequest) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return agent(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = await refreshAuthToken();
        agent.defaults.headers.common["Authorization"] = "Bearer " + token;
        originalRequest.headers["Authorization"] = "Bearer " + token;
        processQueue(null, token);
        return agent(originalRequest);
      } catch (err) {
        processQueue(err as Error, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default agent;
