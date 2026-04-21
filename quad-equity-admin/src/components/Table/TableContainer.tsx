import React from "react";
import { Table } from "antd";
import type { TableProps } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import HeaderCell from "@components/Table/HeaderCell";
import BodyCell from "@components/Table/BodyCell";
import EmptyFilter from "@components/Table/Empty";
import { ColumnType } from "antd/es/table";

interface TableContainerProps<T> {
  columns: ColumnType<T>[];
  data: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger: boolean;
    pageSizeOptions: string[];
    showTotal: (total: number, range: [number, number]) => string;
  };
  onChange: (
    pagination: import("antd").TablePaginationConfig,
    filters: Record<
      string,
      import("antd/es/table/interface").FilterValue | null
    >,
    sorter:
      | import("antd/es/table/interface").SorterResult<T>
      | import("antd/es/table/interface").SorterResult<T>[],
    extra: import("antd/es/table/interface").TableCurrentDataSource<T>
  ) => void;
  emptyText: React.ReactNode;
  components?: {
    body?: {
      row?: React.ComponentType<{
        index: number;
        moveRow: (dragIndex: number, hoverIndex: number) => void;
        className?: string;
        style?: React.CSSProperties;
        [key: string]: unknown;
      }>;
      cell?: React.ComponentType<React.HTMLAttributes<HTMLTableCellElement>>;
    };
    header?: {
      cell?: React.ComponentType<React.HTMLAttributes<HTMLTableCellElement>>;
    };
  };
  onRow?: (record: T, index?: number) => {
    index: number;
    moveRow: (dragIndex: number, hoverIndex: number) => void;
  };
  rowSelection?: TableRowSelection<T>;
  expandable?: TableProps<T>["expandable"];
  rowKey?: TableProps<T>["rowKey"];
}

function TableContainer<T>({
  columns,
  data,
  pagination,
  onChange,
  emptyText,
  components: customComponents,
  onRow,
  rowSelection,
  expandable,
  rowKey,
}: Readonly<TableContainerProps<T>>) {
  const defaultComponents = {
    header: {
      cell: HeaderCell,
    },
    body: { cell: BodyCell },
  };

  const mergedComponents = customComponents
    ? {
        ...defaultComponents,
        body: {
          ...defaultComponents.body,
          ...customComponents.body,
        },
      }
    : defaultComponents;

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={pagination}
      onChange={onChange}
      rowKey={
        rowKey ??
        ((record: T & { id?: string; _id?: string; key?: string; slug?: string; category?: string }) => {
          // Try to get a string ID first
          let keyValue: string | undefined;
          
          // Check if record has id or _id as string
          if (record.id && typeof record.id === 'string') {
            keyValue = record.id;
          } else if ((record as any)._id && typeof (record as any)._id === 'string') {
            keyValue = (record as any)._id;
          } else if (record.key && typeof record.key === 'string') {
            keyValue = record.key;
          } else if (record.slug && typeof record.slug === 'string') {
            // Use slug as fallback since it's usually unique
            keyValue = record.slug;
          }
          
          // If we have a valid string key, use it
          if (keyValue) {
            return keyValue;
          }
          
          // If id/_id exists but is an object (like Buffer or ObjectId), handle it
          const objId = record.id ?? (record as any)._id ?? record.key;
          if (objId) {
            if (typeof objId === 'object' && objId !== null) {
              // Try to get toString() if available (MongoDB ObjectId)
              if (typeof (objId as any).toString === 'function') {
                const strId = (objId as any).toString();
                // Only use if it's a valid MongoDB ObjectId (24 char hex string)
                if (strId && strId !== '[object Object]' && !strId.includes('Buffer') && /^[0-9a-fA-F]{24}$/.test(strId)) {
                  return strId;
                }
              }
              // For Buffer or other objects, use a combination of unique fields
              const uniqueFields = [
                record.slug,
                record.category,
                (record as any).templateKey
              ].filter(Boolean).join('-');
              
              if (uniqueFields) {
                return `row-${uniqueFields}`;
              }
            }
            // If it's a primitive, convert to string
            return String(objId);
          }
          
          // Final fallback: use combination of fields or generate unique key
          const fallbackKey = [
            record.slug,
            record.category,
            (record as any).templateKey
          ].filter(Boolean).join('-') || `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          return fallbackKey;
        })
      }
      components={mergedComponents}
      size="small"
      sortDirections={["ascend", "descend", "ascend"]}
      locale={{
        emptyText: (
          <EmptyFilter
            title={
              typeof emptyText === "string"
                ? emptyText
                : JSON.stringify(emptyText)
            }
          />
        ),
      }}
      sticky={!data || data.length == 0 ? true : false}
      scroll={data && data.length > 0 ? {  x: "max-content" } : undefined}
      onRow={onRow}
      rowSelection={rowSelection}
      expandable={expandable}
    />
  );
}

export default TableContainer;
