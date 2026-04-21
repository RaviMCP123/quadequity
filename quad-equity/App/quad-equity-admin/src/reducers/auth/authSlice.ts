import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NavigateFunction } from "react-router-dom";
import { UserInterface, AuthInterface } from "interface/auth";
import type { User } from "interface/user";
import { ApiResponse } from "interface/login/index";
import type { AppDispatch } from "store";
import { showLoading, hideLoading } from "../loading/loadingSlice";
import * as API from "@utils/apiPath";
import agent from "@utils/agent";
import { setUserProfile, logout } from "../user/userSlice";

const initialState: UserInterface = {
  isLoggedIn: false,
  requestBody: {
    username: "",
    password: "",
    remember_me: false,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setRequestBody: (state, action: PayloadAction<AuthInterface>) => {
      state.requestBody = action.payload;
    },
    setAccountLogin: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
  },
});

/** Quad Equity API wraps payloads as `{ statusCode, message, data }`. */
type ApiEnvelope<T> = { statusCode?: number; message?: string; data: T };

export const loginAccount =
  (params: AuthInterface, navigate: NavigateFunction) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(showLoading());
      const response = await agent.post<ApiEnvelope<User>>(
        API.ADMIN_ACCOUNT_LOGIN,
        {
          username: params.username,
          password: params.password,
        },
      );
      localStorage.setItem("authToken", response.data.data.accessToken);
      localStorage.setItem("refreshToken", response.data.data.refreshToken);
      dispatch(setUserProfile(response.data.data));
      dispatch(setAccountLogin(true));
      if (params.remember_me) {
        dispatch(setRequestBody(params));
      } else {
        dispatch(setRequestBody({}));
      }
      navigate("/dashboard");
      dispatch(hideLoading());
    } catch {
      dispatch(hideLoading());
    }
  };

export const forgotPassword =
  (params: AuthInterface, navigate: NavigateFunction) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(showLoading());
      await agent.post<ApiResponse>(API.ADMIN_FORGOT_PASSWORD, params);
      dispatch(setRequestBody(params));

      navigate("/verification");
      dispatch(hideLoading());
    } catch {
      dispatch(hideLoading());
    }
  };

export const resendOtp =
  (params: AuthInterface) => async (dispatch: AppDispatch) => {
    try {
      dispatch(showLoading());
      await agent.post<ApiResponse>(API.ADMIN_FORGOT_PASSWORD, params);
      dispatch(setRequestBody(params));

      dispatch(hideLoading());
    } catch {
      dispatch(hideLoading());
    }
  };

export const verifyOtp =
  (params: AuthInterface, navigate: NavigateFunction) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(showLoading());
      await agent.post<ApiResponse>(API.VERIFY_OTP, params);
      dispatch(setRequestBody(params));
      navigate("/reset-password");
      dispatch(hideLoading());
    } catch {
      dispatch(hideLoading());
    }
  };

export const updatePassword =
  (params: AuthInterface, navigate: NavigateFunction) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(showLoading());
      await agent.post<ApiResponse>(API.ADMIN_RESET_PASSWORD, params);
      dispatch(setRequestBody(params));
      navigate("/");
      dispatch(hideLoading());
    } catch {
      dispatch(hideLoading());
    }
  };

/** Reload session from API after refresh (Bearer + CryptoGuard headers via agent). */
export const restoreSession = () => async (dispatch: AppDispatch) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return;
  }
  try {
    const response = await agent.get<ApiEnvelope<User>>(API.GET_PROFILE);
    dispatch(setUserProfile(response.data.data));
    dispatch(setAccountLogin(true));
  } catch {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    dispatch(setAccountLogin(false));
    dispatch(logout());
  }
};

export const logoutAccount = () => async (dispatch: AppDispatch) => {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    dispatch(setAccountLogin(false));
    dispatch(logout());
  } catch {
    /* empty */
  }
};

export const { setRequestBody, setAccountLogin } = authSlice.actions;
export default authSlice.reducer;
