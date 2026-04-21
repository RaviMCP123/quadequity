import React from "react";
import PageMeta from "@components/common/PageMeta";
import AuthLayout from "@pages/Layout/Auth";
import Form from "./form";

const ResetPassword: React.FC = () => {
  return (
    <>
      <PageMeta title="ResetPassword" />
      <AuthLayout>
        <Form />
      </AuthLayout>
    </>
  );
};

export default ResetPassword;
