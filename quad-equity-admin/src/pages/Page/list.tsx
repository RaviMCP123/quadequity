import React, { useRef, useState } from "react";
import { TableComponentProps, ValuesInterface } from "interface/page";
import { InputRef, Tag } from "antd";
import type { TableColumnType, TablePaginationConfig } from "antd";
import type {
  FilterDropdownProps,
  FilterValue,
  SorterResult,
} from "antd/es/table/interface";
import TableContainer from "@components/Table/TableContainer";
import SearchOutlinedComponent from "@components/Table/SearchOutlined";
import FilterDropdown from "@components/Table/Search";
import HighlighterFilter from "@components/Table/Highlighter";
import DateFilterDropdownComponent from "@components/Table/DateFilterDropdownComponent";
import ActionFilter from "@components/Table/Action";
import { PAGE_LIMIT, PAGE_SIZE, LANGUAGE } from "@utils/constant/common";
import { formatDate } from "@utils/dateFormat";
import { JSX } from "react/jsx-runtime";
type DataIndex = keyof ValuesInterface;

const TableComponent: React.FC<TableComponentProps> = ({
  data,
  datePagination,
  onEditActionHandler,
  onDeleteActionHandler,
  onPaginationActionHandler,
  filteredInfo,
  sortedInfo,
  setFilteredInfo,
  setSortedInfo,
  currentPage,
  pageSize,
  filter,
}) => {
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
  ): TableColumnType<ValuesInterface> => ({
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
      const cellValue = record[dataIndex];
      if (typeof cellValue === "object" && cellValue !== null) {
        const languageValue = cellValue[LANGUAGE as keyof typeof cellValue];
        const text =
          (typeof languageValue === "string"
            ? languageValue
            : String(languageValue)
          ).toLowerCase() || "";
        return text.includes((value as string).toLowerCase());
      }
      return cellValue
        ? cellValue
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
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
    // Ensure we have a valid key (id or _id)
    if (key) {
      onEditActionHandler(key);
    } else {
      console.warn("Edit action called with empty key");
    }
  };

  const onDeleteAction = (key: string) => {
    // Ensure we have a valid key (id or _id)
    if (key && onDeleteActionHandler) {
      onDeleteActionHandler(key);
    } else {
      console.warn("Delete action called with empty key or handler not provided");
    }
  };

  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: false,
      ellipsis: true,
      render: (category: string) => {
        const categoryMap: Record<string, string> = {
          "contact-us": "Contact Us",
          "faq": "FAQ",
          "how-it-works": "How It Works",
        };
        return <span>{categoryMap[category] || category || "-"}</span>;
      },
    },
    {
      title: "Name",
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps("title"),
      sorter: true,
      ellipsis: true,
      filteredValue: filteredInfo?.title || null,
      sortOrder: sortedInfo?.columnKey === "title" ? sortedInfo.order : null,
      render: (title: Record<string, string>) => (
        <span>{title?.[LANGUAGE] || title?.[LANGUAGE] || "-"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: false,
      ellipsis: true,
      render: () => {
        return (
          <Tag color={"darkgreen"} style={{ fontSize: "12px" }}>
            Active
          </Tag>
        );
      },
    },
    {
      title: "Updated Date",
      dataIndex: "updatedAt",
      filterDropdown: (
        props: JSX.IntrinsicAttributes & FilterDropdownProps
      ) => <DateFilterDropdownComponent {...props} />,
      render: (date: string) => {
        return formatDate(date);
      },
      sorter: true,
      ellipsis: true,
      filteredValue: filteredInfo?.updatedAt || null,
      sortOrder:
        sortedInfo?.columnKey === "updatedAt" ? sortedInfo.order : null,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_text: string, record: ValuesInterface) => {
        // Use id or _id (API returns _id)
        const recordId = record.id || (record as any)._id || "";
        return (
          <ActionFilter
            onEditAction={() => onEditAction(recordId)}
            onDeleteAction={() => onDeleteAction(recordId)}
            isDelete={true}
            isEdit={true}
          />
        );
      },
    },
  ];

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<ValuesInterface> | SorterResult<ValuesInterface>[]
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<ValuesInterface>);
    const params = {
      title: filters.title || null,
      updatedAt: filters.updatedAt || null,
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? PAGE_LIMIT,
      sortField: Array.isArray(sorter) ? sorter[0]?.field : sorter.field,
      sortOrder: Array.isArray(sorter) ? sorter[0]?.order : sorter.order,
    };
    onPaginationActionHandler(params);
  };

  return (
    <>
      <TableContainer<ValuesInterface>
        columns={columns}
        data={data}
        rowKey={(record) => {
          // Ensure we always return a unique string key
          // Priority: string id > string _id > slug > category+templateKey > combination
          
          // Check for string id first
          if (record.id && typeof record.id === 'string') {
            return record.id;
          }
          
          // Check for string _id
          const recordAny = record as any;
          if (recordAny._id && typeof recordAny._id === 'string') {
            return recordAny._id;
          }
          
          // Check for string key
          if (recordAny.key && typeof recordAny.key === 'string') {
            return recordAny.key;
          }
          
          // Use slug as it's unique for each page (from API response, each page has a unique slug)
          if (record.slug && typeof record.slug === 'string') {
            return record.slug;
          }
          
          // If id/_id is an object (like Buffer or MongoDB ObjectId)
          const objId = record.id || recordAny._id;
          if (objId && typeof objId === 'object' && objId !== null) {
            // Try toString() method (works for MongoDB ObjectId)
            if (typeof objId.toString === 'function') {
              const strId = objId.toString();
              // Only use if it's a valid MongoDB ObjectId (24 char hex string)
              if (strId && strId !== '[object Object]' && !strId.includes('Buffer') && /^[0-9a-fA-F]{24}$/.test(strId)) {
                return strId;
              }
            }
            
            // For Buffer objects with empty data, use a combination of unique fields
            // This ensures uniqueness even when all buffers are identical
            const uniqueFields = [
              record.slug,
              record.category,
              record.templateKey,
              typeof record.title === 'string' ? record.title : (record.title as any)?.['en'] || (record.title as any)?.[Object.keys(record.title || {})[0]]
            ].filter(Boolean).join('-');
            
            if (uniqueFields) {
              return `page-${uniqueFields}`;
            }
          }
          
          // Final fallback: use category + templateKey or generate a unique key
          const fallbackKey = [
            record.category,
            record.templateKey,
            typeof record.title === 'string' ? record.title : (record.title as any)?.['en'] || (record.title as any)?.[Object.keys(record.title || {})[0]]
          ].filter(Boolean).join('-') || `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          return fallbackKey;
        }}
        emptyText="Data Not Available"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: datePagination?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} records`,
        }}
        onChange={handleTableChange}
      />
    </>
  );
};

export default TableComponent;
