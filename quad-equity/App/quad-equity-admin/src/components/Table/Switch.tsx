import React from "react";
import { Switch, Tooltip } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { SwitchInterface } from "../../interface/common";

const CustomSwitch: React.FC<SwitchInterface & { disabled?: boolean }> = ({ isChecked, onChange, disabled }) => {
  return (
    <Tooltip
      title={disabled ? "Add at least one page to activate this category" : `Click to ${isChecked ? "DeActive" : "Active"}`}
      placement="top"
    >
      <Switch
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
        size="small"
        checkedChildren={<CheckOutlined />}
        unCheckedChildren={<CloseOutlined />}
        className="!bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 !text-brand-950 hover:!opacity-90"
      />
    </Tooltip>
  );
};

export default CustomSwitch;
