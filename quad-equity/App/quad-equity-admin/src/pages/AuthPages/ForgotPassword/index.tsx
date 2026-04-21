import React from "react";
import PageMeta from "@components/common/PageMeta";
import AuthLayout from "@pages/Layout/Auth";
import Form from "./form";

const ForgotPassword: React.FC = () => {
  return (
    <>
      <PageMeta title="ForgotPassword" />
      <AuthLayout>
        <Form />
      </AuthLayout>
    </>
  );
};

export default ForgotPassword;
