import React from "react";
import PageMeta from "@components/common/PageMeta";
import AuthLayout from "@pages/Layout/Auth";
import Form from "./form";

const Verification: React.FC = () => {
  return (
    <>
      <PageMeta title="Verification" />
      <AuthLayout>
        <Form />
      </AuthLayout>
    </>
  );
};

export default Verification;
