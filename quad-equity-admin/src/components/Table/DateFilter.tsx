import React, { useEffect, useState } from "react";
import { Button, Space, DatePicker } from "antd";
import { DefaultDateFormate } from "@utils/dateFormat";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const disableFutureDates = (current: Dayjs) => {
  return current && current.isAfter(dayjs(), "day");
};
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
          dayjs(start, DefaultDateFormate),
          dayjs(end, DefaultDateFormate),
        ]);
      }
    } else {
      setValue(null);
    }
  }, [selectedKeys]);

  const handleChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setValue(dates);

    const dateArray = dates
      ? dates.map((date) => date?.format(DefaultDateFormate) ?? "")
      : [];

    const filterDate = dateArray.length === 2 ? dateArray.join("TO") : "";
    setSelectedKeys([filterDate]);
    confirm();
  };

  return (
    <div style={{ margin: 8 }}>
      <RangePicker
        value={value}
        format={DefaultDateFormate}
        onChange={handleChange}
        disabledDate={disableFutureDates}
      />
      <Space style={{ marginLeft: 8, marginTop: 8 }}>
        <Button
          onClick={() => {
            setValue(null);
            setSelectedKeys([]);
            clearFilters?.();
            confirm();
          }}
          className="!bg-gradient-to-r from-red-600 via-red-500 to-red-400 !text-white !border-none hover:!opacity-90"
        >
          Reset
        </Button>
      </Space>
    </div>
  );
};
export default DateFilterDropdown;
