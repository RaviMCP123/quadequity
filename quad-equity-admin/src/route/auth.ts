import { FC } from "react";
import SignIn from "@pages/AuthPages/SignIn";
import ForgotPassword from "@pages/AuthPages/ForgotPassword";
import Verification from "@pages/AuthPages/verification";
import ResetPassword from "@pages/AuthPages/ResetPassword";

interface RouteConfig {
  path: string;
  title: string;
  component: FC;
}

const authRoute: RouteConfig[] = [
  { path: "/signin", component: SignIn, title: "Signin" },
  { path: "/forgot-password", component: ForgotPassword, title: "Signin" },
  { path: "/verification", component: Verification, title: "Verification" },
  { path: "/reset-password", component: ResetPassword, title: "ResetPassword" },
];

export default authRoute;
