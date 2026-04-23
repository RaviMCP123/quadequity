import React from "react";
import PageMeta from "@components/common/PageMeta";
import AuthLayout from "@pages/Layout/Auth";
import Form from "./form";

const ForgotPassword: React.FC = () => {
  return (
    <>
      <PageMeta title="Forgot Password — Quad Equity CMS" />
      <AuthLayout>
        <Form />
      </AuthLayout>
    </>
  );
};

export default ForgotPassword;
