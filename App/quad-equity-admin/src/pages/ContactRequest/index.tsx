import React, { useMemo, useState } from "react";
import { Flex, Skeleton, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import PageBreadcrumb from "@components/common/PageBreadCrumb";
import PageMeta from "@components/common/PageMeta";
import IconButton from "@components/Table/IconButton";
import { useGetContactRequestsQuery } from "@services/contactRequestApi";
import type { ContactRequest } from "interface/contactRequest";
import { PAGE_LIMIT } from "@utils/constant/common";
import { useTranslation } from "react-i18next";

function formatDateTime(value: unknown): string {
  if (value == null || value === "") return "";
  let d: Date;
  if (typeof value === "object" && value !== null && "$date" in value) {
    d = new Date(String((value as { $date: string }).$date));
  } else {
    d = new Date(String(value));
  }
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function fullName(record: ContactRequest): string {
  const first = (record.firstName ?? "").trim();
  const last = (record.lastName ?? "").trim();
  return [first, last].filter(Boolean).join(" ") || "—";
}

const ContactRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_LIMIT);

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort: "createdAt",
      direction: "desc",
    }),
    [page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useGetContactRequestsQuery(
    queryParams,
  );

  const rows = data?.data?.results ?? [];
  const total = data?.data?.pagination?.total ?? 0;

  /** Equal column widths so Message does not stretch and leave a large gap before Date. */
  const colWidth = 192;
  const tableScrollX = colWidth * 5;

  const columns: ColumnsType<ContactRequest> = [
    {
      title: "Name",
      key: "name",
      width: colWidth,
      ellipsis: true,
      render: (_, record) => fullName(record),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: colWidth,
      ellipsis: true,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: colWidth,
      ellipsis: true,
    },
    {
      title: "Message",
      dataIndex: "comments",
      key: "comments",
      width: colWidth,
      ellipsis: { showTitle: true },
    },
    {
      title: "Date and time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: colWidth,
      ellipsis: true,
      render: (v: unknown) => formatDateTime(v),
    },
  ];

  return (
    <>
      <PageMeta title={t("sidebar.contactRequests")} />
      <PageBreadcrumb pageTitle={t("sidebar.contactRequests")} />
      <div className="min-h-[calc(100vh-186px)] overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.03] md:px-6 md:py-6">
        <Flex justify="space-between" align="center" className="mb-4">
          <Typography.Title level={4} className="!mb-0">
            {t("sidebar.contactRequests")}
          </Typography.Title>
          <IconButton
            handleButtonAction={() => void refetch()}
            title={isFetching ? "Refreshing…" : "Refresh"}
            icon={<ReloadOutlined />}
          />
        </Flex>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Table<ContactRequest>
            tableLayout="fixed"
            rowKey={(r) => r._id ?? r.id ?? `${r.email}-${r.createdAt}`}
            columns={columns}
            dataSource={rows}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            scroll={{ x: tableScrollX }}
          />
        )}
      </div>
    </>
  );
};

export default ContactRequestPage;
