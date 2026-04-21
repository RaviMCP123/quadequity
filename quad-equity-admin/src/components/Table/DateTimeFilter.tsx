import React, { useEffect, useState } from "react";
import { Button, Space, DatePicker } from "antd";
import { DefaultDateTimeFormate } from "@utils/dateFormat";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const DateFilterDropdown: React.FC<{
  setSelectedKeys: (keys: React.Key[]) => void;
  confirm: () => void;
  clearFilters?: () => void;
  selectedKeys?: React.Key[];
}> = ({ setSelectedKeys, confirm, clearFilters, selectedKeys }) => {
  const [value, setValue] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  useEffect(() => {
    if (
      selectedKeys &&
      selectedKeys.length > 0 &&
      typeof selectedKeys[0] === "string"
    ) {
      const [start, end] = selectedKeys[0].split("TO");
      if (start && end) {
        setValue([
          dayjs(start, DefaultDateTimeFormate),
          dayjs(end, DefaultDateTimeFormate),
        ]);
      }
    } else {
      setValue(null);
    }
  }, [selectedKeys]);

  const handleChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setValue(dates);

    const dateArray = dates
      ? dates.map((date) => date?.format(DefaultDateTimeFormate) ?? "")
      : [];

    const filterDate = dateArray.length === 2 ? dateArray.join("TO") : "";
    setSelectedKeys([filterDate]);
    confirm();
  };

  return (
    <div style={{ margin: 8 }}>
      <RangePicker
        value={value}
        format={DefaultDateTimeFormate}
        onChange={handleChange}
        showTime={{ format: "HH:mm" }}
      />
      <Space style={{ marginLeft: 8, marginTop: 8 }}>
        <Button type="primary" onClick={() => confirm()}>
          Apply
        </Button>
        <Button
          onClick={() => {
            setValue(null);
            setSelectedKeys([]);
            clearFilters?.();
            confirm();
          }}
        >
          Reset
        </Button>
      </Space>
    </div>
  );
};
export default DateFilterDropdown;
