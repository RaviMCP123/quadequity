import React, { useMemo, useRef, useState } from "react";
import { JSX } from "react/jsx-runtime";
import { Flex, Skeleton, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
  FilterDropdownProps,
  FilterValue,
  SorterResult,
} from "antd/es/table/interface";
import type { InputRef, TableColumnType } from "antd";
import { UndoOutlined } from "@ant-design/icons";
import PageBreadcrumb from "@components/common/PageBreadCrumb";
import PageMeta from "@components/common/PageMeta";
import IconButton from "@components/Table/IconButton";
import SearchOutlinedComponent from "@components/Table/SearchOutlined";
import FilterDropdown from "@components/Table/Search";
import HighlighterFilter from "@components/Table/Highlighter";
import DateFilterDropdownComponent from "@components/Table/DateFilterDropdownComponent";
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

type DataIndex = keyof ContactRequest | "name";

const ContactRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_LIMIT);
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<ContactRequest> | null>(
    null,
  );
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0] || "");
    setSearchedColumn(dataIndex);
    setPage(1);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
    setSearchedColumn("");
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilteredInfo({});
    setSortedInfo(null);
    setSearchText("");
    setSearchedColumn("");
    setPage(1);
    setPageSize(PAGE_LIMIT);
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex,
  ): TableColumnType<ContactRequest> => ({
    filterDropdown: (props) => (
      <FilterDropdown
        {...props}
        dataIndex={String(dataIndex)}
        searchInput={searchInput as React.RefObject<InputRef>}
        handleSearch={handleSearch}
        handleReset={handleReset}
        setSearchText={setSearchText}
        setSearchedColumn={setSearchedColumn}
      />
    ),
    filterIcon: () => <SearchOutlinedComponent />,
  });

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      sort:
        typeof sortedInfo?.field === "string" ? sortedInfo.field : "createdAt",
      direction: sortedInfo?.order === "ascend" ? "asc" : "desc",
      ...(typeof filteredInfo?.name?.[0] === "string" &&
      filteredInfo.name[0].trim()
        ? { name: filteredInfo.name[0].trim() }
        : {}),
      ...(typeof filteredInfo?.createdAt?.[0] === "string" &&
      filteredInfo.createdAt[0].trim()
        ? { createdAt: filteredInfo.createdAt[0].trim() }
        : {}),
    }),
    [filteredInfo, page, pageSize, sortedInfo],
  );

  const { data, isLoading, isFetching } = useGetContactRequestsQuery(
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
      ...getColumnSearchProps("name"),
      filteredValue: filteredInfo?.name || null,
      render: (_, record) => {
        const value = fullName(record);
        return searchedColumn === "name" && searchText ? (
          <HighlighterFilter search={[searchText]} text={value} />
        ) : (
          value
        );
      },
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
      filterDropdown: (
        props: JSX.IntrinsicAttributes & FilterDropdownProps,
      ) => <DateFilterDropdownComponent {...props} />,
      filteredValue: filteredInfo?.createdAt || null,
      sorter: true,
      sortOrder:
        sortedInfo?.columnKey === "createdAt" ? sortedInfo.order : null,
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
            handleButtonAction={handleResetFilters}
            title={
              isFetching ? "Loading…" : "Reset filters"
            }
            icon={<UndoOutlined />}
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
            onChange={(pagination, filters, sorter) => {
              setFilteredInfo(filters as Record<string, FilterValue | null>);
              setSortedInfo(sorter as SorterResult<ContactRequest>);
              setPage(pagination.current ?? 1);
              setPageSize(pagination.pageSize ?? PAGE_LIMIT);
            }}
          />
        )}
      </div>
    </>
  );
};

export default ContactRequestPage;
