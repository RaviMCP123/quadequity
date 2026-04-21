import React from "react";
import { Button } from "antd";
import { DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

interface BulkActionsProps {
  selectedRowKeys: React.Key[];
  onBulkPublish: () => void | Promise<void>;
  onBulkUnpublish: () => void | Promise<void>;
  onBulkDelete: () => void | Promise<void>;
  isLoading?: boolean;
  showPublish?: boolean;
  showUnpublish?: boolean;
  showDelete?: boolean;
  publishLabel?: string;
  unpublishLabel?: string;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedRowKeys,
  onBulkPublish,
  onBulkUnpublish,
  onBulkDelete,
  isLoading = false,
  showPublish = true,
  showUnpublish = true,
  showDelete = true,
  publishLabel = "Publish",
  unpublishLabel = "Unpublish",
}) => {
  if (selectedRowKeys.length === 0) {
    return null;
  }

  const handleBulkPublish = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${publishLabel.toLowerCase()} ${selectedRowKeys.length} item(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${publishLabel}!`,
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      try {
        await onBulkPublish();
        Swal.fire({
          title: "Success!",
          text: `${selectedRowKeys.length} item(s) ${publishLabel.toLowerCase()}ed successfully.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          title: "Error!",
          text: "Failed to update items. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleBulkUnpublish = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${unpublishLabel.toLowerCase()} ${selectedRowKeys.length} item(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${unpublishLabel}!`,
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      try {
        await onBulkUnpublish();
        Swal.fire({
          title: "Success!",
          text: `${selectedRowKeys.length} item(s) ${unpublishLabel.toLowerCase()}d successfully.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          title: "Error!",
          text: "Failed to update items. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert this! This will delete ${selectedRowKeys.length} item(s).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      try {
        await onBulkDelete();
        Swal.fire({
          title: "Deleted!",
          text: `${selectedRowKeys.length} item(s) have been deleted.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete items. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {selectedRowKeys.length} item(s) selected
      </span>
      <div className="flex gap-2">
        {showPublish && (
          <Button
            type="default"
            icon={<CheckCircleOutlined />}
            onClick={handleBulkPublish}
            disabled={isLoading}
            className="!bg-green-500 !text-white hover:!bg-green-600"
          >
            {publishLabel}
          </Button>
        )}
        {showUnpublish && (
          <Button
            type="default"
            icon={<CloseCircleOutlined />}
            onClick={handleBulkUnpublish}
            disabled={isLoading}
            className="!bg-orange-500 !text-white hover:!bg-orange-600"
          >
            {unpublishLabel}
          </Button>
        )}
        {showDelete && (
          <Button
            type="default"
            icon={<DeleteOutlined />}
            onClick={handleBulkDelete}
            disabled={isLoading}
            danger
            className="!bg-red-500 !text-white hover:!bg-red-600"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default BulkActions;

