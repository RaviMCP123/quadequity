import { Middleware } from "@reduxjs/toolkit";
import { showLoading, hideLoading } from "../reducers/loading/loadingSlice";

export const apiMiddleware: Middleware =
  ({ dispatch }) =>
  (next) =>
  (action: unknown) => {
    if (
      typeof action === "object" &&
      action !== null &&
      "type" in action &&
      typeof (action as { type: string }).type === "string"
    ) {
      if ((action as { type: string }).type.endsWith("/pending")) {
        dispatch(showLoading());
      }
      if (
        (action as { type: string }).type.endsWith("/fulfilled") ||
        (action as { type: string }).type.endsWith("/rejected")
      ) {
        dispatch(hideLoading());
      }
    }

    return next(action);
  };
