import React from "react";
import { Button } from "antd";

interface IconButtonProps {
  handleButtonAction: () => void;
  title: string;
  icon: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({
  handleButtonAction,
  title,
  icon,
}) => {
  return (
    <Button
      type="default"
      icon={icon}
      onClick={handleButtonAction}
      className="!mb-4 !mr-2 !rounded-lg !border-0 !bg-brand-500 !px-4 !py-2.5 !text-sm !font-medium !text-white !shadow-sm hover:!bg-brand-600 focus:!shadow-none dark:!bg-brand-500 dark:hover:!bg-brand-600"
    >
      {title}
    </Button>
  );
};

export default IconButton;
