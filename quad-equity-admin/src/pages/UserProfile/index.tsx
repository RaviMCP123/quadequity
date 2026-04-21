import React from "react";
import PageBreadcrumb from "@components/common/PageBreadCrumb";
import PageMeta from "@components/common/PageMeta";
import { useGetProfileQuery } from "@services/userApi";
import UserMetaCard from "./userMetaCard";
import UserInfoCard from "./UserInfoCard";
import UserPasswordCard from "./UserPasswordCard";

const UserProfiles: React.FC = () => {
  const { data, refetch } = useGetProfileQuery();
  const user = data?.data;

  return (
    <>
      <PageMeta title="Profile" />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {user && (
          <div className="space-y-6">
            <UserMetaCard user={user} refetch={refetch} />
            <UserInfoCard user={user} refetch={refetch} />
            <UserPasswordCard />
          </div>
        )}
      </div>
    </>
  );
};

export default UserProfiles;
