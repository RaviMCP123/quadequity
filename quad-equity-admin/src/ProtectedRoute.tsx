import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "./store";

const ProtectedRoute: React.FC = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state.authReducer);
  return isLoggedIn ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;
