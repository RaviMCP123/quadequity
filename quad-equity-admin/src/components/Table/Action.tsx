import React from "react";
import { Button, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { ActionButtonProps } from "interface/common";

const ActionButton: React.FC<ActionButtonProps> = ({
  onEditAction,
  onViewAction,
  onDeleteAction,
  isDelete,
  isEdit,
  isView,
}) => {
  return (
    <div className="inline-flex items-center gap-2">
      {isEdit && (
        <Tooltip title="View/Edit Details">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={onEditAction}
            className="!bg-gradient-to-r from-[#c9a962] via-[#b08d4a] to-[#8f733c] !text-[#0e1a2b] hover:!opacity-90 !min-w-0 !p-1"
          />
        </Tooltip>
      )}

      {isView && (
        <Tooltip title="View Details">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={onViewAction}
            className="!bg-gradient-to-r from-[#1a2738] via-[#0e1a2b] to-[#152032] !text-[#f2efe8] hover:!opacity-90 !min-w-0 !p-1"
          />
        </Tooltip>
      )}

      {isDelete && (
        <Tooltip title="Delete">
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={onDeleteAction}
            className="!bg-red-500 !text-white hover:!bg-red-600 !border-none hover:!opacity-90 !min-w-0 !p-1"
          />
        </Tooltip>
      )}
    </div>
  );
};

export default ActionButton;
