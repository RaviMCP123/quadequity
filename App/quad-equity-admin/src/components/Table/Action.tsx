import React from "react";
import { Button, Popconfirm, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { ActionButtonProps } from "interface/common";

const ActionButton: React.FC<ActionButtonProps> = ({
  onEditAction,
  onViewAction,
  onDeleteAction,
  isDelete,
  isDeleteDisabled,
  isEdit,
  isView,
  deleteTooltip,
  deleteConfirmTitle,
  showDeleteConfirm = true,
}) => {
  const deleteButton = (
    <Button
      type="link"
      icon={<DeleteOutlined />}
      onClick={onDeleteAction}
      disabled={isDeleteDisabled}
      className={`!border-none !min-w-0 !p-1 ${
        isDeleteDisabled
          ? "!bg-gray-300 !text-gray-500 cursor-not-allowed hover:!bg-gray-300"
          : "!bg-red-500 !text-white hover:!bg-red-600 hover:!opacity-90"
      }`}
    />
  );

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
        isDeleteDisabled ? (
          <Tooltip title={deleteTooltip || "Active categories cannot be deleted"}>
            <span>{deleteButton}</span>
          </Tooltip>
        ) : showDeleteConfirm ? (
          <Popconfirm
            title={deleteConfirmTitle || "Are you sure you want to delete this item?"}
            okText="Yes"
            cancelText="No"
            onConfirm={onDeleteAction}
          >
            <Tooltip title="Delete">
              {deleteButton}
            </Tooltip>
          </Popconfirm>
        ) : (
          <Tooltip title="Delete">{deleteButton}</Tooltip>
        )
      )}
    </div>
  );
};

export default ActionButton;
