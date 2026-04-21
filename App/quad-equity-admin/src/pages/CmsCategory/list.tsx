import React, { useRef, useState } from "react";
import { InputRef } from "antd";
import { JSX } from "react/jsx-runtime";
import type { TableColumnType } from "antd";
import type {
  FilterDropdownProps,
  FilterValue,
  SorterResult,
} from "antd/es/table/interface";
import {
  CmsCategoryTableComponentProps,
  CmsCategoryValuesInterface,
} from "interface/cmsCategory";
import { 
  useDeleteCmsCategoryMutation,
  useUpdateCmsCategoryStatusMutation 
} from "@services/cmsCategoryApi";
import { useGetPagesQuery } from "@services/pageApi";
import TableContainer from "@components/Table/TableContainer";
import SwitchComponent from "@components/Table/Switch";
import SearchOutlinedComponent from "@components/Table/SearchOutlined";
import FilterDropdown from "@components/Table/Search";
import HighlighterFilter from "@components/Table/Highlighter";
import DateFilterDropdownComponent from "@components/Table/DateFilterDropdownComponent";
import ActionFilter from "@components/Table/Action";
import { PAGE_LIMIT, STATUS_FILTER } from "@utils/constant/common";
import { formatDate } from "@utils/dateFormat";
import showToast from "@utils/toast";

type DataIndex = keyof CmsCategoryValuesInterface;

