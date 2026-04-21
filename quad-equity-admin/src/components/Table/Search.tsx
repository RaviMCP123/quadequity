import React from "react";
import { Button, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { FilterDropdownProps } from "antd/es/table/interface";
import type { InputRef } from "antd";

interface FilterDropdownPropsExtended extends FilterDropdownProps {
  dataIndex: string;
  searchInput: React.RefObject<InputRef>;
  handleSearch: (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: string
  ) => void;
  handleReset: (clearFilters: () => void) => void;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  setSearchedColumn: React.Dispatch<React.SetStateAction<string>>;
}

const FilterDropdown: React.FC<FilterDropdownPropsExtended> = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  close,
  dataIndex,
  searchInput,
  handleSearch,
  handleReset,
  setSearchText,
  setSearchedColumn,
}) => (
  <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
    <Input
      ref={searchInput}
      placeholder={`Search by keyword`}
      value={selectedKeys[0]}
      onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
      onPressEnter={() =>
        handleSearch(selectedKeys as string[], confirm, dataIndex)
      }
      style={{ marginBottom: 8, display: "block" }}
    />
    <Space>
      <Button
        type="primary"
        onClick={() =>
          handleSearch(selectedKeys as string[], confirm, dataIndex)
        }
        icon={<SearchOutlined />}
        size="small"
        style={{ width: 90 }}
        className="!bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 !text-brand-950 hover:!opacity-90"
      >
        Search
      </Button>
      <Button
        onClick={() => {
          if (clearFilters) handleReset(clearFilters);
          confirm({ closeDropdown: false });
          setSearchText("");
          setSearchedColumn("");
          close();
        }}
        size="small"
        style={{ width: 90 }}
        className="!bg-gradient-to-r from-red-600 via-red-500 to-red-400 !text-white !border-none hover:!opacity-90"
      >
        Reset
      </Button>
      <Button
        type="link"
        size="small"
        onClick={() => {
          close();
        }}
        className="!bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 !text-brand-950 hover:!opacity-90 "
      >
        Close
      </Button>
    </Space>
  </div>
);

export default FilterDropdown;
