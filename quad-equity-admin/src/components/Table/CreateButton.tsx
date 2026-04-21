import React from "react";
import { Button } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";

interface CreateButtonProps {
  handleClickAction: () => void;
  show: boolean;
  title: string;
}

const CreateButton: React.FC<CreateButtonProps> = ({
  handleClickAction,
  show,
  title,
}) => {
  if (!show) return null;

  return (
    <Button
      size="small"
      style={{
        marginRight: 10,
        marginBottom: 16,
        backgroundColor: "#7592ff",
      }}
      type="primary"
      onClick={handleClickAction}
      icon={<PlusCircleOutlined />}
    >
      {title}
    </Button>
  );
};

export default CreateButton;
