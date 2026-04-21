import React from "react";
import { Empty } from "antd";
import { TitleProps } from "../../interface/common";

const EmptyFilter: React.FC<TitleProps> = ({ title }) => {
  return <Empty description={title} />;
};

export default EmptyFilter;
