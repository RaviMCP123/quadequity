import React from "react";
import PageMeta from "@components/common/PageMeta";
import AuthLayout from "@pages/Layout/Auth";
import Form from "./form";

const SignIn: React.FC = () => {
  return (
    <>
      <PageMeta title="Sign in — Quad Equity CMS" />
      <AuthLayout>
        <Form />
      </AuthLayout>
    </>
  );
};

export default SignIn;