const TableComponent: React.FC<CmsCategoryTableComponentProps> = ({
  data,
  datePagination,
  onEditActionHandler,
  onPaginationActionHandler,
  filteredInfo,
  sortedInfo,
  setFilteredInfo,
  setSortedInfo,
  currentPage,
  pageSize,
  filter,
}) => {
  const [deleteCmsCategory] = useDeleteCmsCategoryMutation();
  const [updateCmsCategoryStatus] = useUpdateCmsCategoryStatusMutation();
  
  // Fetch all pages to check if categories have associated pages
  const { data: pagesData } = useGetPagesQuery(
    { page: 1, limit: 10000 } // Fetch all pages
  );
  const allPages = pagesData?.data?.results ?? [];
  
  const searchInput = useRef<InputRef>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: string
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
    setSearchedColumn("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<CmsCategoryValuesInterface> => ({
    filterDropdown: (props) => (
      <FilterDropdown
        {...props}
        dataIndex={dataIndex}
        searchInput={searchInput as React.RefObject<InputRef>}
        handleSearch={handleSearch}
        handleReset={handleReset}
        setSearchText={setSearchText}
        setSearchedColumn={setSearchedColumn}
      />
    ),
    filterIcon: () => <SearchOutlinedComponent />,
    onFilter: (value, record) => {
      const recordValue = record[dataIndex]?.toString().toLowerCase();
      return recordValue
        ? recordValue.includes((value as string).toLowerCase())
        : false;
    },
    render: (text: string) =>
      searchedColumn === dataIndex && searchText && filter ? (
        <HighlighterFilter search={[searchText]} text={text} />
      ) : (
        text
      ),
  });

  const onEditAction = (key: string) => {
    onEditActionHandler(key);
  };

  const onDeleteAction = async (key: string) => {
    await deleteCmsCategory(key);
  };

  const placementOptions = [
    { text: "Header", value: "header" },
    { text: "Footer", value: "footer" },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
      sorter: true,
      ellipsis: true,
      filteredValue: filteredInfo?.name || null,
      sortOrder: sortedInfo?.columnKey === "name" ? sortedInfo.order : null,
      render: (name: string) => <span>{name || "-"}</span>,
    },
    {
      title: "Placement",
      dataIndex: "placement",
      key: "placement",
      filters: placementOptions,
      filteredValue: filteredInfo?.placement || null,
      render: (placement: any) => {
        if (!placement) return <span>-</span>;
        const placements = Array.isArray(placement) ? placement : [placement];
        return (
          <div className="flex flex-wrap gap-1">
            {placements.map((p: any, index: number) => {
              // Handle both object format { type: "header", sortOrder: 0 } and string format "header"
              const placementType = typeof p === 'object' && p !== null && p.type 
                ? p.type 
                : typeof p === 'string' 
                  ? p 
                  : String(p);
              
              if (!placementType) return null;
              
              return (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs font-medium rounded bg-brand-100 text-brand-900 capitalize dark:bg-brand-900/50 dark:text-brand-200"
                >
                  {placementType}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: STATUS_FILTER,
      filteredValue: filteredInfo?.status || null,
      sorter: true,
      sortOrder: sortedInfo?.columnKey === "status" ? sortedInfo.order : null,
      render: (_text: string, record: CmsCategoryValuesInterface) => {
        const categoryId = record.id || (record as any)._id;
        const categorySlug = record.slug || "";
        
        // Check if any pages exist for this category
        const hasPages = categorySlug 
          ? (() => {
              const slugToMatch = categorySlug.toLowerCase().trim();
              const matchFound = allPages.some((page: any) => {
                const pageCategory = (page.category || "").toLowerCase().trim();
                
                if (!pageCategory) return false;
                
                // Exact match
                if (pageCategory === slugToMatch) return true;
                
                // Check if page category starts with the slug followed by a separator
                // e.g., "complaints-and-dispute-resolution" starts with "complaints-"
                if (pageCategory.startsWith(slugToMatch + "-") || pageCategory.startsWith(slugToMatch + "_")) {
                  return true;
                }
                
                // Check if slug starts with page category followed by a separator
                if (slugToMatch.startsWith(pageCategory + "-") || slugToMatch.startsWith(pageCategory + "_")) {
                  return true;
                }
                
                // Also check if they share the same base word (for edge cases)
                // Extract the first word from both and compare
                const slugFirstWord = slugToMatch.split(/[-_]/)[0];
                const pageFirstWord = pageCategory.split(/[-_]/)[0];
                if (slugFirstWord && slugFirstWord === pageFirstWord && slugFirstWord.length > 2) {
                  return true;
                }
                
                return false;
              });
              
              // Debug logging (can be removed later)
              if (categorySlug === "complaints" && !matchFound) {
                console.log("🔍 Debug - Category slug:", categorySlug);
                console.log("🔍 Debug - All pages categories:", allPages.map((p: any) => p.category));
                console.log("🔍 Debug - Matching pages:", allPages.filter((p: any) => {
                  const pc = (p.category || "").toLowerCase().trim();
                  return pc.includes("complaint");
                }).map((p: any) => ({ title: p.title, category: p.category })));
              }
              
              return matchFound;
            })()
          : false;
        
        return (
          <SwitchComponent
            isChecked={record.status !== false}
            disabled={!hasPages} // Disable if no pages exist
            onChange={async (checked) => {
              // Check if trying to activate but no pages exist
              if (checked && !hasPages) {
                showToast("Please add at least one page to activate this category", "error");
                return; // Don't update the status
              }
              
              if (categoryId && hasPages) {
                try {
                  await updateCmsCategoryStatus({ 
                    id: String(categoryId), 
                    status: checked 
                  });
                } catch (error) {
                  console.error("Failed to update status:", error);
                }
              }
            }}
          />
        );
      },
    },
    {
      title: "Updated Date",
      dataIndex: "updatedAt",
      filterDropdown: (
        props: JSX.IntrinsicAttributes & FilterDropdownProps
      ) => <DateFilterDropdownComponent {...props} />,
      filteredValue: filteredInfo?.updatedAt || null,
      sorter: true,
      sortOrder:
        sortedInfo?.columnKey === "updatedAt" ? sortedInfo.order : null,
      render: (updatedAt: string) => (
        <span>{updatedAt ? formatDate(updatedAt) : "-"}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_text: string, record: CmsCategoryValuesInterface) => (
        <ActionFilter
          onEditAction={() => onEditAction(record.id ?? "")}
          isEdit={true}
        />
      ),
    },
  ];

  return (
    <TableContainer
      columns={columns}
      data={data || []}
      emptyText="Data Not Available"
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: datePagination?.total || 0,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} records`,
      }}
      onChange={(pagination, tableFilters, sorter) => {
        setFilteredInfo(tableFilters as Record<string, FilterValue | null>);
        setSortedInfo(sorter as SorterResult<CmsCategoryValuesInterface>);
        const params = {
          name: tableFilters.name || null,
          slug: tableFilters.slug || null,
          placement: tableFilters.placement || null,
          status: tableFilters.status || null,
          updatedAt: tableFilters.updatedAt || null,
          page: pagination.current || 1,
          pageSize: pagination.pageSize || PAGE_LIMIT,
          sortField: Array.isArray(sorter) ? sorter[0]?.field : sorter.field,
          sortOrder: Array.isArray(sorter) ? sorter[0]?.order : sorter.order,
        };
        onPaginationActionHandler(params);
      }}
    />
  );
};

export default TableComponent;
